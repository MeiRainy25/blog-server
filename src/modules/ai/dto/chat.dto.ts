import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    description: '消息内容',
    example: '你好，请介绍一下自己',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: '会话ID，用于标识对话上下文',
    example: 'session-123',
  })
  @IsString()
  session_id: string;
}

export class HistoryRequestDto {
  @ApiProperty({
    description: '会话ID，用于获取指定会话的历史记录',
    example: 'session-123',
  })
  @IsString()
  session_id: string;
}
