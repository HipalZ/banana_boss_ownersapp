import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { MetricCard } from './MetricCard';
import { SectionHeader } from './SectionHeader';
import { useCurrency } from '@/hooks/useCurrency';
import { colors, fonts } from '@/theme';

type Tone = 'default' | 'success' | 'danger' | 'muted';
type ValueFormat = 'currency' | 'number';

export interface SummaryMetric {
  label: string;
  /** First present numeric field per row is summed. Pass aliases, e.g. ['gross','grossAmount']. */
  fields?: string[];
  /** When true, the metric is the number of rows (ignores `fields`). */
  count?: boolean;
  /** Prefer a server-provided grand total under this key (correct for paginated reports). */
  totalsKey?: string;
  format?: ValueFormat;
  icon: string;
  tone?: Tone;
}

export interface SummaryChart {
  title?: string;
  labelFields: string[];
  valueFields: string[];
  top?: number;
  format?: ValueFormat;
}

interface ReportSummaryProps {
  data: any[] | undefined;
  isLoading?: boolean;
  metrics: SummaryMetric[];
  chart?: SummaryChart;
  /** Server-provided grand totals (used when a metric sets `totalsKey`). */
  totals?: Record<string, number | string>;
  /** True count of records across all pages, when the list is paginated. */
  totalCount?: number;
}

const firstNum = (row: any, fields?: string[]): number => {
  if (!row || !fields) return 0;
  for (const f of fields) {
    const v = row[f];
    if (v !== undefined && v !== null && Number.isFinite(Number(v))) return Number(v);
  }
  return 0;
};

const firstStr = (row: any, fields: string[]): string => {
  for (const f of fields) {
    const v = row[f];
    if (v !== undefined && v !== null && String(v).trim().length > 0) return String(v);
  }
  return '—';
};

/**
 * Drop-in summary header for report screens: a grid of KPI totals plus an
 * optional "top N" horizontal bar breakdown. Renders nothing while loading or
 * when there is no data (the table below already shows those states), so a
 * report only gains the rich header once real numbers exist.
 */
export const ReportSummary = React.memo(function ReportSummary({
  data,
  isLoading,
  metrics,
  chart,
  totals,
  totalCount,
}: ReportSummaryProps) {
  const { format } = useCurrency();
  const rows = data ?? [];

  const fmt = useMemo(
    () => (n: number, f?: ValueFormat) =>
      f === 'currency' ? format(n) : Math.round(n).toLocaleString('en-IN'),
    [format],
  );

  const cards = useMemo(
    () =>
      metrics.map((m) => {
        let total: number;
        if (m.count) {
          total = totalCount ?? rows.length;
        } else if (m.totalsKey && totals && Number.isFinite(Number(totals[m.totalsKey]))) {
          // Prefer the server grand total — correct even when the list is paged.
          total = Number(totals[m.totalsKey]);
        } else {
          total = rows.reduce((sum, row) => sum + firstNum(row, m.fields), 0);
        }
        return {
          title: m.label,
          value: fmt(total, m.count ? 'number' : m.format),
          icon: m.icon,
          tone: m.tone ?? 'default',
        };
      }),
    [metrics, rows, fmt, totals, totalCount],
  );

  const bars = useMemo(() => {
    if (!chart) return [];
    const mapped = rows
      .map((row) => ({
        label: firstStr(row, chart.labelFields),
        value: firstNum(row, chart.valueFields),
      }))
      .filter((b) => b.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, chart.top ?? 6);
    const max = mapped.reduce((m, b) => Math.max(m, b.value), 0);
    return mapped.map((b) => ({ ...b, pct: max > 0 ? (b.value / max) * 100 : 0 }));
  }, [chart, rows]);

  if (isLoading || rows.length === 0) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
    >
      <SectionHeader title="Summary" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {cards.map((card, i) => (
          <MotiView
            key={card.title}
            from={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 320, delay: i * 45 }}
            style={{ width: '47%' }}
          >
            <MetricCard title={card.title} value={card.value} icon={card.icon} tone={card.tone} />
          </MotiView>
        ))}
      </View>

      {chart && bars.length > 0 && (
        <>
          <SectionHeader title={chart.title ?? 'Top breakdown'} />
          <View
            style={{
              backgroundColor: colors.surface.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.surface.border,
              padding: 14,
              gap: 12,
            }}
          >
            {bars.map((b, i) => (
              <MotiView
                key={`${b.label}-${i}`}
                from={{ opacity: 0, translateX: -8 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 320, delay: i * 50 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text
                    numberOfLines={2}
                    style={{ flex: 1, marginRight: 10, fontFamily: fonts.medium, fontSize: 12, lineHeight: 17, color: colors.text.secondary }}
                  >
                    {b.label}
                  </Text>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.base, textAlign: 'right', flexShrink: 0 }}>
                    {fmt(b.value, chart.format)}
                  </Text>
                </View>
                <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.surface.raised, overflow: 'hidden' }}>
                  <View
                    style={{
                      width: `${Math.max(b.pct, 4)}%`,
                      height: '100%',
                      borderRadius: 999,
                      backgroundColor: colors.gold,
                    }}
                  />
                </View>
              </MotiView>
            ))}
          </View>
        </>
      )}
    </MotiView>
  );
});
