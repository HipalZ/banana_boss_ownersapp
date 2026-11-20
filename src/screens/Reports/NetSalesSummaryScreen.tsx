import React, { useMemo, useCallback, useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, View, Text } from 'react-native';
import { MotiView } from 'moti';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useNetSalesReport } from '@/queries/reports';
import { useCurrency } from '@/hooks/useCurrency';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, MetricCard, LoadingSkeleton, ErrorState, SectionHeader } from '@/components/shared';
import { reportsApi } from '@/api/services/reports/reports.api';
import { colors, fonts, radii } from '@/theme';
import { aggregateNetSalesTotals } from './netSalesTotals';

export function NetSalesSummaryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId } = useOutlet();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: rawList = [], isLoading, isError, refetch } = useNetSalesReport(
    outletId,
    dateRange.from,
    dateRange.to,
  );
  const { format } = useCurrency();

  const totals = useMemo(() => aggregateNetSalesTotals(rawList as any[]), [rawList]);

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);
  const handleDownload = useCallback(async () => {
    if (!outletId) return;

    setIsDownloading(true);
    try {
      await reportsApi.downloadReportXlsx('net-sale', outletId, dateRange.from, dateRange.to);
    } catch (error) {
      Alert.alert(
        'Download failed',
        error instanceof Error ? error.message : 'Failed to download Excel report. Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  }, [outletId, dateRange.from, dateRange.to]);

  const metricCards = useMemo(
    () => [
      { title: 'Orders', value: String(totals.totalOrders), icon: 'shopping-bag', tone: 'default' as const },
      { title: 'Subtotal', value: format(totals.subtotal), icon: 'file-text', tone: 'success' as const },
      { title: 'Discount', value: format(totals.discount), icon: 'percent', tone: 'danger' as const },
      { title: 'Complimentary', value: format(totals.complementary), icon: 'gift', tone: 'muted' as const },
      { title: 'GST', value: format(totals.gst), icon: 'briefcase', tone: 'default' as const },
      { title: 'Service Charge', value: format(totals.serviceCharge), icon: 'bell', tone: 'default' as const },
      { title: 'Tips', value: format(totals.tips), icon: 'smile', tone: 'default' as const },
      { title: 'Round Off', value: format(totals.roundOff), icon: 'plus-circle', tone: 'default' as const },
      { title: 'Total Sales', value: format(totals.totalSales), icon: 'dollar-sign', tone: 'success' as const },
      { title: 'Net Sales', value: format(totals.netSales), icon: 'trending-up', tone: 'success' as const },
    ],
    [totals, format],
  );

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={handleRefresh} horizontalPadding={8}>
      <TopBar title="Net Sales Summary" showBack onBack={() => navigation.goBack()} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
        <DateRangePicker value={dateRange} onChange={(r) => { setDateRange(r); }} outletId={outletId} />
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={!outletId || isLoading || rawList.length === 0 || isDownloading}
          onPress={handleDownload}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            minHeight: 36,
            paddingHorizontal: 12,
            borderRadius: radii.chip,
            backgroundColor: colors.primary,
            borderWidth: 1,
            borderColor: colors.primaryDark,
            opacity: !outletId || isLoading || rawList.length === 0 || isDownloading ? 0.45 : 1,
          }}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={colors.text.onAccent} />
          ) : (
            <Icon name="download" size={15} color={colors.text.onAccent} />
          )}
          <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.text.onAccent, textTransform: 'uppercase' }}>
            {isDownloading ? 'Downloading' : 'Excel'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && <LoadingSkeleton type="metric-card" count={6} />}
      {isError && !isLoading && <ErrorState onRetry={handleRefresh} />}

      {!isLoading && !isError && rawList.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <SectionHeader title="Sales Breakdown" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            {metricCards.map((card, i) => (
              <MotiView
                key={card.title}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 350, delay: i * 50 }}
                style={{ width: '47%' }}
              >
                <MetricCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  tone={card.tone}
                />
              </MotiView>
            ))}
          </View>

          {/* Dues summary if present */}
          {totals.duesTotal > 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 500 }}
            >
              <SectionHeader title="Dues" />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <MetricCard title="Total Dues" value={format(totals.duesTotal)} icon="file-text" tone="danger" />
                </View>
                <View style={{ flex: 1 }}>
                  <MetricCard title="Dues Count" value={String(totals.duesCount)} icon="hash" tone="default" />
                </View>
              </View>
            </MotiView>
          )}
        </MotiView>
      )}

      {!isLoading && !isError && rawList.length === 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          style={{ marginTop: 40, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 14, fontFamily: fonts.medium, color: colors.text.faint }}>No data for the selected date range.</Text>
        </MotiView>
      )}

      <View style={{ height: 32 }} />
    </ScreenWrapper>
  );
}
