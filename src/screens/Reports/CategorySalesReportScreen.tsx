import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useCategoryReport } from '@/queries/reports';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ReportTable, ReportSummary, PaginationBar } from '@/components/shared';

export function CategorySalesReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const [page, setPage] = useState(1);
  React.useEffect(() => setPage(1), [outletId]);
  const { data, isLoading, isError, refetch } = useCategoryReport(outletId, dateRange.from, dateRange.to, page);

  const columns = useMemo(
    () => ['Category', 'Count', 'Qty', 'Gross', 'Discount', 'Tax', 'Total', 'Contribution%'],
    [],
  );

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((row: any) => [
        row.categoryName ?? row.category ?? '-',
        row.categoryCount ?? row.count ?? 0,
        row.quantity ?? 0,
        row.grossAmount ?? row.gross ?? 0,
        row.discount ?? 0,
        row.totalTax ?? row.tax ?? row.gst ?? 0,
        row.totalSales ?? row.total ?? 0,
        row.contribution ?? row.contributionPercent ?? 0,
      ]),
    [data],
  );

  const handleDateChange = useCallback((r: any) => { setDateRange(r); setPage(1); }, [setDateRange]);

  return (
    <ScreenWrapper
      scrollable
      refreshControl
      onRefresh={refetch}
      header={<TopBar title="Category Sales Report" showBack onBack={() => navigation.goBack()} />}
    >
      <DateRangePicker value={dateRange} onChange={handleDateChange} outletId={outletId} />
      <ReportSummary
        data={data?.data}
        isLoading={isLoading}
        totals={data?.totals}
        totalCount={data?.pagination?.totalRecords}
        metrics={[
          { label: 'Categories', count: true, icon: 'grid' },
          { label: 'Qty Sold', fields: ['quantity'], totalsKey: 'quantity', format: 'number', icon: 'package' },
          { label: 'Gross', fields: ['grossAmount', 'gross'], totalsKey: 'grossAmount', format: 'currency', icon: 'dollar-sign', tone: 'success' },
          { label: 'Discount', fields: ['discount'], totalsKey: 'discount', format: 'currency', icon: 'percent', tone: 'danger' },
          { label: 'Tax', fields: ['totalTax', 'gst', 'tax'], totalsKey: 'totalTax', format: 'currency', icon: 'briefcase' },
          { label: 'Net Total', fields: ['totalSales', 'total'], totalsKey: 'totalSales', format: 'currency', icon: 'trending-up', tone: 'success' },
        ]}
        chart={{ title: 'Top categories (this page)', labelFields: ['categoryName', 'category'], valueFields: ['totalSales', 'total'], format: 'currency' }}
      />
      <ReportTable columns={columns} rows={rows} isLoading={isLoading} isError={isError} onRetry={refetch} downloadReportId="category" outletId={outletId} from={dateRange.from} to={dateRange.to} />
      {data?.pagination && <PaginationBar pagination={data.pagination} onPageChange={setPage} />}
    </ScreenWrapper>
  );
}
