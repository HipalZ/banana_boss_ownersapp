import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/services/reports/reports.api';
import { queryKeys } from '@/queries/queryKeys';

function getReportStaleTime(_from: number, to: number): number {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  if (to < todayMidnight.getTime()) return Infinity;
  return 3 * 60 * 1000;
}

export function useNetSalesReport(outletId: string | null, from: number, to: number) {
  return useQuery({
    queryKey: queryKeys.reports.netSales(outletId, from, to),
    queryFn: () => reportsApi.getNetSalesSummary(outletId!, from, to),
    staleTime: getReportStaleTime(from, to),
    placeholderData: keepPreviousData,
    enabled: !!outletId && !!from && !!to,
  });
}

export function useBillWiseReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.billWise(outletId, from, to, page),
    queryFn: () => reportsApi.getBillWiseFlat(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useItemReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.item(outletId, from, to, page),
    queryFn: () => reportsApi.getItemSales(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useCategoryReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.category(outletId, from, to, page),
    queryFn: () => reportsApi.getCategorySales(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useParentCategoryReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.parentCategory(outletId, from, to, page),
    queryFn: () => reportsApi.getParentCategorySales(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useAddonReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.addon(outletId, from, to, page),
    queryFn: () => reportsApi.getAddonWiseSales(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useItemTypeReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.itemType(outletId, from, to, page),
    queryFn: () => reportsApi.getItemTypeSales(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useItemVariantReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.itemVariant(outletId, from, to, page),
    queryFn: () => reportsApi.getItemVariantSales(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useAreaReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.area(outletId, from, to, page),
    queryFn: () => reportsApi.getAreaReport(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useAreaItemReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.areaItem(outletId, from, to, page),
    queryFn: () => reportsApi.getAreaItemSaleReport(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useDiscountReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.discount(outletId, from, to, page),
    queryFn: () => reportsApi.getDiscountReport(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useServiceChargeReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.serviceCharge(outletId, from, to, page),
    queryFn: () => reportsApi.getServiceChargeReport(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useTableReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.table(outletId, from, to, page),
    queryFn: () => reportsApi.getTableWiseSales(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useDeletedKotReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.deletedKot(outletId, from, to, page),
    queryFn: () => reportsApi.getDeletedKotSummary(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useTransferKotReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.transferKot(outletId, from, to, page),
    queryFn: () => reportsApi.getTransferKotSummary(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useTransferTableReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.transferTable(outletId, from, to, page),
    queryFn: () => reportsApi.getTransferTableSummary(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useOutstandingDuesReport(outletId: string | null) {
  return useQuery({
    queryKey: queryKeys.reports.outstandingDues(outletId),
    queryFn: () => reportsApi.getOutstandingDues(outletId!),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled: !!outletId,
  });
}

export function useOpenItemReport(outletId: string | null, from: number, to: number, page = 1) {
  return useQuery({
    queryKey: queryKeys.reports.openItem(outletId, from, to, page),
    queryFn: () => reportsApi.getOpenItemSales(outletId!, from, to, { page }),
    staleTime: getReportStaleTime(from, to),
    enabled: !!outletId && !!from && !!to,
  });
}

export function useChargeReport(outletId: string | null, from: number, to: number) {
  return useQuery({
    queryKey: queryKeys.reports.charge(outletId, from, to),
    queryFn: () => reportsApi.getExtraChargeReport(outletId!, from, to),
    staleTime: getReportStaleTime(from, to),
    placeholderData: keepPreviousData,
    enabled: !!outletId && !!from && !!to,
  });
}
