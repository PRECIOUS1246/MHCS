import { config } from '../config';

export interface AIAnalyticsRequest {
  userId?: string;
  text?: string;
  moodScores?: number[];
  assessmentScores?: number[];
}

export interface AIAnalyticsResponse {
  sentiment?: string;
  riskScore?: number;
  recommendations?: string[];
  status: string;
}

export const fetchAIAnalytics = async (
  endpoint: string,
  data: AIAnalyticsRequest
): Promise<AIAnalyticsResponse | null> => {
  try {
    const response = await fetch(`${config.aiServiceUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) return null;
    return (await response.json()) as AIAnalyticsResponse;
  } catch {
    console.warn('AI service unavailable, skipping analytics');
    return null;
  }
};
