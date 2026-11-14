export type FeedbackChoice = 'EXCELLENT' | 'GOOD' | 'COULD BE BETTER';

export interface FeedbackItem {
  id: string;
  customerName: string;
  customerPhone: string;
  tableName: string;
  visitAt: number;
  respondedAt: number | null;
  choice: FeedbackChoice | null;
  rating: number | null;
  description: string;
  categories: string[];
}

export interface FeedbackPage {
  items: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface FeedbackParams {
  outletId: string;
  from: number;
  to: number;
  search?: string;
  responseChoice?: FeedbackChoice;
  page?: number;
  limit?: number;
}

export interface FeedbackSummary {
  responses: number;
  excellent: number;
  good: number;
  couldBeBetter: number;
}
