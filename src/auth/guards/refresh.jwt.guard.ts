import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class RefreshJwtGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      // Token过期
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: 'RefreshToken 已过期',
          code: 'REFRESH_TOKEN_EXPIRED',
        });
      }

      // 其他情况
      throw new UnauthorizedException({
        message: '未授权或 RefreshToken 无效',
        code: 'REFRESH_TOKEN_INVALID',
      });
    }

    return user as TUser;
  }
}
