import {
  AIChatAssistantRequest,
  AIChatAssistantResponse,
  AIOptimizeBulletRequest,
  AIOptimizeBulletResponse,
  AIScoreInsightRequest,
  AIScoreInsightResponse,
  AIApiError,
} from '@/lib/aiTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AIApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'AI request failed',
          statusCode: response.status,
        } as AIApiError;
      }

      return data;
    } catch (error) {
      if ((error as AIApiError).message) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      } as AIApiError;
    }
  }

  async scoreInsight(
    accessToken: string,
    payload: AIScoreInsightRequest,
  ): Promise<AIScoreInsightResponse> {
    return this.request<AIScoreInsightResponse>('/ai/score-insight', accessToken, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async optimizeBullet(
    accessToken: string,
    payload: AIOptimizeBulletRequest,
  ): Promise<AIOptimizeBulletResponse> {
    return this.request<AIOptimizeBulletResponse>('/ai/optimize-bullet', accessToken, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async chatAssistant(
    accessToken: string,
    payload: AIChatAssistantRequest,
  ): Promise<AIChatAssistantResponse> {
    return this.request<AIChatAssistantResponse>('/ai/chat-assistant', accessToken, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const aiApi = new AIApiService(API_BASE_URL);
