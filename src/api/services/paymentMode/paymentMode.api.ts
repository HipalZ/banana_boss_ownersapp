import { apiClient } from '@/api/client';
import type { PaymentMode } from './paymentMode.types';

export const paymentModeApi = {
  list(outletId: string): Promise<PaymentMode[]> {
    return apiClient.get(`/r/payment-modes?outletId=${outletId}`);
  },
  create(payload: { outletId: string; name: string; status: boolean }): Promise<PaymentMode> {
    return apiClient.post('/r/payment-modes', payload);
  },
  updateStatus(id: string, payload: { status: boolean }): Promise<PaymentMode> {
    return apiClient.patch(`/r/payment-modes/${id}`, payload);
  },
};
