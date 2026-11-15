import React, { useState, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useBillWiseReport } from '@/queries/reports';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ReportTable, ReportSummary, PaginationBar } from '@/components/shared';

export function BillWiseReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useBillWiseReport(outletId, dateRange.from, dateRange.to, page);

  const columns = useMemo(
    () => ['Invoice #', 'Date', 'Customer', 'Table', 'Waiter', 'Payment', 'Subtotal', 'Discount', 'Tax', 'Total'],
    [],
  );

  const flatData = useMemo(
    () =>
      (data?.data ?? []).map((row: any) => {
        const bill = row.bill ?? row;
        return {
          invoiceNumber: bill.invoiceNumber,
          paymentMethod: bill.paymentMethod,
          subtotal: bill.subtotal ?? 0,
          discount: bill.discountTotal ?? bill.discount ?? 0,
          tax: bill.totalTax ?? bill.tax ?? 0,
          payable: bill.payable ?? bill.total ?? 0,
          userName: row.userName ?? bill.customerName,
          tableName: row.tableName,
          waiterName: row.waiterName,
          createdAt: bill.createdAt,
        };
      }),
    [data],
  );

  const rows = useMemo(
    () =>
      flatData.map((r) => [
        r.invoiceNumber ?? '-',
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-',
        r.userName ?? '-',
        r.tableName ?? '-',
        r.waiterName ?? '-',
        r.paymentMethod ?? '-',
        r.subtotal,
        r.discount,
        r.tax,
        r.payable,
      ]),
    [flatData],
  );

  const totalRow = useMemo(
    () =>
      data?.totals
        ? ['TOTAL', '', '', '', '', '', data.totals.subtotal, data.totals.discount, data.totals.tax, data.totals.total]
        : undefined,
    [data],
  );

  const handleDateChange = useCallback(
    (r: any) => { setDateRange(r); setPage(1); },
    [setDateRange],
  );

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={refetch}>
      <TopBar title="Bill-wise Report" showBack onBack={() => navigation.goBack()} />
      <DateRangePicker value={dateRange} onChange={handleDateChange} outletId={outletId} />
      <ReportSummary
        data={flatData}
        isLoading={isLoading}
        totals={data?.totals}
        totalCount={data?.pagination?.totalRecords}
        metrics={[
          { label: 'Bills', count: true, icon: 'file-text' },
          { label: 'Subtotal', fields: ['subtotal'], totalsKey: 'subtotal', format: 'currency', icon: 'dollar-sign' },
          { label: 'Discount', fields: ['discount'], totalsKey: 'discount', format: 'currency', icon: 'percent', tone: 'danger' },
          { label: 'Tax', fields: ['tax'], totalsKey: 'tax', format: 'currency', icon: 'briefcase' },
          { label: 'Net Revenue', fields: ['payable'], totalsKey: 'total', format: 'currency', icon: 'trending-up', tone: 'success' },
        ]}
        chart={{ title: 'Top tables by revenue', labelFields: ['tableName'], valueFields: ['payable'], format: 'currency' }}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        totalRow={totalRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        downloadReportId="bill-wise"
        outletId={outletId}
        from={dateRange.from}
        to={dateRange.to}
      />
      {data?.pagination && (
        <PaginationBar pagination={data.pagination} onPageChange={setPage} />
      )}
    </ScreenWrapper>
  );
}
