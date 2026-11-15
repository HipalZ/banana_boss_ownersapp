import React from 'react';
import { Image, Pressable, View, Text } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, ScreenEntrance } from '@/components/shared';
import { AppCard } from '@/components/primitives/AppCard';
import { OwnerDashboardHero } from '@/components/shared/OwnerDashboardHero';
import { OwnerSummaryMetric } from '@/components/shared/OwnerSummaryMetric';
import { useNetSalesReport } from '@/queries/reports';
import { formatINR } from '@/utils/currency';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts } from '@/theme';
import { aggregateNetSalesTotals } from './netSalesTotals';

const reportGroups = [
  {
    title: 'Sales & Revenue',
    image: require('../../../assets/dashboard-3d/sales.png'),
    items: [
      { title: 'Outstanding Dues', screen: 'OutstandingDues' as const },
      { title: 'Discounts Issued', screen: 'DiscountReport' as const },
      { title: 'Service Charge', screen: 'ServiceChargeReport' as const },
    ],
  },
  {
    title: 'Menu & Categories',
    image: require('../../../assets/dashboard-3d/menu.png'),
    items: [
      { title: 'Item Sales', screen: 'ItemSalesReport' as const },
      { title: 'Parent Category', screen: 'ParentCategoryReport' as const },
      { title: 'Addon Sales', screen: 'AddonSalesReport' as const },
      { title: 'Item Type', screen: 'ItemTypeReport' as const },
      { title: 'Open Item Sales', screen: 'OpenItemSales' as const },
    ],
  },
  {
    title: 'Audits & Operations',
    image: require('../../../assets/dashboard-3d/operations.png'),
    items: [
      { title: 'Area Report', screen: 'AreaReport' as const },
      { title: 'Area-Item Sales', screen: 'AreaItemReport' as const },
      { title: 'Table Report', screen: 'TableReport' as const },
      { title: 'Deleted KOTs', screen: 'DeletedKotReport' as const },
      { title: 'Transfer KOTs', screen: 'TransferKotReport' as const },
      { title: 'Transfer Tables', screen: 'TransferTableReport' as const },
    ],
  },
];

const quickReports = [
  { title: 'Bill-wise Sales', image: require('../../../assets/dashboard-3d/billing.png'), screen: 'BillWiseReport' as const },
  { title: 'Item Variant Sales', image: require('../../../assets/dashboard-3d/menu.png'), screen: 'ItemVariantReport' as const },
  { title: 'Category Sales', image: require('../../../assets/dashboard-3d/operations.png'), screen: 'CategorySalesReport' as const },
];

