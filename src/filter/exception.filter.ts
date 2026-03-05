import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from 'generated/prisma/client';

type NormalizedResponse = {
  message: string;
  code?: string;
  details?: unknown;
};

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    /**
     * Prisma已知错误
     */
    const prismaMapped = this.mapPrismaException(exception);
    if (prismaMapped) {
      const { status, body } = prismaMapped;
      this.logger.warn(
        `${req.method} ${req.url} ${status} | PRISMA:${body.code ?? '-'} | ${body.message}`,
      );
      return res.status(status).json({
        status,
        timestamp: new Date().toISOString(),
        path: req.url,
        ...body,
      });
    }

    // 其他错误处理
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const raw =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const normalized = this.normalizeHttpExceptionResponse(raw);

    const requestInfo = {
      query: req.query,
      params: req.params,
      body: this.sanitizeBody(req.body as Record<string, any>),
      ip: req.ip,
      user: req.user ?? null,
    };

    /**
     * 403 和 401报错的处理
     * 清空存储 token 的cookie
     */
    if (
      (status === 401 &&
        ['REFRESH_TOKEN_EXPIRED', 'REFRESH_TOKEN_INVALID'].includes(
          normalized.code as string,
        )) ||
      status === 403
    ) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
      };
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
    }

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} ${status} | Request: ${JSON.stringify(requestInfo)}`,
        (exception as Error).stack,
      );
    } else {
      this.logger.warn(
        `${req.method} ${req.url} ${status} - ${JSON.stringify(normalized)} | Request: ${JSON.stringify(requestInfo)}`,
      );
    }

    res.status(status).json({
      status: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: normalized.message,
      code: normalized.code,
      // 保留原始信息用于日志和调试
      details:
        process.env.NODE_ENV === 'production' ? undefined : normalized.details,
    });
  }

  private sanitizeBody(body: Record<string, any>) {
    if (!body) return {};
    const santized = { ...body };
    const sensitiveFields = ['password', 'refreshToken', 'token', 'secret'];
    for (const field of sensitiveFields) {
      if (field in santized) {
        santized[field] = '***';
      }
    }
    return santized;
  }

  private normalizeHttpExceptionResponse(raw: unknown): NormalizedResponse {
    // 1.raw为string的情况
    if (typeof raw === 'string') {
      return { message: raw };
    }
    // 2. raw为Object的情况
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;

      const msg = obj.message;
      const message =
        typeof msg === 'string'
          ? msg
          : Array.isArray(msg)
            ? msg.filter((m) => typeof m === 'string').join('; ')
            : typeof obj.error === 'string'
              ? obj.error
              : 'Request failed';
      const code = typeof obj.code === 'string' ? obj.code : undefined;

      // 保留原始信息用于日志和调试
      return { message, code, details: raw };
    }

    // 3.其他情况
    return { message: 'Internal Error', details: raw };
  }

  private mapPrismaException(exception: unknown): {
    status: number;
    body: NormalizedResponse;
  } | null {
    if (!(exception instanceof Prisma.PrismaClientKnownRequestError))
      return null;

    switch (exception.code) {
      case 'P2002':
        // 唯一冲突 unique数据重复时发生
        return {
          status: 400,
          body: { message: '数据已存在', code: 'PRISMA_UNIQUE_CONSTRAINT' },
        };
      case 'P2003':
        // 外键约束出现问题
        return {
          status: 400,
          body: {
            message: '关联数据不存在或关联失败',
            code: 'PRISMA_FOREIGN_KEY_CONSTRAINT',
          },
        };
      case '2025':
        // 目标不存在
        return {
          status: 404,
          body: { message: '资源不存在', code: 'PRISMA_RECORD_NOT_FOUND' },
        };
      default:
        return {
          status: 500,
          body: { message: '数据库操作失败', code: `PRISMA_${exception.code}` },
        };
    }
  }
}
