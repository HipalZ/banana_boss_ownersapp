/**
 * RunningTablesSheet — bottom-sheet drill-down for the "Active Tables" metric.
 *
 *  Level 1: running tables grouped by outlet (from the running-tables endpoint).
 *  Level 2: tap a table -> lazily fetch that table's running KOTs + line items.
 *
 * If the POS is offline or the open order hasn't synced, an empty state shows.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  useTableKotsQuery,
  useKotItemsQuery,
  RUNNING_KOT_STATUSES,
} from '@/queries/bills';
import { useCurrency } from '@/hooks/useCurrency';
import { AdaptiveValueText } from '@/components/shared/AdaptiveValueText';
import type { TableKot } from '@/api/services/bills/bills.types';
import { colors, fonts, radii } from '@/theme';

export interface RunningTableRow {
  tableId: string;
  tableName: string;
  amount: number;
}

export interface RunningTablesOutletGroup {
  outletId: string;
  outletName: string;
  tables: RunningTableRow[];
}

interface RunningTablesSheetProps {
  visible: boolean;
  onClose: () => void;
  groups: RunningTablesOutletGroup[];
  /** When set, the sheet opens straight to this table's KOTs (skips the list). */
  initialTable?: SelectedTable | null;
}

interface SelectedTable {
  outletId: string;
  outletName: string;
  tableId: string;
  tableName: string;
}

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  PLACED: colors.tint.amber,
  PREPARING: colors.tint.accent,
  READY: colors.tint.green,
  SERVED: { bg: colors.surface.raised, fg: colors.text.muted },
};

function timeStr(value: number) {
  return value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
}

