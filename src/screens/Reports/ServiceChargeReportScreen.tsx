import React, { useMemo, useCallback } from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useServiceChargeReport } from '@/queries/reports';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ReportTable, ReportSummary } from '@/components/shared';
import { colors, fonts } from '@/theme';

export function ServiceChargeReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const { data, isLoading, isError, refetch } = useServiceChargeReport(outletId, dateRange.from, dateRange.to);

  const columns = useMemo(() => ['Charge type', 'Amount'], []);
  const charges = data?.data?.[0];
  const serviceCharge = Number(charges?.serviceCharge ?? 0);
  const containerCharge = Number(charges?.containerCharge ?? 0);
  const deliveryCharge = Number(charges?.deliveryCharge ?? 0);
  const totalCharges = serviceCharge + containerCharge + deliveryCharge;

  const rows = useMemo(
    () => charges ? [
      ['Service Charge', serviceCharge],
      ['Container Charge', containerCharge],
      ['Delivery Charge', deliveryCharge],
    ] : [],
    [charges, serviceCharge, containerCharge, deliveryCharge],
  );
  const summaryRows = useMemo(() => charges ? [{ ...charges, total: totalCharges }] : [], [charges, totalCharges]);

  const handleDateChange = useCallback(
    (r: any) => { setDateRange(r); },
    [setDateRange],
  );

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={refetch}>
      <TopBar title="Service & Other Charges" showBack onBack={() => navigation.goBack()} />
      <DateRangePicker value={dateRange} onChange={handleDateChange} outletId={outletId} />
      <Text style={{ fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.text.muted, marginTop: 10 }}>
        Paid and partially paid bills. Net Sales Summary counts fully paid orders excluding dues and settlements.
      </Text>
      <ReportSummary
        data={summaryRows}
        isLoading={isLoading}
        metrics={[
          { label: 'Bills in scope', fields: ['totalBills'], format: 'number', icon: 'file-text' },
          { label: 'Service Charge', fields: ['serviceCharge'], format: 'currency', icon: 'bell', tone: 'success' },
          { label: 'Container', fields: ['containerCharge'], format: 'currency', icon: 'box' },
          { label: 'Delivery', fields: ['deliveryCharge'], format: 'currency', icon: 'truck' },
          { label: 'Total Charges', fields: ['total'], format: 'currency', icon: 'trending-up', tone: 'success' },
        ]}
      />
      <ReportTable columns={columns} rows={rows} totalRow={charges ? ['TOTAL', totalCharges] : undefined} isLoading={isLoading} isError={isError} onRetry={refetch} downloadReportId="service-charge" outletId={outletId} from={dateRange.from} to={dateRange.to} />
    </ScreenWrapper>
  );
}
