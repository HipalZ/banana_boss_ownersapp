import { apiClient } from '@/api/client';
import type { ReportPagination } from '@/types/common';
import { API_BASE_URL, SERVER_SECRET, API_SERVER_SECRET } from '@/config/env';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

function reportQuery(
  outletId: string,
  from: number,
  to: number,
  page?: number,
  limit?: number,
): string {
  const params = new URLSearchParams({
    outletId,
    from: String(from),
    to: String(to),
  });
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  return params.toString();
}

export const REPORT_XLSX_ENDPOINTS = {
  category: '/r/reports/category-xlsx',
  'parent-category': '/r/reports/parent-category-xlsx',
  item: '/r/reports/item-xlsx',
  addon: '/r/reports/addon-xlsx',
  'item-variant': '/r/reports/item-variant-xlsx',
  discount: '/r/reports/discount-xlsx',
  'deleted-kot': '/r/reports/deleted-kot-xlsx',
  'transfer-kot': '/r/reports/transfer-kot-xlsx',
  'transfer-table': '/r/reports/transfer-table-xlsx',
  table: '/r/reports/table-xlsx',
  charge: '/r/reports/charge-xlsx',
  'item-type': '/r/reports/item-type-xlsx',
  'service-charge': '/r/reports/service-charge-xlsx',
  'net-sale': '/r/reports/net-sale-xlsx',
  'sale-report': '/r/reports/sale-report-xlsx',
  'bill-list': '/r/reports/sale-report-xlsx',
  consolidated: '/r/reports/consolidated-xlsx',
  variant: '/r/reports/variant-xlsx',
  area: '/r/reports/area-xlsx',
  'area-item-sale': '/r/reports/area-item-xlsx',
  'bill-wise': '/r/reports/sale-report-xlsx',
  'open-item-sale': '/r/reports/open-item-xlsx',
} as const;

export type ReportXlsxId = keyof typeof REPORT_XLSX_ENDPOINTS;

export const REPORT_XLSX_FILENAMES: Record<ReportXlsxId, string> = {
  category: 'category-report.xlsx',
  'parent-category': 'parent-category-report.xlsx',
  item: 'item-report.xlsx',
  addon: 'addon-report.xlsx',
  'item-variant': 'item-variant-report.xlsx',
  discount: 'discount-report.xlsx',
  'deleted-kot': 'deleted-kot-report.xlsx',
  'transfer-kot': 'transfer-kot-report.xlsx',
  'transfer-table': 'transfer-table-report.xlsx',
  table: 'table-report.xlsx',
  charge: 'charge-report.xlsx',
  'item-type': 'item-type-report.xlsx',
  'service-charge': 'service-charge-report.xlsx',
  'net-sale': 'net-sale-report.xlsx',
  'sale-report': 'sale-report.xlsx',
  'bill-list': 'bill-list-report.xlsx',
  consolidated: 'consolidated-report.xlsx',
  variant: 'variant-report.xlsx',
  area: 'area-report.xlsx',
  'area-item-sale': 'area-item-report.xlsx',
  'bill-wise': 'bill-wise-report.xlsx',
  'open-item-sale': 'open-item-report.xlsx',
};

function filenameFromEndpoint(endpoint: string): string {
  const segment = endpoint.split('/').pop() ?? 'report';
  const slug = segment.replace(/-xlsx$/i, '').replace(/[^a-z0-9-]/gi, '-');
  return `${slug}-report.xlsx`;
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const encodedMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) return decodeURIComponent(encodedMatch[1].replace(/"/g, ''));
  const plainMatch = header.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] ? plainMatch[1] : null;
}

function buildXlsxUrl(endpoint: string, outletId: string, from?: number, to?: number) {
  const params = new URLSearchParams({ outletId });
  if (from !== undefined) params.append('from', String(from));
  if (to !== undefined) params.append('to', String(to));
  return `${API_BASE_URL}${endpoint}?${params.toString()}`;
}

function apiHeaders() {
  return {
    'server-secret': SERVER_SECRET || '',
    'api-server-secret': API_SERVER_SECRET || '',
  };
}