export function RunningTablesSheet({
  visible,
  onClose,
  groups,
  initialTable = null,
}: RunningTablesSheetProps) {
  const [selected, setSelected] = useState<SelectedTable | null>(null);

  // Open directly to a specific table's KOTs when requested (else the list).
  useEffect(() => {
    if (visible) setSelected(initialTable ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialTable?.tableId]);

  const totalTables = useMemo(
    () => groups.reduce((n, g) => n + g.tables.length, 0),
    [groups],
  );

  const close = () => {
    setSelected(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={selected ? () => setSelected(null) : close}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: colors.surface.overlay, justifyContent: 'flex-end' }}
        onPress={close}
      >
        <Pressable onPress={() => {}} style={{ maxHeight: '85%' }}>
          <View
            style={{
              backgroundColor: colors.surface.card,
              borderTopLeftRadius: radii.hero,
              borderTopRightRadius: radii.hero,
              paddingTop: 8,
              paddingBottom: 32,
            }}
          >
            {/* drag handle */}
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.surface.border,
                alignSelf: 'center',
                marginBottom: 12,
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                marginBottom: 12,
                gap: 12,
              }}
            >
              {selected && (
                <TouchableOpacity
                  onPress={() => setSelected(null)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: radii.chip,
                    backgroundColor: colors.surface.raised,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="arrow-left" size={17} color={colors.text.base} />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.text.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {selected ? selected.outletName : 'Live'}
                </Text>
                <Text style={{ fontSize: 18, fontFamily: fonts.bold, color: colors.text.base, letterSpacing: -0.3 }}>
                  {selected ? selected.tableName : 'Running Tables'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={close}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radii.chip,
                  backgroundColor: colors.surface.raised,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="x" size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 460 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {selected ? (
                <TableKotView selected={selected} />
              ) : (
                <TablesList groups={groups} totalTables={totalTables} onPick={setSelected} />
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ── Level 1 ───────────────────────────────────────────────────────────── */

function TablesList({
  groups,
  totalTables,
  onPick,
}: {
  groups: RunningTablesOutletGroup[];
  totalTables: number;
  onPick: (t: SelectedTable) => void;
}) {
  const { format } = useCurrency();

  if (totalTables === 0) {
    return (
      <Text style={{ textAlign: 'center', paddingVertical: 40, fontFamily: fonts.medium, color: colors.text.faint }}>
        No tables running right now
      </Text>
    );
  }

  return (
    <View>
      <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, marginBottom: 14 }}>
        {totalTables} table{totalTables === 1 ? '' : 's'} running. Tap a table to see what's cooking.
      </Text>

      {groups.map((group) => (
        <View key={group.outletId} style={{ marginBottom: 18 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {group.outletName}
          </Text>

          {group.tables.map((t) => (
            <TouchableOpacity
              key={t.tableId}
              activeOpacity={0.8}
              onPress={() =>
                onPick({
                  outletId: group.outletId,
                  outletName: group.outletName,
                  tableId: t.tableId,
                  tableName: t.tableName,
                })
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface.card,
                borderWidth: 1,
                borderColor: colors.surface.border,
                borderRadius: radii.card,
                padding: 14,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radii.chip,
                    backgroundColor: colors.surface.raised,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="grid" size={16} color={colors.text.base} />
                </View>
                <Text style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.text.base, flex: 1 }} numberOfLines={1}>
                  {t.tableName}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AdaptiveValueText value={format(t.amount)} baseFontSize={15} minimumFontSize={12} style={{ maxWidth: '45%', fontFamily: fonts.bold, color: colors.text.base, textAlign: 'right' }} />
                <Icon name="chevron-right" size={18} color={colors.text.faint} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

/* ── Level 2 ───────────────────────────────────────────────────────────── */

function TableKotView({ selected }: { selected: SelectedTable }) {
  const { data: kots = [], isPending, isError, refetch } = useTableKotsQuery(
    selected.outletId,
    selected.tableId,
  );

  const running = useMemo(
    () => kots.filter((k) => RUNNING_KOT_STATUSES.includes(k.status)),
    [kots],
  );

  if (isPending) {
    return (
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <ActivityIndicator color={colors.primaryDark} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.semibold, color: colors.danger, marginBottom: 12 }}>
          Failed to load KOTs
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderRadius: radii.chip,
            borderWidth: 1,
            borderColor: colors.surface.border,
          }}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.text.muted }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (running.length === 0) {
    return (
      <View style={{ paddingVertical: 44, alignItems: 'center', paddingHorizontal: 20 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: radii.card,
            backgroundColor: colors.surface.raised,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <Icon name="clipboard" size={22} color={colors.text.faint} />
        </View>
        <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
          No running KOTs
        </Text>
        <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.faint, textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
          Live KOTs only appear while the POS is online and has synced this table's open order.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, marginBottom: 12 }}>
        {running.length} running KOT{running.length === 1 ? '' : 's'} on this table
      </Text>
      {running.map((kot) => (
        <KotCard key={kot._id} kot={kot} />
      ))}
    </View>
  );
}

function KotCard({ kot }: { kot: TableKot }) {
  const { format } = useCurrency();
  const { data: items = [], isPending } = useKotItemsQuery(kot._id);
  const tint = STATUS_TINT[kot.status] ?? { bg: colors.surface.raised, fg: colors.text.muted };

  return (
    <View
      style={{
        backgroundColor: colors.surface.card,
        borderWidth: 1,
        borderColor: colors.surface.border,
        borderRadius: radii.card,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.surface.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.text.base }}>
            KOT #{kot.kotInvoiceNumber || kot._id.slice(-5)}
          </Text>
          <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.faint, marginTop: 2 }}>
            {timeStr(kot.createdAt)}
          </Text>
        </View>
        <View style={{ backgroundColor: tint.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.chip }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: tint.fg, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {kot.status}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
        {isPending ? (
          <ActivityIndicator color={colors.primaryDark} style={{ alignSelf: 'flex-start', marginVertical: 6 }} />
        ) : items.length === 0 ? (
          <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.faint, paddingVertical: 4 }}>
            No items on this KOT
          </Text>
        ) : (
          items.map((item) => (
            <View
              key={item._id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 7,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={{
                    minWidth: 26,
                    height: 26,
                    paddingHorizontal: 6,
                    borderRadius: 8,
                    backgroundColor: colors.surface.raised,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.base }}>{item.quantity}</Text>
                </View>
                <Text style={{ fontFamily: fonts.semibold, fontSize: 13.5, color: colors.text.base, flex: 1 }} numberOfLines={1}>
                  {item.itemName}
                </Text>
              </View>
              <AdaptiveValueText value={format((item.itemPrice ?? 0) * (item.quantity ?? 1))} baseFontSize={13} minimumFontSize={10} style={{ maxWidth: '38%', fontFamily: fonts.semibold, color: colors.text.secondary, textAlign: 'right' }} />
            </View>
          ))
        )}
      </View>
    </View>
  );
}
