import { ownerArtwork } from '@/theme/ownerArtwork';
import React from 'react';
import { Image, View, Text } from 'react-native';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BillingStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { usePaymentModesQuery } from '@/queries/paymentMode';
import { useDuesUsersQuery } from '@/queries/duesUser';
import { useBillsDashboardQuery } from '@/queries/bills';
import { useAppStore } from '@/stores/appStore';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ScreenEntrance } from '@/components/shared';
import { OwnerDashboardHero } from '@/components/shared/OwnerDashboardHero';
import { OwnerSummaryMetric } from '@/components/shared/OwnerSummaryMetric';
import { AppCard } from '@/components/primitives/AppCard';
import Icon from 'react-native-vector-icons/Feather';
import { formatINR } from '@/utils/currency';
import { colors, fonts } from '@/theme';

type Nav = NativeStackNavigationProp<BillingStackParamList>;

const navItems = [
  { title: 'Bills', subtitle: 'All bills & invoices', image: ownerArtwork.billing, screen: 'BillsList' as const },
  { title: 'Running tables', subtitle: 'Live tables & KOTs', image: ownerArtwork.runningTables, screen: 'RunningTables' as const },
  { title: 'Payment modes', subtitle: 'Manage payments', image: ownerArtwork.sales, screen: 'PaymentModes' as const },
  { title: 'Dues ledger', subtitle: 'Outstanding amounts', image: ownerArtwork.operations, screen: 'Dues' as const },
  { title: 'NPC accounts', subtitle: 'Non-paying registry', image: ownerArtwork.accounts, screen: 'Npc' as const },
];

export function BillingOverviewScreen() {
  const navigation = useNavigation<Nav>();
  const { outletId, currentOutlet } = useOutlet();
  const { data: paymentModes } = usePaymentModesQuery(outletId);
  const { data: duesUsers } = useDuesUsersQuery(outletId);
  const dateRange = useAppStore((s) => s.reportsDateRange);
  const setDateRange = useAppStore((s) => s.setReportsDateRange);
  const { data: dashboard, isLoading, isError } = useBillsDashboardQuery(outletId, dateRange.from, dateRange.to);
  const totals = dashboard?.paidAll?.totals;

  const totalDues = duesUsers?.reduce((sum, u) => sum + Number(u.currentDuesAmount || 0), 0) || 0;

  return (
    <ScreenWrapper scrollable>
      <TopBar title={currentOutlet?.name || 'Billing'} showBack={false} />
      <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center' }}>
      
      <View style={{ marginTop: 10, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 28, color: colors.text.base, letterSpacing: -0.4 }}>
          Billing
        </Text>
        <DateRangePicker compact value={dateRange} onChange={setDateRange} outletId={outletId} />
      </View>

      <ScreenEntrance>
        <OwnerDashboardHero
          title="Net sales"
          value={dashboard && !isError ? formatINR(totals?.netAfterDiscountAndCharges ?? 0) : undefined}
          detail={isError ? 'Summary unavailable · open dashboard' : 'Open sales dashboard'}
          image={ownerArtwork.sales}
          loading={isLoading}
          onPress={() => navigation.navigate('SalesDashboard')}
        />

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {[
            { label: 'Orders', value: dashboard && !isError ? String(totals?.ordersCount ?? 0) : '—', screen: 'SalesDashboard' as const },
            { label: 'Current dues balance', value: duesUsers ? formatINR(totalDues) : '—', screen: 'Dues' as const },
          ].map((metric) => (
            <View key={metric.label} style={{ flex: 1, minWidth: 0 }}>
              <OwnerSummaryMetric label={metric.label} value={isLoading && metric.label === 'Orders' ? '…' : metric.value} onPress={() => navigation.navigate(metric.screen)} />
            </View>
          ))}
        </View>

        <Text style={{ fontFamily: fonts.bold, fontSize: 19, color: colors.text.base, marginTop: 28, marginBottom: 4, letterSpacing: -0.35 }}>Billing tools</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.text.muted, marginBottom: 12 }}>Bills, payments and customer accounts</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {navItems.map((item, index) => {
          const subtitle =
            item.screen === 'PaymentModes'
              ? `${paymentModes?.filter((mode) => mode.status).length || 0} active modes`
              : item.screen === 'Dues'
              ? `${formatINR(totalDues)} across all dates`
              : item.subtitle;

          return (
            <MotiView key={item.screen} from={{ opacity: 0.82, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 240, delay: index * 45 }} style={{ width: '48%', flexGrow: 1 }}>
            <AppCard
              onPress={() => navigation.navigate(item.screen)}
              style={{
                minHeight: 154,
                padding: 16,
                justifyContent: 'space-between',
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Image source={item.image} resizeMode="contain" style={{ width: 64, height: 64 }} />
                <Icon name="arrow-up-right" size={17} color={colors.text.muted} />
              </View>
              
              <View>
                <Text numberOfLines={2} style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.text.base }}>
                  {item.title}
                </Text>
                <Text numberOfLines={2} style={{ fontFamily: fonts.medium, fontSize: 12, lineHeight: 17, color: colors.text.muted, marginTop: 4 }}>
                  {subtitle}
                </Text>
              </View>
            </AppCard>
            </MotiView>
          );
        })}
        </View>
      </ScreenEntrance>
      <View style={{ height: 24 }} />
      </View>
    </ScreenWrapper>
  );
}
