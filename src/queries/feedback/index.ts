import { useQuery } from '@tanstack/react-query';
import { feedbackApi } from '@/api/services/feedback/feedback.api';
import type { FeedbackParams } from '@/api/services/feedback/feedback.types';

export function useFeedbackPage(params: FeedbackParams | null, enabled: boolean) {
  return useQuery({
    queryKey: ['feedback', 'page', params],
    queryFn: () => feedbackApi.list(params!),
    enabled: enabled && !!params?.outletId,
  });
}

export function useFeedbackSummary(params: FeedbackParams | null, enabled: boolean) {
  return useQuery({
    queryKey: ['feedback', 'summary', params?.outletId, params?.from, params?.to, params?.search],
    queryFn: () => feedbackApi.summary(params!),
    enabled: enabled && !!params?.outletId,
  });
}
