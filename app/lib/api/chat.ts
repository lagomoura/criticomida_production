import { fetchApi } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  response: string;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
): Promise<string> {
  const data = await fetchApi<ChatResponse>('/api/chat', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ message, history }),
  });
  return data.response;
}