async function downloadWebXlsx(url: string, fallbackName: string) {
  const response = await fetch(url, { headers: apiHeaders() });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  const blob = await response.blob();
  const serverFilename = filenameFromContentDisposition(response.headers.get('Content-Disposition'));
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = serverFilename?.trim() || fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

async function downloadNativeXlsx(url: string, filename: string) {
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  const result = await FileSystem.downloadAsync(url, fileUri, { headers: apiHeaders() });
  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
    dialogTitle: filename,
  });
}

export interface ReportResponse<T = any> {
  data: T[];
  pagination?: ReportPagination;
  totals?: Record<string, number | string>;
  summary?: Record<string, any>;
}

// The backend wraps every response as:
//   ApiResponse.data = [{ outletId, outletname, from, to, <namedField>: [...] }]
// After apiClient strips the outer envelope we get that array.
// Each helper below extracts the correct named field into { data: [] }.
/**
 * The backend returns canonical field names (grossAmount, totalTax, totalSales,
 * contribution, categoryName, itemName, areaName, tableName, …) but the report
 * screens historically read short aliases (gross, tax, total, category, …).
 * Normalise each row so both the screens and any future code find the value —
 * we only FILL missing keys, never overwrite a value the server already sent.
 */
function normalizeReportRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const out: any = { ...row };
  const fill = (key: string, ...candidates: any[]) => {
    if (out[key] == null) {
      const v = candidates.find((c) => c != null);
      if (v != null) out[key] = v;
    }
  };

  // Numeric aliases
  fill('gross', row.grossAmount);
  fill('grossAmount', row.gross);
  fill('tax', row.totalTax, row.gst);
  fill('totalTax', row.tax, row.gst);
  fill('total', row.totalSales, row.amount, row.net);
  fill('totalSales', row.total, row.amount);
  fill('net', row.totalSales, row.total);
  fill('count', row.categoryCount, row.billCount, row.orderCount);
  fill('quantity', row.qty);
  fill('contribution', row.contributionPercent);
  fill('contributionPercent', row.contribution);

  // Name aliases
  fill('category', row.categoryName);
  fill('parentCategory', row.parentCategoryName, row.categoryName);
  fill('item', row.itemName);
  fill('area', row.areaName);
  fill('table', row.tableName);
  fill('itemType', row.itemTypeName);
  fill('addonName', row.addOnName);
  fill('variantName', row.variant);

  return out;
}

function extractField<T>(raw: any[], field: string): ReportResponse<T> {
  const first = Array.isArray(raw) ? (raw[0] ?? {}) : raw ?? {};
  const arr = first[field];
  const data = Array.isArray(arr) ? arr : arr != null ? [arr] : [];
  return {
    data: data.map(normalizeReportRow) as T[],
    pagination: first.pagination,
    totals: first.totals,
    summary: first.summary,
  };
}

