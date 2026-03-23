export interface ChatRequest {
  message: string;     // 改为单数形式
  session_id: string;
}

export interface ChatResponse {
  // 根据实际 AI 接口返回的数据结构调整
  data: any;
  message?: string;
  success: boolean;
}

export interface HistoryMessage {
  content: string;
  type: string;
  name?: string;
  id?: string;
}

export interface HistoryResponse {
  messages: HistoryMessage[];
}
