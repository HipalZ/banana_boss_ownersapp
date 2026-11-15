import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useAreaReport } from '@/queries/reports';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ReportTable, PaginationBar } from '@/components/shared';

export function AreaReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const [page, setPage] = useState(1);
  React.useEffect(() => setPage(1), [outletId]);
  const { data, isLoading, isError, refetch } = useAreaReport(outletId, dateRange.from, dateRange.to, page);

  const columns = useMemo(() => ['Area', 'Bills', 'Qty', 'Gross', 'Tax', 'Total'], []);

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((row: any) => [
        row.areaName ?? '-',
        row.billCount ?? 0,
        row.quantity ?? 0,
        row.gross ?? 0,
        row.tax ?? 0,
        row.total ?? 0,
      ]),
    [data],
  );

  const handleDateChange = useCallback((r: any) => { setDateRange(r); setPage(1); }, [setDateRange]);

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={refetch}>
      <TopBar title="Area Report" showBack onBack={() => navigation.goBack()} />
      <DateRangePicker value={dateRange} onChange={handleDateChange} outletId={outletId} />
      <ReportTable columns={columns} rows={rows} isLoading={isLoading} isError={isError} onRetry={refetch} downloadReportId="area" outletId={outletId} from={dateRange.from} to={dateRange.to} />
      {data?.pagination && <PaginationBar pagination={data.pagination} onPageChange={setPage} />}
    </ScreenWrapper>
  );
}
