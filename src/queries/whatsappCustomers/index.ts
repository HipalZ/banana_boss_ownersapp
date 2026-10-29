import { useQuery } from '@tanstack/react-query';
import { whatsappCustomersApi } from '@/api/services/whatsappCustomers/whatsappCustomers.api';
import type { WhatsappCustomerParams } from '@/api/services/whatsappCustomers/whatsappCustomers.types';

export function useWhatsappIntegrationQuery(outletId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['whatsapp-customers', 'integration', outletId],
    queryFn: () => whatsappCustomersApi.getIntegration(outletId!),
    enabled: enabled && !!outletId,
  });
}

export function useWhatsappCustomersQuery(
  params: WhatsappCustomerParams | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['whatsapp-customers', 'list', params],
    queryFn: () => whatsappCustomersApi.list(params!),
    enabled: enabled && !!params?.outletId,
  });
}
