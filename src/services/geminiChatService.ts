export interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

export interface ChatContextPayload {
  userName?: string;
  verifiedOrders?: any[];
  verifiedProducts?: any[];
  activePolicies?: any;
  targetOrder?: any;
  returnReceipt?: any;
  escalationTicket?: any;
  taskComplexity?: 'fast' | 'general' | 'complex';
}

export interface GeminiChatResponse {
  text: string;
  modelUsed?: string;
  fallback?: boolean;
}

export class GeminiChatService {
  /**
   * Calls the server-side Gemini multi-turn endpoint (/api/chat)
   */
  static async sendMessage(
    message: string,
    history: ChatHistoryTurn[] = [],
    context: ChatContextPayload = {}
  ): Promise<GeminiChatResponse | null> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
          context,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data && data.text && !data.fallback) {
        return {
          text: data.text,
          modelUsed: data.modelUsed,
        };
      }
      return null;
    } catch (err) {
      console.warn('Could not contact /api/chat, falling back to deterministic engine:', err);
      return null;
    }
  }
}
