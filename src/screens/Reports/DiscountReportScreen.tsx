import React, { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useDiscountReport } from '@/queries/reports';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ReportTable, ReportSummary } from '@/components/shared';

export function DiscountReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const { data, isLoading, isError, refetch } = useDiscountReport(outletId, dateRange.from, dateRange.to);

  const columns = useMemo(() => [
    'Discount', 'Scope', 'Affected Items', 'Rule', 'Invoice', 'Bill Date & Time', 'Table', 'Qty',
    'Original Amount', 'Discount Amount', 'Final Amount', 'Grand Bill Total', 'Effective %',
    'Payment', 'Reason', 'Applied By', 'Applied At',
  ], []);

  const currency = (value: unknown) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dateTime = (value: unknown) => value ? new Date(Number(value)).toLocaleString('en-IN') : '—';

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((row: any) => {
        const names = [...new Set<string>((row.affectedItemNames || []).filter(Boolean).map(String))];
        const affected = `${row.affectedItems || names.length || 0} items${names.length ? `\n${names.slice(0, 2).join('\n')}` : ''}${names.length > 2 ? `\n+${names.length - 2} more` : ''}`;
        return [
          row.discountName ?? '—', row.scope ?? '—', affected, row.rule ?? '—', row.invoiceNumber ?? '—',
          dateTime(row.billDateTime), row.tableName ?? '—', row.quantity ?? '—', currency(row.originalAmount),
          currency(row.discountAmount), currency(row.finalAmount), currency(row.grandBillTotal),
          `${Number(row.effectiveDiscountPercent || 0).toFixed(2)}%`, row.paymentMethod ?? '—',
          row.reason ?? '—', row.appliedBy ?? '—', dateTime(row.appliedAt),
        ];
      }),
    [data],
  );

  const rowDetails = useMemo(() => (data?.data ?? []).map((row: any) => row.allocations?.length ? ({
    title: `Allocation breakdown · ${row.invoiceNumber || 'Bill'}`,
    columns: ['Invoice', 'Item', 'Qty', 'Original', 'Allocated Discount', 'Final', 'Allocation %'],
    rows: row.allocations.map((allocation: any) => [
      allocation.invoiceNumber || '—', allocation.itemName || '—', allocation.quantity || '—',
      currency(allocation.originalAmount), currency(allocation.discountAmount), currency(allocation.finalAmount),
      `${Number(allocation.allocationPercent || 0).toFixed(2)}%`,
    ]),
  }) : undefined), [data]);

  const totalRow = useMemo(() => {
    const summary: any = data?.summary || {};
    return ['TOTAL', `${summary.applicationCount || rows.length} applications`, `${summary.itemCount || 0} items`,
      `${summary.ruleCount || 0} rules`, `${summary.invoiceCount || 0} invoices`, '', `${summary.tableCount || 0} tables`,
      summary.totalQuantity || 0, currency(summary.totalOriginalAmount), currency(summary.totalDiscount),
      currency(summary.totalFinalAmount), currency(summary.totalGrandBillTotal),
      `${Number(summary.effectiveDiscountPercent || 0).toFixed(2)}%`, `${summary.paymentMethodCount || 0} methods`,
      `${summary.reasonCount || 0} reasons`, `${summary.staffCount || 0} staff`, ''];
  }, [data, rows.length]);

  const handleDateChange = useCallback((r: any) => setDateRange(r), [setDateRange]);

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={refetch}>
      <TopBar title="Discount Report" showBack onBack={() => navigation.goBack()} />
      <DateRangePicker value={dateRange} onChange={handleDateChange} outletId={outletId} />
      <ReportSummary
        data={data?.data}
        isLoading={isLoading}
        metrics={[
          { label: 'Applications', fields: ['discountAmount'], count: true, icon: 'percent' },
          { label: 'Original Value', fields: ['originalAmount'], format: 'currency', icon: 'hash' },
          { label: 'Total Given', fields: ['discountAmount'], format: 'currency', icon: 'trending-down', tone: 'danger' },
        ]}
        chart={{ title: 'Top discounts', labelFields: ['discountName'], valueFields: ['discountAmount'], format: 'currency' }}
      />
      <ReportTable columns={columns} rows={rows} rowDetails={rowDetails} totalRow={totalRow} isLoading={isLoading} isError={isError} onRetry={refetch} downloadReportId="discount" outletId={outletId} from={dateRange.from} to={dateRange.to} />
    </ScreenWrapper>
  );
}
