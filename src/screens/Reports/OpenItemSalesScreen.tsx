import React, { useState, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useOpenItemReport } from '@/queries/reports';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ReportTable, ReportSummary, PaginationBar } from '@/components/shared';

export function OpenItemSalesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useOpenItemReport(outletId, dateRange.from, dateRange.to, page);

  const columns = useMemo(() => ['Item Name', 'Qty', 'Gross', 'Discount', 'Tax', 'Total'], []);

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((row: any) => [
        row.itemName ?? '-',
        row.quantity ?? 0,
        row.gross ?? row.grossAmount ?? 0,
        row.discount ?? 0,
        row.tax ?? row.gst ?? 0,
        row.total ?? 0,
      ]),
    [data],
  );

  const handleDateChange = useCallback(
    (r: any) => { setDateRange(r); setPage(1); },
    [setDateRange],
  );

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={refetch}>
      <TopBar title="Open Item Sales" showBack onBack={() => navigation.goBack()} />
      <DateRangePicker value={dateRange} onChange={handleDateChange} outletId={outletId} />
      <ReportSummary
        data={data?.data}
        isLoading={isLoading}
        totals={data?.totals}
        totalCount={data?.pagination?.totalRecords}
        metrics={[
          { label: 'Open Items', count: true, icon: 'unlock' },
          { label: 'Qty', fields: ['quantity'], totalsKey: 'quantity', format: 'number', icon: 'package' },
          { label: 'Gross', fields: ['gross', 'grossAmount'], totalsKey: 'gross', format: 'currency', icon: 'dollar-sign', tone: 'success' },
          { label: 'Discount', fields: ['discount'], totalsKey: 'discount', format: 'currency', icon: 'percent', tone: 'danger' },
          { label: 'Tax', fields: ['tax', 'gst'], totalsKey: 'tax', format: 'currency', icon: 'briefcase' },
          { label: 'Net Total', fields: ['total'], totalsKey: 'total', format: 'currency', icon: 'trending-up', tone: 'success' },
        ]}
        chart={{ title: 'Top open items (this page)', labelFields: ['itemName'], valueFields: ['total'], format: 'currency' }}
      />
      <ReportTable columns={columns} rows={rows} isLoading={isLoading} isError={isError} onRetry={refetch} downloadReportId="open-item-sale" outletId={outletId} from={dateRange.from} to={dateRange.to} />
      {data?.pagination && <PaginationBar pagination={data.pagination} onPageChange={setPage} />}
    </ScreenWrapper>
  );
}
