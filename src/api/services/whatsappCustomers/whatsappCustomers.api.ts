import { apiClient } from '@/api/client';
import type {
  WhatsappCustomerParams,
  WhatsappCustomersResponse,
  WhatsappIntegrationConfig,
} from './whatsappCustomers.types';

export const whatsappCustomersApi = {
  getIntegration(outletId: string): Promise<WhatsappIntegrationConfig | null> {
    return apiClient.get(`/integrations/buzbiz/config?outletId=${encodeURIComponent(outletId)}`);
  },

  list(params: WhatsappCustomerParams): Promise<WhatsappCustomersResponse> {
    const query = new URLSearchParams({
      outletId: params.outletId,
      page: String(params.page || 1),
      limit: String(params.limit || 20),
      customerType: params.customerType || 'ALL',
      sort: params.sort || 'RECENT',
    });
    if (params.from) query.set('from', String(params.from));
    if (params.to) query.set('to', String(params.to));
    if (params.search) query.set('search', params.search);
    if (params.tableName) query.set('tableName', params.tableName);
    return apiClient.get(`/integrations/buzbiz/customers?${query.toString()}`);
  },
};
