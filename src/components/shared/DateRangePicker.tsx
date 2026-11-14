/**
 * DateRangePicker — bottom-sheet preset picker with billing-timing support.
 *
 * Mirrors the logic of banana_boss's DateRangeDropdown:
 *  - Named presets (Today / Yesterday / Week / Month): tap -> apply + close.
 *  - Billing times from the outlet detail (billingStartTime / billingEndTime)
 *    are applied automatically to every preset, exactly as the web dashboard does.
 *  - When billing times load / change, the current named preset is re-applied
 *    with corrected timestamps (no user action required).
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useOutletDetails } from '@/queries/outlets';
import { formatDateShort, getBusinessDayRange } from '@/utils/date';
import type { DateRangeValue, DateRangePreset } from '@/stores/appStore';
import { colors, fonts, radii } from '@/theme';

// Preset raw-range helpers (calendar-only, no billing offset)
function getTodayRaw(): { from: number; to: number } {
  const from = new Date(); from.setHours(0, 0, 0, 0);
  const to   = new Date(); to.setHours(23, 59, 59, 999);
  return { from: from.getTime(), to: to.getTime() };
}
function getYesterdayRaw(): { from: number; to: number } {
  const from = new Date(); from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0);
  const to   = new Date(); to.setDate(to.getDate() - 1); to.setHours(23, 59, 59, 999);
  return { from: from.getTime(), to: to.getTime() };
}
function getThisWeekRaw(): { from: number; to: number } {
  const now  = new Date();
  const from = new Date(now); from.setDate(now.getDate() - 7); from.setHours(0, 0, 0, 0);
  const to   = new Date(now); to.setHours(23, 59, 59, 999);
  return { from: from.getTime(), to: to.getTime() };
}
function getThisMonthRaw(): { from: number; to: number } {
  const now  = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1); from.setHours(0, 0, 0, 0);
  const to   = new Date(now); to.setHours(23, 59, 59, 999);
  return { from: from.getTime(), to: to.getTime() };
}
function getRawRange(preset: DateRangePreset): { from: number; to: number } {
  switch (preset) {
    case 'today':      return getTodayRaw();
    case 'yesterday':  return getYesterdayRaw();
    case 'this_week':  return getThisWeekRaw();
    case 'this_month': return getThisMonthRaw();
    default:           return getTodayRaw();
  }
}

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: 'Today',       value: 'today' },
  { label: 'Yesterday',   value: 'yesterday' },
  { label: 'This Week',   value: 'this_week' },
  { label: 'This Month',  value: 'this_month' },
  { label: 'Custom Range', value: 'custom' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const startOfDayMs = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const endOfDayMs = (ms: number) => {
  const d = new Date(ms);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  outletId?: string | null;
  /** Render the trigger button in light-on-dark style (for dark headers) */
  dark?: boolean;
  compact?: boolean;
}

