import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ChatRequest,
  ChatResponse,
  HistoryMessage,
} from './interfaces/chat.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger();
  private readonly aiUrl =
    process.env.AI_API_BASE_URL || 'http://localhost:8002';

  /**
   * 调用 AI Chat 接口（支持流式响应）
   * @param messages 消息内容
   * @param session_id 会话ID
   * @returns Promise<Response> 返回 fetch Response 对象，支持流式处理
   */
  async chat(message: string, session_id: string): Promise<Response> {
    const payload: ChatRequest = {
      message,
      session_id,
    };

    const response = await fetch(`${this.aiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `AI chat request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response;
  }

  /**
   * 调用 AI Chat 接口并获取 JSON 响应
   * @param messages 消息内容
   * @param session_id 会话ID
   * @returns Promise<ChatResponse>
   */
  async chatJson(message: string, session_id: string): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      let fullContent = '';

      this.chatStream(message, session_id, (chunk) => {
        // 解析 SSE 格式的数据
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // 移除 'data: ' 前缀
            if (data === '[DONE]') {
              // 流结束，返回完整响应
              resolve({
                success: true,
                data: { content: fullContent },
                message: 'Success',
              });
              return;
            } else {
              // 累加内容
              fullContent += data;
            }
          }
        }
      }).catch(reject);
    });
  }

  /**
   * 调用 AI Chat 接口并处理流式响应
   * @param messages 消息内容
   * @param session_id 会话ID
   * @param onChunk 处理每个数据块的回调函数
   * @returns Promise<void>
   */
  async chatStream(
    message: string,
    session_id: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const response = await this.chat(message, session_id);

    if (!response.body) {
      throw new InternalServerErrorException('AI response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 获取 RAG 历史对话记录
   * @param session_id 会话ID
   * @returns Promise<HistoryMessage[]> 历史对话消息数组
   */
  async getHistory(session_id: string): Promise<HistoryMessage[]> {
    const response = await fetch(`${this.aiUrl}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id }),
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `Failed to get history: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.messages as HistoryMessage[];
  }
}
