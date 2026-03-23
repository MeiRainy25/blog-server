import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AiService } from './ai.service';
import { ChatRequestDto, HistoryRequestDto } from './dto/chat.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({
    summary: 'AI Chat 接口',
  })
  @ApiResponse({
    status: 200,
    description: '流式响应 - 返回 SSE 格式数据',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example: 'data: 你好\ndata: 我是AI助手\ndata: [DONE]',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'JSON响应 - 返回聚合的完整内容',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                content: { type: 'string', example: '你好我是AI助手' },
              },
            },
            message: { type: 'string', example: 'Success' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '服务器内部错误',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'AI chat request failed' },
        error: { type: 'string', example: 'Error details' },
        statusCode: { type: 'number', example: 500 },
      },
    },
  })
  @Post('chat')
  async chat(
    @Body() body: ChatRequestDto,
    @Res() res: Response,
    @Headers('accept') accept?: string,
  ) {
    try {
      const { message, session_id } = body;
      // 检查客户端是否接受流式响应
      const isStreaming =
        accept?.includes('text/event-stream') ||
        accept?.includes('application/x-ndjson');

      if (isStreaming) {
        // 设置流式响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // 禁用 nginx 缓冲

        // 直接转发流式响应
        await this.aiService.chatStream(message, session_id, (chunk) => {
          res.write(chunk);
        });

        res.end();
      } else {
        // 非流式响应，获取完整 JSON 后转发
        const response = await this.aiService.chatJson(message, session_id);
        res.json(response);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      throw new HttpException(
        {
          message: 'AI chat request failed',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    summary: '获取 RAG 历史对话',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取历史对话记录',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string', example: '你好，请介绍一下自己' },
              type: { type: 'string', example: 'human' },
              name: { type: 'string', example: 'User', nullable: true },
              id: { type: 'string', example: 'msg-123', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '服务器内部错误',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Failed to get AI chat history' },
        error: { type: 'string', example: 'Error details' },
        statusCode: { type: 'number', example: 500 },
      },
    },
  })
  @Post('history')
  async getHistory(@Body() body: HistoryRequestDto) {
    try {
      const { session_id } = body;
      const history = await this.aiService.getHistory(session_id);
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      console.error('AI history error:', error);
      throw new HttpException(
        {
          message: 'Failed to get AI chat history',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