export const reportsApi = {
  // Net-sales returns a nested object — consumed as a raw array by NetSalesSummaryScreen
  getNetSalesSummary(outletId: string, from: number, to: number): Promise<any[]> {
    return apiClient.get(`/r/reports/sales/net-summary?${reportQuery(outletId, from, to)}`);
  },

  // bills: [{ bill: { invoiceNumber, payable, paymentMethod, ... }, userName, tableName, waiterName }]
  async getBillWiseFlat(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/sales/bill-wise?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    return extractField(raw, 'bills');
  },

  // items: [{ itemName, quantity, discountAmount, gross, tax, total, ... }]
  async getItemSales(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/item?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    return extractField(raw, 'items');
  },

  // openItems: [{ itemName, quantity, gross, discount, tax, total }]
  async getOpenItemSales(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/open-item?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    return extractField(raw, 'openItems');
  },

  // categories: [{ category, count, quantity, gross, discount, tax, total, contributionPercent }]
  async getCategorySales(outletId: string, from: number, to: number): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/category?${reportQuery(outletId, from, to)}`);
    return extractField(raw, 'categories');
  },

  // parentCategories: [{ parentCategory, count, quantity, gross, discount, tax, total }]
  async getParentCategorySales(outletId: string, from: number, to: number): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/parent-category?${reportQuery(outletId, from, to)}`);
    return extractField(raw, 'parentCategories');
  },

  // discounts: [{ discountName, count, amount }]
  async getDiscountReport(outletId: string, from: number, to: number): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/discount?${reportQuery(outletId, from, to)}`);
    return extractField(raw, 'discounts');
  },

  // serviceCharge: [{ invoiceNumber, serviceCharge, containerCharge, deliveryCharge, total }]
  async getServiceChargeReport(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/service-charge?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    return extractField(raw, 'serviceCharge');
  },

  // addons: [{ addonName, quantity, amount, totalSales }]
  async getAddonWiseSales(outletId: string, from: number, to: number): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/addon?${reportQuery(outletId, from, to)}`);
    return extractField(raw, 'addons');
  },

  // rows: [{ kotId, itemName, quantity, amount, reason, createdAt }]
  async getDeletedKotSummary(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/deleted-kot?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    return extractField(raw, 'rows');
  },

  // transfers: [{ kotId, fromTable, toTable, itemNames, createdAt }]
  async getTransferKotSummary(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/transfer-kot?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    return extractField(raw, 'transfers');
  },

  // transfers: [{ fromTable, toTable, itemNames, createdAt }]
  async getTransferTableSummary(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/transfer-table?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    return extractField(raw, 'transfers');
  },

  // tables: [{ tableName, billCount, quantity, gross, tax, total }]
  async getTableWiseSales(outletId: string, from: number, to: number): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/table?${reportQuery(outletId, from, to)}`);
    return extractField(raw, 'tables');
  },

  // charges: full charge object — wrapped in array for consistency
  async getExtraChargeReport(outletId: string, from: number, to: number): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/charge?${reportQuery(outletId, from, to)}`);
    return extractField(raw, 'charges');
  },

  // itemTypes: [{ itemType, quantity, gross, tax, total }]
  async getItemTypeSales(outletId: string, from: number, to: number): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/item-type?${reportQuery(outletId, from, to)}`);
    return extractField(raw, 'itemTypes');
  },

  // itemVariants: [{ itemName, variantName, addonNames, quantity, gross, tax, total }]
  async getItemVariantSales(outletId: string, from: number, to: number): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/item-variant?${reportQuery(outletId, from, to)}`);
    return extractField(raw, 'itemVariants');
  },

  // areas: [{ areaName, quantity, grossAmount, discount, totalTax, totalSales, contribution }]
  async getAreaReport(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/area/summary?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    return extractField(raw, 'areas');
  },

  // Nested response: areas: [{ areaName, items: [{ itemName, variantName, quantity, grossAmount, totalTax, totalSales, categoryName }] }]
  // → flatten to one row per (area, item).
  async getAreaItemSaleReport(outletId: string, from: number, to: number, opts?: { page?: number; limit?: number }): Promise<ReportResponse> {
    const raw = await apiClient.get<any>(`/r/reports/area/item-sales?${reportQuery(outletId, from, to, opts?.page, opts?.limit)}`);
    const first = Array.isArray(raw) ? (raw[0] ?? {}) : raw ?? {};
    const areas = Array.isArray(first.areas) ? first.areas : [];
    const data = areas.flatMap((a: any) =>
      (Array.isArray(a.items) ? a.items : []).map((it: any) =>
        normalizeReportRow({ ...it, areaName: a.areaName }),
      ),
    );
    return { data, pagination: first.pagination };
  },

  // outstandingDues: [{ customerName, phone, amount, status }]
  async getOutstandingDues(outletId: string): Promise<ReportResponse> {
    const raw = await apiClient.get<any[]>(`/r/reports/dues/outstanding?outletId=${outletId}`);
    return extractField(raw, 'outstandingDues');
  },

  downloadReportXlsx(reportId: ReportXlsxId, outletId: string, from?: number, to?: number) {
    const endpoint = REPORT_XLSX_ENDPOINTS[reportId];
    return this.downloadXlsx(endpoint, outletId, from, to, REPORT_XLSX_FILENAMES[reportId]);
  },

  async downloadXlsx(endpoint: string, outletId: string, from?: number, to?: number, filename?: string) {
    const finalName = filename?.trim() || filenameFromEndpoint(endpoint);
    const url = buildXlsxUrl(endpoint, outletId, from, to);

    if (Platform.OS === 'web') {
      await downloadWebXlsx(url, finalName);
      return;
    }

    await downloadNativeXlsx(url, finalName);
  },
};