export const DateRangePicker = React.memo(function DateRangePicker({
  value,
  onChange,
  outletId,
  dark = false,
  compact = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  // 'list' = preset menu, 'calendar' = custom date-range picker
  const [mode, setMode] = useState<'list' | 'calendar'>('list');
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [pendingFrom, setPendingFrom] = useState<number | null>(null);
  const [pendingTo, setPendingTo] = useState<number | null>(null);

  const { data: outletDetail } = useOutletDetails(outletId ?? null);
  const billingStart = outletDetail?.billingStartTime ?? 0;
  const billingEnd   = outletDetail?.billingEndTime   ?? 0;

  // Apply billing offset to a raw calendar range
  const applyBilling = useCallback(
    (raw: { from: number; to: number }): { from: number; to: number } => {
      const { from, to } = getBusinessDayRange(
        new Date(raw.from),
        new Date(raw.to),
        billingStart,
        billingEnd,
      );
      return { from: from.getTime(), to: to.getTime() };
    },
    [billingStart, billingEnd],
  );

  // Re-apply when billing times load / change (mirrors banana_boss DateRangeDropdown)
  useEffect(() => {
    if (!billingStart && !billingEnd) return;
    if (value.preset === 'custom') return;
    const raw = getRawRange(value.preset);
    const { from, to } = applyBilling(raw);
    if (from !== value.from || to !== value.to) {
      onChange({ from, to, preset: value.preset });
    }
  }, [billingStart, billingEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectPreset = useCallback(
    (preset: DateRangePreset) => {
      if (preset === 'custom') {
        // Enter the calendar; seed pending range from the current value.
        setPendingFrom(value.preset === 'custom' ? value.from : null);
        setPendingTo(value.preset === 'custom' ? value.to : null);
        setCalMonth(new Date(value.from || Date.now()));
        setMode('calendar');
        return;
      }
      const raw = getRawRange(preset);
      const { from, to } = applyBilling(raw);
      onChange({ from, to, preset });
      setOpen(false);
    },
    [applyBilling, onChange, value.preset, value.from, value.to],
  );

  const openSheet = useCallback(() => {
    setMode(value.preset === 'custom' ? 'calendar' : 'list');
    setPendingFrom(value.preset === 'custom' ? value.from : null);
    setPendingTo(value.preset === 'custom' ? value.to : null);
    setCalMonth(new Date(value.from || Date.now()));
    setOpen(true);
  }, [value.preset, value.from, value.to]);

  const onDayPress = useCallback((dayMs: number) => {
    // First tap (or restart) sets the start; second tap sets the end.
    if (pendingFrom == null || pendingTo != null) {
      setPendingFrom(dayMs);
      setPendingTo(null);
    } else if (dayMs < pendingFrom) {
      setPendingTo(pendingFrom);
      setPendingFrom(dayMs);
    } else {
      setPendingTo(dayMs);
    }
  }, [pendingFrom, pendingTo]);

  const applyCustom = useCallback(() => {
    if (pendingFrom == null || pendingTo == null) return;
    const { from, to } = applyBilling({
      from: startOfDayMs(pendingFrom),
      to: endOfDayMs(pendingTo),
    });
    onChange({ from, to, preset: 'custom' });
    setOpen(false);
  }, [pendingFrom, pendingTo, applyBilling, onChange]);

  // Label for the trigger
  const label =
    value.preset === 'custom'
      ? `${formatDateShort(value.from)} – ${formatDateShort(value.to)}`
      : PRESETS.find((p) => p.value === value.preset)?.label ?? 'Select date';

  const hasBilling = billingStart > 0 || billingEnd > 0;

  // Trigger button styling
  const triggerBg     = dark ? 'rgba(255,255,255,0.12)' : colors.surface.card;
  const triggerText   = dark ? colors.text.white : colors.text.base;
  const triggerBorder = dark ? 'transparent' : colors.surface.border;
  const iconColor     = dark ? colors.text.white : colors.text.muted;

  return (
    <>
      {/* ── Trigger ──────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={openSheet}
        activeOpacity={0.75}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: triggerBg,
          borderRadius: radii.chip,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: triggerBorder,
          alignSelf: 'flex-start',
          gap: 6,
        }}
      >
        <Icon name="calendar" size={14} color={iconColor} />
        <Text numberOfLines={1} style={{ fontFamily: fonts.medium, fontSize: 13, fontWeight: '500', color: triggerText }}>{compact && value.preset === 'custom' ? 'Custom' : label}</Text>
        <Icon name="chevron-down" size={13} color={iconColor} />
      </TouchableOpacity>

      {/* ── Modal sheet ──────────────────────────────────────────── */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: colors.surface.overlay, justifyContent: 'flex-end' }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => {}}>
            <View
              style={{
                backgroundColor: colors.surface.card,
                borderTopLeftRadius: radii.hero,
                borderTopRightRadius: radii.hero,
                paddingTop: 8,
                paddingBottom: 40,
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
                  marginBottom: 16,
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  marginBottom: 16,
                  gap: 10,
                }}
              >
                {mode === 'calendar' && (
                  <TouchableOpacity
                    onPress={() => setMode('list')}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: radii.chip,
                      backgroundColor: colors.surface.raised,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="arrow-left" size={16} color={colors.text.base} />
                  </TouchableOpacity>
                )}
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: fonts.bold,
                    color: colors.text.base,
                    letterSpacing: -0.3,
                  }}
                >
                  {mode === 'calendar' ? 'Custom Range' : 'Select Date Range'}
                </Text>
              </View>

              {mode === 'list' ? (
                <>
                  {PRESETS.map((p) => {
                    const active = value.preset === p.value;
                    return (
                      <TouchableOpacity
                        key={p.value}
                        onPress={() => selectPreset(p.value)}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 20,
                          paddingVertical: 15,
                          backgroundColor: active ? colors.surface.raised : 'transparent',
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: active ? colors.primaryDark : colors.surface.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 14,
                          }}
                        >
                          {active && (
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: colors.primaryDark,
                              }}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: active ? fonts.bold : fonts.medium,
                            color: active ? colors.text.base : colors.text.secondary,
                            flex: 1,
                          }}
                        >
                          {p.label}
                        </Text>
                        {p.value === 'custom' ? (
                          <Icon name="chevron-right" size={16} color={colors.text.muted} />
                        ) : active ? (
                          <Icon name="check" size={16} color={colors.primaryDark} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}

                  {hasBilling && (
                    <View
                      style={{
                        marginHorizontal: 20,
                        marginTop: 16,
                        backgroundColor: colors.tint.accent.bg,
                        borderRadius: radii.chip,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <Icon name="clock" size={13} color={colors.tint.accent.fg} style={{ marginTop: 1 }} />
                      <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.tint.accent.fg, flex: 1, lineHeight: 18 }}>
                        Billing shift applied — dates use your outlet's configured start &amp; end times.
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={{ paddingHorizontal: 20 }}>
                  {/* Month navigation */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <TouchableOpacity
                      onPress={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                      style={{ width: 34, height: 34, borderRadius: radii.chip, backgroundColor: colors.surface.raised, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon name="chevron-left" size={18} color={colors.text.base} />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.text.base }}>
                      {MONTH_LABELS[calMonth.getMonth()]} {calMonth.getFullYear()}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                      style={{ width: 34, height: 34, borderRadius: radii.chip, backgroundColor: colors.surface.raised, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon name="chevron-right" size={18} color={colors.text.base} />
                    </TouchableOpacity>
                  </View>

                  {/* Weekday labels */}
                  <View style={{ flexDirection: 'row' }}>
                    {DAY_LABELS.map((d, i) => (
                      <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginBottom: 6 }}>
                        {d}
                      </Text>
                    ))}
                  </View>

                  {/* Day grid */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {(() => {
                      const firstWeekday = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
                      const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
                      const cells: (number | null)[] = [
                        ...Array(firstWeekday).fill(null),
                        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
                      ];
                      const fromDay = pendingFrom != null ? startOfDayMs(pendingFrom) : null;
                      const toDay = pendingTo != null ? startOfDayMs(pendingTo) : null;
                      return cells.map((cell, idx) => {
                        if (cell == null) {
                          return <View key={idx} style={{ width: `${100 / 7}%`, height: 40 }} />;
                        }
                        const dayMs = new Date(calMonth.getFullYear(), calMonth.getMonth(), cell, 0, 0, 0, 0).getTime();
                        const isEndpoint = dayMs === fromDay || dayMs === toDay;
                        const inRange = fromDay != null && toDay != null && dayMs > fromDay && dayMs < toDay;
                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => onDayPress(dayMs)}
                            style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <View
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isEndpoint ? colors.primary : inRange ? colors.tint.accent.bg : 'transparent',
                              }}
                            >
                              <Text style={{ fontFamily: isEndpoint ? fonts.bold : fonts.medium, fontSize: 13, color: isEndpoint ? colors.onPrimary : colors.text.base }}>
                                {cell}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      });
                    })()}
                  </View>

                  {/* Status + Apply */}
                  <Text style={{ textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, marginTop: 12, minHeight: 16 }}>
                    {pendingFrom != null && pendingTo == null
                      ? 'Now pick the end date'
                      : pendingFrom != null && pendingTo != null
                        ? `${formatDateShort(pendingFrom)} → ${formatDateShort(pendingTo)}`
                        : 'Pick a start date'}
                  </Text>
                  <TouchableOpacity
                    disabled={pendingFrom == null || pendingTo == null}
                    onPress={applyCustom}
                    activeOpacity={0.85}
                    style={{
                      marginTop: 12,
                      borderRadius: radii.card,
                      paddingVertical: 14,
                      alignItems: 'center',
                      backgroundColor: pendingFrom != null && pendingTo != null ? colors.primary : colors.surface.raised,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: pendingFrom != null && pendingTo != null ? colors.onPrimary : colors.text.faint }}>
                      Apply
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});
