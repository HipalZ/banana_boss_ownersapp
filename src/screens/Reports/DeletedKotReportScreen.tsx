import React, { useState, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useDeletedKotReport } from '@/queries/reports';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ReportTable, ReportSummary, PaginationBar } from '@/components/shared';

export function DeletedKotReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useDeletedKotReport(outletId, dateRange.from, dateRange.to, page);

  const columns = useMemo(() => ['KOT ID', 'Item', 'Qty', 'Amount', 'Reason', 'Date'], []);

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((row: any) => [
        row.kotId ?? '-',
        row.itemName ?? '-',
        row.quantity ?? 0,
        row.amount ?? 0,
        row.reason ?? '-',
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
      ]),
    [data],
  );

  const handleDateChange = useCallback(
    (r: any) => { setDateRange(r); setPage(1); },
    [setDateRange],
  );

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={refetch}>
      <TopBar title="Deleted KOT Report" showBack onBack={() => navigation.goBack()} />
      <DateRangePicker value={dateRange} onChange={handleDateChange} outletId={outletId} />
      <ReportSummary
        data={data?.data}
        isLoading={isLoading}
        totalCount={data?.pagination?.totalRecords}
        metrics={[
          { label: 'Deleted KOTs', count: true, icon: 'trash-2', tone: 'danger' },
          { label: 'Amount Lost', fields: ['amount'], format: 'currency', icon: 'alert-circle', tone: 'danger' },
        ]}
        chart={{ title: 'Top deleted items by amount', labelFields: ['itemName'], valueFields: ['amount'], format: 'currency' }}
      />
      <ReportTable columns={columns} rows={rows} isLoading={isLoading} isError={isError} onRetry={refetch} downloadReportId="deleted-kot" outletId={outletId} from={dateRange.from} to={dateRange.to} />
      {data?.pagination && <PaginationBar pagination={data.pagination} onPageChange={setPage} />}
    </ScreenWrapper>
  );
}
