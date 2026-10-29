export type WhatsappCustomerType = 'ALL' | 'NEW' | 'RETURNING';
export type WhatsappCustomerSort = 'RECENT' | 'MOST_SCANS' | 'NAME' | 'FIRST_SEEN';

export interface WhatsappIntegrationConfig {
  outletId: string;
  enabled: boolean;
  buzbizBusinessId: string;
  buzbizPhoneNumberId: string;
  whatsappPhoneNumber: string;
}

export interface WhatsappCustomer {
  id: string;
  name: string;
  phone: string;
  lastSeenAt: number;
  scansInRange: number;
  lastTableName: string;
  customerType: Exclude<WhatsappCustomerType, 'ALL'>;
}

export interface WhatsappCustomerSummary {
  totalCustomers: number;
  totalScans: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface WhatsappCustomersResponse {
  items: WhatsappCustomer[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  summary: WhatsappCustomerSummary;
  from: number;
  to: number;
}

export interface WhatsappCustomerParams {
  outletId: string;
  from?: number;
  to?: number;
  search?: string;
  tableName?: string;
  customerType?: WhatsappCustomerType;
  sort?: WhatsappCustomerSort;
  page?: number;
  limit?: number;
}