export function ReportsOverviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ReportsStackParamList>>();
  const { outletId, currentOutlet } = useOutlet();
  const reportsDateRange = useAppStore((s) => s.reportsDateRange);
  const setReportsDateRange = useAppStore((s) => s.setReportsDateRange);
  const { data: reportRows = [], isLoading, isError, isPlaceholderData } = useNetSalesReport(outletId, reportsDateRange.from, reportsDateRange.to);
  const totals = React.useMemo(() => aggregateNetSalesTotals(reportRows as any[]), [reportRows]);
  const hasCurrentData = !isError && !isPlaceholderData && reportRows.length > 0;
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);

  return (
    <ScreenWrapper scrollable>
      <TopBar title={currentOutlet?.name || 'Reports'} showBack={false} />

      <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center' }}>

      <View style={{ marginTop: 10, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ flexShrink: 1, fontFamily: fonts.bold, fontSize: 28, color: colors.text.base, letterSpacing: -0.4 }}>
          Reports
        </Text>
        <DateRangePicker compact value={reportsDateRange} onChange={setReportsDateRange} outletId={outletId} />
      </View>

      <ScreenEntrance>
        <OwnerDashboardHero
          title="Total sales"
          value={hasCurrentData ? formatINR(totals.totalSales) : undefined}
          detail={isError ? 'Summary unavailable · open report' : 'Tax, charges & round-off'}
          image={require('../../../assets/dashboard-3d/sales.png')}
          loading={isLoading || isPlaceholderData}
          onPress={() => navigation.navigate('NetSalesSummary')}
        />

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {[
            { label: 'Orders', value: hasCurrentData ? String(totals.totalOrders) : '—' },
            { label: 'Guests', value: hasCurrentData ? String(totals.pax) : '—' },
          ].map((metric) => (
            <View key={metric.label} style={{ flex: 1, minWidth: 0 }}>
              <OwnerSummaryMetric label={metric.label} value={isLoading || isPlaceholderData ? '…' : metric.value} />
            </View>
          ))}
        </View>

        <Text style={{ fontFamily: fonts.bold, fontSize: 19, color: colors.text.base, marginTop: 28, marginBottom: 10, letterSpacing: -0.35 }}>Frequent reports</Text>

        {quickReports.map((report, index) => (
          <MotiView key={report.screen} from={{ opacity: 0.82, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 240, delay: index * 45 }}>
            <AppCard style={{ padding: 0, marginTop: 8, overflow: 'hidden' }}>
              <Pressable
                onPress={() => navigation.navigate(report.screen)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${report.title}`}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingHorizontal: 16, backgroundColor: pressed ? colors.surface.raised : colors.surface.card })}
              >
                <Image source={report.image} resizeMode="contain" style={{ width: 48, height: 48, marginRight: 12 }} />
                <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.text.base }}>{report.title}</Text>
                <Icon name="arrow-up-right" size={18} color={colors.text.muted} />
              </Pressable>
            </AppCard>
          </MotiView>
        ))}

        <Text style={{ fontFamily: fonts.bold, fontSize: 19, color: colors.text.base, marginTop: 28, marginBottom: 10, letterSpacing: -0.35 }}>More reports</Text>

        {reportGroups.map((group, groupIndex) => (
          <MotiView key={group.title} from={{ opacity: 0.82, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 240, delay: groupIndex * 45 }}>
          <AppCard style={{ padding: 0, marginTop: 10, overflow: 'hidden' }}>
            <Pressable
              onPress={() => setExpandedGroup((current) => current === group.title ? null : group.title)}
              accessibilityRole="button"
              accessibilityLabel={`${group.title}, ${group.items.length} reports`}
              accessibilityState={{ expanded: expandedGroup === group.title }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingHorizontal: 16, backgroundColor: pressed ? colors.surface.raised : colors.surface.card })}
            >
              <Image source={group.image} resizeMode="contain" style={{ width: 48, height: 48, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.text.base }}>{group.title}</Text>
                <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginTop: 3 }}>{group.items.length} reports</Text>
              </View>
              <Icon name={expandedGroup === group.title ? 'chevron-down' : 'chevron-right'} size={18} color={colors.text.muted} />
            </Pressable>
            <AnimatePresence>
              {expandedGroup === group.title && group.items.map((item, index) => (
                <MotiView
                  key={item.screen}
                  from={{ opacity: 0.7, translateY: -4 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -4 }}
                  transition={{ type: 'timing', duration: 180, delay: index * 20 }}
                >
                  <Pressable
                    onPress={() => navigation.navigate(item.screen)}
                    accessibilityRole="button"
                    style={({ pressed }) => ({
                      minHeight: 55, flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: 18, paddingVertical: 10,
                      borderTopWidth: 1, borderTopColor: colors.surface.borderSoft,
                      backgroundColor: pressed ? colors.surface.raised : colors.surface.card,
                    })}
                  >
                    <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.text.base, flex: 1 }}>{item.title}</Text>
                    <Icon name="chevron-right" size={17} color={colors.text.faint} />
                  </Pressable>
                </MotiView>
              ))}
            </AnimatePresence>
          </AppCard>
          </MotiView>
        ))}
      </ScreenEntrance>

      <View style={{ height: 24 }} />
      </View>
    </ScreenWrapper>
  );
}
