import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import type { BillingStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useRunningTablesQuery } from '@/queries/bills';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { AdaptiveValueText, ErrorState, LoadingSkeleton } from '@/components/shared';
import {
  RunningTablesSheet,
  type RunningTablesOutletGroup,
} from '@/components/outletAdmin/RunningTablesSheet';
import { useCurrency } from '@/hooks/useCurrency';
import { colors, fonts, radii } from '@/theme';

type Nav = NativeStackNavigationProp<BillingStackParamList>;

interface SelectedTable {
  outletId: string;
  outletName: string;
  tableId: string;
  tableName: string;
}

export function RunningTablesScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const { outletId, currentOutlet } = useOutlet();
  const { format } = useCurrency();
  const [selectedTable, setSelectedTable] = React.useState<SelectedTable | null>(null);
  const {
    data,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useRunningTablesQuery(outletId, isFocused);

  const tables = data?.tables ?? [];
  const outletName = currentOutlet?.name?.trim() || 'Outlet';
  const groups = React.useMemo<RunningTablesOutletGroup[]>(
    () => outletId && tables.length
      ? [{
          outletId,
          outletName,
          tables: tables.map((table) => ({
            tableId: table.tableId,
            tableName: table.tableName,
            amount: table.tableCurrentAmount,
          })),
        }]
      : [],
    [outletId, outletName, tables],
  );

  const cardWidth = width >= 1000 ? '18%' : width >= 720 ? '30%' : '47%';

  return (
    <ScreenWrapper scrollable refreshControl onRefresh={() => { void refetch(); }} horizontalPadding={12}>
      <TopBar title="Running Tables" showBack onBack={() => navigation.goBack()} />
      <View style={{ width: '100%', maxWidth: 980, alignSelf: 'center', paddingTop: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 11,
                color: colors.text.muted,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
              }}
            >
              Active tables ({tables.length})
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.medium,
                fontSize: 12,
                color: data?.posOnline === false ? colors.danger : colors.text.faint,
                marginTop: 4,
              }}
            >
              {data?.posOnline === false ? 'POS is offline' : `${outletName} · live billing activity`}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', maxWidth: '56%', flexShrink: 0 }}>
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 12,
                color: colors.text.faint,
                letterSpacing: 0.2,
              }}
            >
              Total running value
            </Text>
            <AdaptiveValueText
              value={format(data?.totalActiveTableValue ?? 0)}
              baseFontSize={24}
              minimumFontSize={18}
              style={{ maxWidth: '100%', fontFamily: fonts.bold, color: colors.warning, textAlign: 'right', marginTop: 4 }}
            />
          </View>
        </View>

        {isPending ? (
          <LoadingSkeleton type="card-grid" count={6} />
        ) : isError ? (
          <ErrorState
            title="Running tables unavailable"
            subtitle="We could not fetch the live tables from the POS."
            onRetry={() => { void refetch(); }}
          />
        ) : tables.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingVertical: 52,
              borderWidth: 1,
              borderColor: colors.surface.border,
              borderRadius: radii.hero,
              backgroundColor: colors.surface.card,
            }}
          >
            <Image
              source={require('../../../assets/dashboard-3d/running-tables.png')}
              resizeMode="contain"
              style={{ width: 84, height: 84, opacity: 0.82 }}
            />
            <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text.base, marginTop: 12 }}>
              No running tables
            </Text>
            <Text style={{ fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.text.muted, textAlign: 'center', marginTop: 6 }}>
              Open tables will appear here as soon as the POS syncs them.
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {tables.map((table) => (
              <TouchableOpacity
                key={table.tableId}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={`${table.tableName}, ${format(table.tableCurrentAmount)}. View KOTs`}
                onPress={() => setSelectedTable({
                  outletId: outletId!,
                  outletName,
                  tableId: table.tableId,
                  tableName: table.tableName,
                })}
                style={{
                  width: cardWidth,
                  flexGrow: 1,
                  minWidth: width >= 720 ? 150 : 140,
                  minHeight: 112,
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  justifyContent: 'space-between',
                  borderRadius: radii.card,
                  borderWidth: 1,
                  borderColor: colors.tint.amber.fg,
                  backgroundColor: colors.tint.amber.bg,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.bold, fontSize: 13, color: colors.tint.amber.fg }}>
                    {table.tableName}
                  </Text>
                  <Icon name="grid" size={15} color={colors.tint.amber.fg} />
                </View>
                <AdaptiveValueText
                  value={format(table.tableCurrentAmount)}
                  baseFontSize={17}
                  minimumFontSize={12}
                  style={{ width: '100%', fontFamily: fonts.bold, color: colors.tint.amber.fg, marginTop: 8 }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted }}>View KOTs</Text>
                  <Icon name="chevron-right" size={14} color={colors.text.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isFetching && !isPending && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14 }}>
            <ActivityIndicator size="small" color={colors.primaryDark} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted }}>Refreshing live tables</Text>
          </View>
        )}
        <View style={{ height: 24 }} />
      </View>

      <RunningTablesSheet
        visible={selectedTable !== null}
        onClose={() => setSelectedTable(null)}
        groups={groups}
        initialTable={selectedTable}
      />
    </ScreenWrapper>
  );
}
