import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { apiClient } from '@/api/client';
import { API_BASE_URL, API_SERVER_SECRET, SERVER_SECRET } from '@/config/env';
import type { FeedbackChoice, FeedbackPage, FeedbackParams, FeedbackSummary } from './feedback.types';

function query(params: FeedbackParams, includePagination = true, choice = params.responseChoice) {
  const result = new URLSearchParams({
    outletId: params.outletId,
    from: String(params.from),
    to: String(params.to),
    responseState: 'responded',
  });
  if (params.search) result.set('search', params.search);
  if (choice) result.set('responseChoice', choice);
  if (includePagination) {
    result.set('page', String(params.page || 1));
    result.set('limit', String(params.limit || 20));
  }
  return result;
}

const headers = () => ({
  'server-secret': SERVER_SECRET || '',
  'api-server-secret': API_SERVER_SECRET || '',
});

export const feedbackApi = {
  list(params: FeedbackParams) {
    return apiClient.get<FeedbackPage>(`/integrations/buzbiz/reviews/history?${query(params)}`);
  },

  async summary(params: FeedbackParams): Promise<FeedbackSummary> {
    const choices: FeedbackChoice[] = ['EXCELLENT', 'GOOD', 'COULD BE BETTER'];
    const countParams = { ...params, page: 1, limit: 1 };
    const [all, ...pages] = await Promise.all([
      apiClient.get<FeedbackPage>(`/integrations/buzbiz/reviews/history?${query({ ...countParams, responseChoice: undefined })}`),
      ...choices.map((choice) => apiClient.get<FeedbackPage>(`/integrations/buzbiz/reviews/history?${query(countParams, true, choice)}`)),
    ]);
    const [excellent, good, couldBeBetter] = pages.map((page) => page.total);
    return { responses: all.total, excellent, good, couldBeBetter };
  },

  async downloadXlsx(params: FeedbackParams): Promise<void> {
    const url = `${API_BASE_URL}/integrations/buzbiz/reviews/history-xlsx?${query(params, false)}`;
    const filename = `customer-feedback-${new Date().toISOString().slice(0, 10)}.xlsx`;
    if (Platform.OS === 'web') {
      const response = await fetch(url, { headers: headers() });
      if (!response.ok) throw new Error(`Excel download failed (${response.status}).`);
      const objectUrl = window.URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
      return;
    }
    const file = await FileSystem.downloadAsync(url, `${FileSystem.cacheDirectory}${filename}`, { headers: headers() });
    if (file.status !== 200) throw new Error(`Excel download failed (${file.status}).`);
    if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is unavailable on this device.');
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
      dialogTitle: filename,
    });
  },
};
