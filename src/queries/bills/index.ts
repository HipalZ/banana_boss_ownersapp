import { useQuery } from '@tanstack/react-query';
import { billsApi } from '@/api/services/bills/bills.api';
import { queryKeys } from '@/queries/queryKeys';
import type { BillsListFilters } from '@/api/services/bills/bills.types';

export function useBillsDashboardQuery(
  outletId: string | null,
  from: number,
  to: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.bills.dashboard(outletId, from, to),
    queryFn: () => billsApi.getDashboard(outletId!, from, to),
    enabled: !!outletId && !!from && !!to && enabled,
  });
}

export function useBillsListQuery(
  outletId: string | null,
  from: number,
  to: number,
  page: number,
  limit: number,
  filters?: BillsListFilters,
  enabled?: boolean,
) {
  return useQuery({
    queryKey: queryKeys.bills.list(outletId, from, to, page, limit, filters ?? {}),
    queryFn: () => billsApi.getList(outletId!, from, to, page, limit, filters),
    enabled: !!outletId && !!from && !!to && (enabled !== false),
  });
}

export function useBillByIdQuery(billId: string | null) {
  return useQuery({
    queryKey: queryKeys.bills.byId(billId),
    queryFn: () => billsApi.getDetail(billId!),
    enabled: !!billId,
  });
}

export function useBillJourneyQuery(billId: string | null) {
  return useQuery({
    queryKey: ['bills', 'journey', billId],
    queryFn: () => billsApi.getBillJourney(billId!),
    enabled: !!billId,
  });
}

/** KOT statuses that count as "currently running" on a table (not finalised). */
export const RUNNING_KOT_STATUSES = ['PLACED', 'PREPARING', 'READY', 'SERVED'];

export function useRunningTablesQuery(outletId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.bills.runningTables(outletId),
    queryFn: () => billsApi.getRunningTables(outletId!),
    enabled: !!outletId && enabled,
  });
}

/** Lazily fetch the KOTs for one running table (only when a table is selected). */
export function useTableKotsQuery(
  outletId: string | null,
  tableId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.bills.tableKots(outletId, tableId),
    queryFn: () => billsApi.getTableKots(outletId!, tableId!),
    enabled: !!outletId && !!tableId,
    staleTime: 30_000,
  });
}

/** Lazily fetch the line items for a single KOT. */
export function useKotItemsQuery(kotId: string | null) {
  return useQuery({
    queryKey: queryKeys.bills.kotItems(kotId),
    queryFn: () => billsApi.getKotItems(kotId!),
    enabled: !!kotId,
    staleTime: 30_000,
  });
}
