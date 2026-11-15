import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { useBillsDashboardQuery, useRunningTablesQuery } from '@/queries/bills';
import { useOutletDetails } from '@/queries/outlets';
import { useCurrency } from '@/hooks/useCurrency';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, LoadingSkeleton, ErrorState, DetailSheet, type DetailRow } from '@/components/shared';
import { MetricIllustration } from '@/components/shared/MetricIllustration';
import { RunningTablesSheet } from '@/components/outletAdmin/RunningTablesSheet';
import { colors, fonts, radii, shadows } from '@/theme';
import { getTodayRange, getBusinessDayRange } from '@/utils/date';
import Icon from 'react-native-vector-icons/Feather';
import { useIsFocused } from '@react-navigation/native';
import { paymentModeLabel } from '@/utils/paymentModeLabel';

export function SalesDashboardScreen() {
  const s = makeStyles();
  const { outletId, currentOutlet } = useOutlet();
  const isScreenFocused = useIsFocused();
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);

  const { data, isLoading, isError, refetch } = useBillsDashboardQuery(
    outletId,
    dateRange.from,
    dateRange.to,
  );
  
  const { data: outletDetail } = useOutletDetails(outletId);
  const billingStart = outletDetail?.billingStartTime ?? 0;
  const billingEnd   = outletDetail?.billingEndTime   ?? 0;

  const { format } = useCurrency();

  // Determine if selected date range is today
  const isToday = useMemo(() => {
    if (dateRange.preset === 'today') return true;
    const todayRaw = getTodayRange();
    const todayBusiness = getBusinessDayRange(
      new Date(todayRaw.from),
      new Date(todayRaw.to),
      billingStart,
      billingEnd
    );
    return dateRange.from === todayBusiness.from.getTime() && dateRange.to === todayBusiness.to.getTime();
  }, [dateRange.preset, dateRange.from, dateRange.to, billingStart, billingEnd]);

  // Stable yesterday range calculated relative to dateRange (handles billing shifts perfectly and doesn't change on every render)
  const yesterdayRange = useMemo(() => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    return {
      from: dateRange.from - oneDayMs,
      to: dateRange.to - oneDayMs,
    };
  }, [dateRange.from, dateRange.to]);

  // Yesterday query (only enabled if isToday is true)
  const { data: yesterdayData, isLoading: isLoadingYest, isError: isErrorYest } = useBillsDashboardQuery(
    outletId,
    yesterdayRange.from,
    yesterdayRange.to,
    isToday,
  );

  // Destructure with robust fallbacks
  const paidAll         = (data as any)?.paidAll         ?? { totals: {}, paymentModes: {}, roundOff: {} };
  const paidNormal      = (data as any)?.paidNormal      ?? { totals: {} };
  const duesSettlements = (data as any)?.duesSettlements ?? { totals: {} };
  const discountSummary = (data as any)?.discountSummary ?? { onPaid: {}, onDues: {} };
  const duesSummary     = (data as any)?.duesSummary     ?? { duesGiven: 0, duesOutstanding: 0, ordersPending: 0, duesGetBack: 0 };
  const taxesSummary    = (data as any)?.taxesSummary    ?? { all: {}, onPaid: {} };

  const hasDues =
    (duesSummary?.duesGiven || 0) > 0 ||
    (duesSummary?.duesGetBack || 0) > 0 ||
    (duesSummary?.ordersPending || 0) > 0;

  const paymentModeEntries = (Object.entries(paidAll?.paymentModes ?? {}) as [string, number][])
    .filter(([, amount]) => Number(amount) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]));
  const paymentModeTotal = paymentModeEntries.reduce((sum, [, amount]) => sum + Number(amount), 0);

  const yesterdaySales = (yesterdayData as any)?.paidAll?.totals?.netAfterDiscountAndCharges || 0;
  const todaySales = paidAll?.totals?.netAfterDiscountAndCharges || 0;
  const salesChange = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;

  // Tap-to-expand metric breakdowns (mirrors banana_boss web MetricCard sheets).
  const [detail, setDetail] = useState<{ title: string; total: number; rows: DetailRow[] } | null>(null);
  const num = (v: any) => Number(v || 0);

  // Running tables → KOT drill-down (mirrors banana_boss web). The dashboard's
  // running-tables only carry name+amount, so we fetch the dedicated endpoint
  // to get tableId, then tap a table to see its live KOTs.
  const {
    data: liveRunning,
    isFetching: isFetchingRunning,
    refetch: refetchRunning,
  } = useRunningTablesQuery(outletId, isScreenFocused);
  const liveTables = liveRunning?.tables ?? [];

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetch(), refetchRunning()]);
  }, [refetch, refetchRunning]);

  const [kotSheetOpen, setKotSheetOpen] = useState(false);
  const [kotTable, setKotTable] = useState<
    { outletId: string; outletName: string; tableId: string; tableName: string } | null
  >(null);
  const runningGroups = useMemo(
    () => [
      {
        outletId: outletId ?? '',
        outletName: currentOutlet?.name ?? 'Outlet',
        tables: liveTables.map((t) => ({
          tableId: t.tableId,
          tableName: t.tableName,
          amount: t.tableCurrentAmount,
        })),
      },
    ],
    [outletId, currentOutlet?.name, liveTables],
  );
  const openTableKots = (t: { tableId: string; tableName: string }) => {
    setKotTable({
      outletId: outletId ?? '',
      outletName: currentOutlet?.name ?? 'Outlet',
      tableId: t.tableId,
      tableName: t.tableName,
    });
    setKotSheetOpen(true);
  };

  const openDiscountDetail = () =>
    setDetail({
      title: 'Discount',
      total: num(discountSummary?.onPaid?.total),
      rows: [
        { label: 'Manual', value: num(discountSummary?.onPaid?.manual), direction: 'negative' },
        { label: 'Coins Used', value: num(discountSummary?.onPaid?.coinsUsed), direction: 'negative' },
        { label: 'Coupon', value: num(discountSummary?.onPaid?.coupon), direction: 'negative' },
        { label: 'NPC Credit', value: num(discountSummary?.onPaid?.npcAsDiscount), direction: 'negative' },
        { label: 'Complementary', value: num(discountSummary?.onPaid?.compAsDiscount), direction: 'negative' },
      ],
    });
  const openTaxDetail = () =>
    setDetail({
      title: 'Taxes (GST)',
      total: num(taxesSummary?.onPaid?.tax),
      rows: [
        { label: 'GST', value: num(taxesSummary?.onPaid?.tax), direction: 'positive' },
        { label: 'VAT', value: num(taxesSummary?.onPaid?.vat), direction: 'positive' },
      ],
    });
  const openChargesDetail = () =>
    setDetail({
      title: 'Charges',
      total:
        num(taxesSummary?.onPaid?.serviceCharge) +
        num(taxesSummary?.onPaid?.containerCharge) +
        num(taxesSummary?.onPaid?.deliveryCharge),
      rows: [
        { label: 'Service Charge', value: num(taxesSummary?.onPaid?.serviceCharge), direction: 'positive' },
        { label: 'Container Charge', value: num(taxesSummary?.onPaid?.containerCharge), direction: 'positive' },
        { label: 'Delivery Charge', value: num(taxesSummary?.onPaid?.deliveryCharge), direction: 'positive' },
      ],
    });
  const openTipsDetail = () =>
    setDetail({
      title: 'Tips',
      total: num(taxesSummary?.onPaid?.tip),
      rows: [{ label: 'Tips', value: num(taxesSummary?.onPaid?.tip), direction: 'positive' }],
    });

  return (
    <ScreenWrapper
      scrollable
      refreshControl
      onRefresh={handleRefresh}
      header={<TopBar title="Sales Dashboard" subtitle={currentOutlet?.name || ''} />}
    >
      <View style={{ marginVertical: 8 }}>
        <DateRangePicker value={dateRange} onChange={setDateRange} outletId={outletId} />
      </View>

      {isLoading && <LoadingSkeleton type="metric-card" count={6} />}
      {isError && !isLoading && <ErrorState onRetry={handleRefresh} />}

      {data && !isLoading && (
        <>
          {/* Revenue Overview Grid */}
          <MotiView
            from={{ opacity: 0.88, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 240 }}
            style={{ marginTop: 8 }}
          >
            {/* Premium Gold/Dark Hero Card for Net Sales */}
            <View style={{
              backgroundColor: colors.surface.ink, // warm espresso
              borderRadius: radii.hero,
              padding: 22,
              borderLeftWidth: 6,
              borderLeftColor: colors.primary, // banana gold
              ...shadows.soft,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.surface.inkBorder,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.text.onInkMuted, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  Total Net Sales
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {isToday && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success }} />}
                  <View style={{ backgroundColor: isToday ? colors.tint.green.bg : colors.surface.inkRaised, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: isToday ? colors.success : colors.text.onInkMuted, textTransform: 'uppercase' }}>{isToday ? 'Today' : 'Selected period'}</Text>
                  </View>
                </View>
              </View>

              <Text style={{ fontFamily: fonts.extrabold, fontSize: 34, color: colors.text.onInk, letterSpacing: -0.5 }}>
                {format(todaySales)}
              </Text>

              {/* Quick comparison mini badge on Hero Card */}
              {isToday && yesterdaySales > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                  <View style={{
                    backgroundColor: salesChange >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <Icon name={salesChange >= 0 ? 'trending-up' : 'trending-down'} size={11} color={salesChange >= 0 ? colors.success : colors.danger} />
                    <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: salesChange >= 0 ? colors.success : colors.danger }}>
                      {salesChange >= 0 ? '+' : ''}{salesChange.toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.onInkMuted }}>vs yesterday same time</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 6, borderTopWidth: 1, borderTopColor: colors.surface.inkBorder, paddingTop: 12 }}>
                <Icon name="check-circle" size={13} color={colors.success} />
                <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.text.onInkMuted }}>
                  Includes normal sales & settled dues
                </Text>
              </View>
            </View>

            {/* Premium 2-Column Grid for Metrics */}
            <Text style={s.sectionLabel}>Revenue Overview</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={[s.gridCard, { borderTopColor: colors.tint.sky.fg, borderTopWidth: 2 }]}>
                <View style={s.metricArtwork}><MetricIllustration icon="shopping-bag" /></View>
                <Text style={s.cardLabel}>Orders</Text>
                <Text style={s.cardValue}>{String(paidAll?.totals?.ordersCount || 0)}</Text>
              </View>
              <View style={[s.gridCard, { borderTopColor: colors.success, borderTopWidth: 2 }]}>
                <View style={s.metricArtwork}><MetricIllustration icon="users" /></View>
                <Text style={s.cardLabel}>Guests</Text>
                <Text style={s.cardValue}>{String(paidAll?.totals?.paxCount || 0)}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <View style={[s.gridCard, { borderTopColor: colors.warning, borderTopWidth: 2 }]}>
                <View style={s.metricArtwork}><MetricIllustration icon="trending-up" /></View>
                <Text style={s.cardLabel}>Normal Sales</Text>
                <Text style={s.cardValue}>{format(paidNormal?.totals?.netAfterDiscountAndCharges || 0)}</Text>
              </View>
              <View style={[s.gridCard, { borderTopColor: colors.tint.violet.fg, borderTopWidth: 2 }]}>
                <View style={s.metricArtwork}><MetricIllustration icon="dollar-sign" /></View>
                <Text style={s.cardLabel}>Dues Recovered</Text>
                <Text style={s.cardValue}>{format(duesSettlements?.totals?.netAfterDiscountAndCharges || 0)}</Text>
              </View>
            </View>
          </MotiView>

          {/* Today vs Yesterday Graphical Comparison Card */}
          {isToday && (
            <MotiView
              from={{ opacity: 0.88, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 240, delay: 70 }}
              style={{ marginTop: 8, marginBottom: 20 }}
            >
              <Text style={s.sectionLabel}>Sales Comparison</Text>
              <View style={{
                backgroundColor: colors.surface.card,
                borderRadius: radii.hero,
                padding: 18,
                borderWidth: 1,
                borderColor: colors.surface.border,
                ...shadows.card,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontFamily: fonts.extrabold, fontSize: 15, color: colors.text.base }}>Performance vs Yesterday</Text>
                    <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginTop: 2 }}>
                      Comparing matching billing shift windows
                    </Text>
                  </View>

                  {/* Profit/Loss Change Badge */}
                  {!isLoadingYest && !isErrorYest && yesterdaySales > 0 && (
                    <View style={{
                      backgroundColor: salesChange >= 0 ? colors.tint.green.bg : colors.tint.rose.bg,
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Icon name={salesChange >= 0 ? 'arrow-up-right' : 'arrow-down-left'} size={13} color={salesChange >= 0 ? colors.success : colors.danger} />
                      <Text style={{ fontFamily: fonts.bold, fontSize: 12, fontWeight: '800', color: salesChange >= 0 ? colors.success : colors.danger }}>
                        {Math.abs(salesChange).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>

                {/* State-driven view for comparison data loading or error */}
                {isLoadingYest ? (
                  <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={colors.warning} />
                    <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, marginTop: 10 }}>
                      Loading yesterday's shift data...
                    </Text>
                  </View>
                ) : isErrorYest ? (
                  <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name="alert-triangle" size={24} color={colors.danger} />
                    <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.danger, marginTop: 6 }}>
                      Failed to fetch yesterday's metrics
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 18 }}>
                    {[
                      { label: 'Today', value: todaySales, fill: colors.primary },
                      { label: 'Yesterday', value: yesterdaySales, fill: colors.text.faint },
                    ].map((item) => {
                      const largest = Math.max(todaySales, yesterdaySales);
                      const percentage = largest > 0 ? Math.max(3, item.value / largest * 100) : 0;
                      return (
                        <View key={item.label}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                            <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.text.secondary }}>{item.label}</Text>
                            <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.text.base }}>{format(item.value)}</Text>
                          </View>
                          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surface.raised, overflow: 'hidden' }}>
                            <View style={{ width: `${percentage}%`, height: '100%', borderRadius: 4, backgroundColor: item.fill }} />
                          </View>
                        </View>
                      );
                    })}
                    {todaySales === 0 && yesterdaySales === 0 && (
                      <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted }}>
                        No sales in either billing shift yet.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </MotiView>
          )}

          {/* Payment Modes Progress Share */}
          {paymentModeEntries.length > 0 && (
            <MotiView
              from={{ opacity: 0.88, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 240, delay: 110 }}
              style={{ marginTop: 8, marginBottom: 20 }}
            >
              <Text style={s.sectionLabel}>Payment Modes Share</Text>
              <View style={{
                backgroundColor: colors.surface.card,
                borderRadius: radii.hero,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.surface.border,
                ...shadows.card,
              }}>
                {paymentModeEntries.map(([mode, amount], i) => {
                  const share = paymentModeTotal > 0 ? (Number(amount) / paymentModeTotal) * 100 : 0;
                  
                  return (
                    <View key={mode} style={{ marginBottom: i === paymentModeEntries.length - 1 ? 0 : 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={{ backgroundColor: colors.surface.raised, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.secondary }}>
                              {paymentModeLabel(mode)}
                            </Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontFamily: fonts.extrabold, fontSize: 14, color: colors.text.base }}>
                            {format(Number(amount))}
                          </Text>
                          <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginTop: 1 }}>
                            {share.toFixed(1)}% share
                          </Text>
                        </View>
                      </View>
                      <View style={{ height: 6, width: '100%', backgroundColor: colors.surface.raised, borderRadius: 3, marginTop: 8 }}>
                        <View style={{ height: 6, width: `${Math.min(100, share)}%`, backgroundColor: colors.primary, borderRadius: 3 }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </MotiView>
          )}

          {/* Discounts & Taxes Grid */}
          <MotiView
            from={{ opacity: 0.88, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 240, delay: 150 }}
            style={{ marginTop: 8, marginBottom: 20 }}
          >
            <Text style={s.sectionLabel}>Discounts &amp; Taxes</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Discount. View breakdown" activeOpacity={0.8} onPress={openDiscountDetail} style={[s.gridCard, { borderTopColor: colors.danger, borderTopWidth: 2 }]}>
                <View style={s.metricArtwork}><MetricIllustration icon="percent" /></View>
                <Text style={s.cardLabel}>Discount</Text>
                <Text style={[s.cardValue, { color: colors.danger }]}>
                  {format(discountSummary?.onPaid?.total || 0)}
                </Text>
                <Text style={s.tapHint}>Tap for breakdown ›</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Taxes. View breakdown" activeOpacity={0.8} onPress={openTaxDetail} style={[s.gridCard, { borderTopColor: colors.info, borderTopWidth: 2 }]}>
                <View style={s.metricArtwork}><MetricIllustration icon="file-text" /></View>
                <Text style={s.cardLabel}>Taxes (GST)</Text>
                <Text style={s.cardValue}>
                  {format(taxesSummary?.onPaid?.tax || 0)}
                </Text>
                <Text style={s.tapHint}>Tap for breakdown ›</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Service charge. View breakdown" activeOpacity={0.8} onPress={openChargesDetail} style={[s.gridCard, { borderTopColor: colors.tint.violet.fg, borderTopWidth: 2 }]}>
                <View style={s.metricArtwork}><MetricIllustration icon="briefcase" /></View>
                <Text style={s.cardLabel}>Service Charge</Text>
                <Text style={s.cardValue}>
                  {format(taxesSummary?.onPaid?.serviceCharge || 0)}
                </Text>
                <Text style={s.tapHint}>Tap for breakdown ›</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tips. View breakdown" activeOpacity={0.8} onPress={openTipsDetail} style={[s.gridCard, { borderTopColor: colors.warning, borderTopWidth: 2 }]}>
                <View style={s.metricArtwork}><MetricIllustration icon="smile" /></View>
                <Text style={s.cardLabel}>Tips</Text>
                <Text style={s.cardValue}>
                  {format(taxesSummary?.onPaid?.tip || 0)}
                </Text>
                <Text style={s.tapHint}>Tap for breakdown ›</Text>
              </TouchableOpacity>
            </View>
          </MotiView>

          {/* Dues Position */}
          {hasDues && (
            <MotiView
              from={{ opacity: 0.88, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 240, delay: 190 }}
              style={{ marginTop: 8, marginBottom: 20 }}
            >
              <Text style={s.sectionLabel}>Dues this period</Text>
              <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, marginBottom: 10 }}>Net change = dues given minus dues recovered</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <View style={[s.gridCard, { borderTopColor: colors.danger, borderTopWidth: 2 }]}>
                  <View style={s.metricArtwork}><MetricIllustration icon="trending-down" /></View>
                  <Text style={s.cardLabel}>Dues Given</Text>
                  <Text style={[s.cardValue, { color: colors.danger }]}>
                    {format(duesSummary?.duesGiven || 0)}
                  </Text>
                </View>
                <View style={[s.gridCard, { borderTopColor: colors.danger, borderTopWidth: 2 }]}>
                  <View style={s.metricArtwork}><MetricIllustration icon="alert-circle" /></View>
                  <Text style={s.cardLabel}>Net dues change</Text>
                  <Text style={[s.cardValue, { color: colors.danger }]}>
                    {format(duesSummary?.duesOutstanding || 0)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[s.gridCard, { borderTopColor: colors.text.muted, borderTopWidth: 2 }]}>
                  <View style={s.metricArtwork}><MetricIllustration icon="bell" /></View>
                  <Text style={s.cardLabel}>Pending Orders</Text>
                  <Text style={s.cardValue}>
                    {String(duesSummary?.ordersPending || 0)}
                  </Text>
                </View>
                <View style={[s.gridCard, { borderTopColor: colors.success, borderTopWidth: 2 }]}>
                  <View style={s.metricArtwork}><MetricIllustration icon="dollar-sign" /></View>
                  <Text style={s.cardLabel}>Get Back</Text>
                  <Text style={[s.cardValue, { color: colors.success }]}>
                    {format(duesSummary?.duesGetBack || 0)}
                  </Text>
                </View>
              </View>
            </MotiView>
          )}

          {/* Running Tables Grid — tap a table to see its live KOTs */}
          {isFetchingRunning ? (
            <View style={{ marginTop: 8, marginBottom: 20 }}>
              <LoadingSkeleton type="card-grid" count={6} />
            </View>
          ) : liveTables.length > 0 && (
            <MotiView
              from={{ opacity: 0.88, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 240, delay: 230 }}
              style={{ marginTop: 8, marginBottom: 20 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[s.sectionLabel, { marginTop: 0, marginBottom: 0 }]}>Active Tables ({liveTables.length})</Text>
                <Text style={{ fontFamily: fonts.bold, fontSize: 13, fontWeight: '800', color: colors.warning }}>
                  Total: {format(liveRunning?.totalActiveTableValue || 0)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {liveTables.map((t, i) => (
                  <TouchableOpacity
                    key={t.tableId || i}
                    activeOpacity={0.85}
                    onPress={() => openTableKots({ tableId: t.tableId, tableName: t.tableName })}
                    style={{
                      backgroundColor: colors.tint.amber.bg,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      minWidth: 100,
                      borderWidth: 1,
                      borderColor: colors.tint.amber.fg,
                      flex: 1,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.tint.amber.fg, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>
                      {t.tableName}
                    </Text>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 15, fontWeight: '900', color: colors.tint.amber.fg }}>
                      {format(t.tableCurrentAmount)}
                    </Text>
                    <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginTop: 4 }}>
                      View KOTs ›
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </MotiView>
          )}
        </>
      )}
      <View style={{ height: 120 }} />

      <DetailSheet
        visible={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title ?? ''}
        total={detail?.total}
        rows={detail?.rows ?? []}
      />

      <RunningTablesSheet
        visible={kotSheetOpen}
        onClose={() => setKotSheetOpen(false)}
        groups={runningGroups}
        initialTable={kotTable}
      />
    </ScreenWrapper>
  );
}

const makeStyles = () => StyleSheet.create({
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    marginTop: 12,
    marginBottom: 10,
  },
  gridCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
  },
  metricArtwork: {
    width: 40,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tapHint: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.text.faint,
    marginTop: 6,
  },
  cardLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
    color: colors.text.base,
  },
});
