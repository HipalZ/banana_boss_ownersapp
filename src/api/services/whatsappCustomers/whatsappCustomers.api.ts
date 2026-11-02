import { apiClient } from '@/api/client';
import { API_BASE_URL, API_SERVER_SECRET, SERVER_SECRET } from '@/config/env';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type {
  WhatsappCustomerParams,
  WhatsappCustomersResponse,
  WhatsappIntegrationConfig,
} from './whatsappCustomers.types';

function customerQuery(params: WhatsappCustomerParams, includePagination = true) {
  const query = new URLSearchParams({
    outletId: params.outletId,
    customerType: params.customerType || 'ALL',
    sort: params.sort || 'RECENT',
  });
  if (includePagination) {
    query.set('page', String(params.page || 1));
    query.set('limit', String(params.limit || 20));
  }
  if (params.from) query.set('from', String(params.from));
  if (params.to) query.set('to', String(params.to));
  if (params.search) query.set('search', params.search);
  if (params.tableName) query.set('tableName', params.tableName);
  return query;
}

function apiHeaders() {
  return {
    'server-secret': SERVER_SECRET || '',
    'api-server-secret': API_SERVER_SECRET || '',
  };
}

function filenameFromContentDisposition(header: string | null) {
  if (!header) return null;
  const encodedMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) return decodeURIComponent(encodedMatch[1].replace(/"/g, ''));
  const plainMatch = header.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] || null;
}

async function downloadCustomersXlsx(url: string) {
  const fallbackName = 'whatsapp-customers.xlsx';

  if (Platform.OS === 'web') {
    const response = await fetch(url, { headers: apiHeaders() });
    if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}.`);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filenameFromContentDisposition(response.headers.get('Content-Disposition')) || fallbackName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return;
  }

  const fileUri = `${FileSystem.cacheDirectory}${fallbackName}`;
  const result = await FileSystem.downloadAsync(url, fileUri, { headers: apiHeaders() });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
    dialogTitle: fallbackName,
  });
}

export const whatsappCustomersApi = {
  getIntegration(outletId: string): Promise<WhatsappIntegrationConfig | null> {
    return apiClient.get(`/integrations/buzbiz/config?outletId=${encodeURIComponent(outletId)}`);
  },

  list(params: WhatsappCustomerParams): Promise<WhatsappCustomersResponse> {
    const query = customerQuery(params);
    return apiClient.get(`/integrations/buzbiz/customers?${query.toString()}`);
  },

  downloadXlsx(params: WhatsappCustomerParams): Promise<void> {
    const query = customerQuery(params, false);
    return downloadCustomersXlsx(
      `${API_BASE_URL}/integrations/buzbiz/customers-xlsx?${query.toString()}`,
    );
  },
};
