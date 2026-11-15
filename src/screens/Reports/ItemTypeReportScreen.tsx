import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useItemTypeReport } from '@/queries/reports';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ReportTable, ReportSummary, PaginationBar } from '@/components/shared';

export function ItemTypeReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const [page, setPage] = useState(1);
  React.useEffect(() => setPage(1), [outletId]);
  const { data, isLoading, isError, refetch } = useItemTypeReport(outletId, dateRange.from, dateRange.to, page);

  const columns = useMemo(() => ['Type', 'Qty', 'Gross', 'Tax', 'Total'], []);

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((row: any) => [
        row.itemType ?? row.type ?? '-',
        row.quantity ?? 0,
        row.gross ?? row.grossAmount ?? 0,
        row.tax ?? row.gst ?? 0,
        row.total ?? 0,
      ]),
    [data],
  );

  const handleDateChange = useCallback((r: any) => { setDateRange(r); setPage(1); }, [setDateRange]);

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={refetch}>
      <TopBar title="Item Type Report" showBack onBack={() => navigation.goBack()} />
      <DateRangePicker value={dateRange} onChange={handleDateChange} outletId={outletId} />
      <ReportSummary
        data={data?.data}
        isLoading={isLoading}
        totals={data?.totals}
        totalCount={data?.pagination?.totalRecords}
        metrics={[
          { label: 'Item Types', count: true, icon: 'tag' },
          { label: 'Qty Sold', fields: ['quantity'], totalsKey: 'quantity', format: 'number', icon: 'package' },
          { label: 'Gross', fields: ['gross', 'grossAmount'], totalsKey: 'grossAmount', format: 'currency', icon: 'dollar-sign', tone: 'success' },
          { label: 'Tax', fields: ['tax', 'gst'], totalsKey: 'totalTax', format: 'currency', icon: 'briefcase' },
          { label: 'Net Total', fields: ['total'], totalsKey: 'totalSales', format: 'currency', icon: 'trending-up', tone: 'success' },
        ]}
        chart={{ title: 'Sales by type (this page)', labelFields: ['itemType', 'type'], valueFields: ['total'], format: 'currency' }}
      />
      <ReportTable columns={columns} rows={rows} isLoading={isLoading} isError={isError} onRetry={refetch} downloadReportId="item-type" outletId={outletId} from={dateRange.from} to={dateRange.to} />
      {data?.pagination && <PaginationBar pagination={data.pagination} onPageChange={setPage} />}
    </ScreenWrapper>
  );
}
