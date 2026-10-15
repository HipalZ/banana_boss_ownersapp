import React, { Fragment, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingSkeleton } from './LoadingSkeleton';
import type { ReportPagination } from '@/types/common';
import { colors, fonts, radii } from '@/theme';
import { reportsApi, type ReportXlsxId } from '@/api/services/reports/reports.api';

interface ReportTableProps {
  columns: string[];
  rows: (string | number)[][];
  totalRow?: (string | number)[];
  rowDetails?: Array<{ title: string; columns: string[]; rows: (string | number)[][] } | undefined>;
  isLoading: boolean;
  isError: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  searchable?: boolean;
  pagination?: ReportPagination;
  onPageChange?: (page: number) => void;
  downloadReportId?: ReportXlsxId;
  outletId?: string | null;
  from?: number;
  to?: number;
}

export const ReportTable = React.memo(function ReportTable({
  columns,
  rows,
  totalRow,
  rowDetails,
  isLoading,
  isError,
  emptyMessage = 'No data for the selected date range.',
  onRetry,
  downloadReportId,
  outletId,
  from,
  to,
}: ReportTableProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const columnWidths = useMemo(
    () =>
      columns.map((column, index) => {
        const values = rows.map((row) => String(row[index] ?? ''));
        if (totalRow) values.push(String(totalRow[index] ?? ''));
        const longest = Math.max(column.length, ...values.map((value) => value.length));
        return Math.min(Math.max(longest * 7 + 32, 124), 220);
      }),
    [columns, rows, totalRow],
  );
  const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  if (isLoading) return <LoadingSkeleton type="report-table" count={5} />;
  if (isError) return <ErrorState onRetry={onRetry} />;

  const canDownload = !!downloadReportId && !!outletId && rows.length > 0 && !isLoading && !isDownloading;

  const handleDownload = async () => {
    if (!downloadReportId || !outletId) return;

    setIsDownloading(true);
    try {
      await reportsApi.downloadReportXlsx(downloadReportId, outletId, from, to);
    } catch (error) {
      Alert.alert(
        'Download failed',
        error instanceof Error ? error.message : 'Failed to download Excel report. Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const renderDownloadToolbar = () =>
    downloadReportId ? (
      <View style={styles.toolbar}>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={!canDownload}
          onPress={handleDownload}
          style={[styles.downloadButton, !canDownload && styles.downloadButtonDisabled]}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={colors.text.onAccent} />
          ) : (
            <Icon name="download" size={15} color={colors.text.onAccent} />
          )}
          <Text style={styles.downloadButtonText}>{isDownloading ? 'Downloading' : 'Excel'}</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  if (rows.length === 0) {
    return (
      <View>
        {renderDownloadToolbar()}
        <EmptyState title="No Data" subtitle={emptyMessage} icon="bar-chart-2" />
      </View>
    );
  }

  return (
    <View>
      {renderDownloadToolbar()}
      <View style={styles.tableShell}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          contentContainerStyle={{ minWidth: tableWidth }}
        >
          <View style={{ width: tableWidth }}>
            <View style={styles.headerRow}>
              {columns.map((col, index) => (
                <Text
                  key={`${col}-${index}`}
                  numberOfLines={2}
                  style={[styles.headerCell, { width: columnWidths[index] }]}
                >
                  {col}
                </Text>
              ))}
            </View>

            {rows.map((item, rowIndex) => {
              const detail = rowDetails?.[rowIndex];
              const expanded = expandedRows.has(rowIndex);
              return <Fragment key={`row-${rowIndex}`}>
              <TouchableOpacity
                disabled={!detail}
                onPress={() => detail && setExpandedRows((current) => {
                  const next = new Set(current);
                  if (next.has(rowIndex)) next.delete(rowIndex); else next.add(rowIndex);
                  return next;
                })}
                style={[
                  styles.bodyRow,
                  { backgroundColor: rowIndex % 2 === 0 ? colors.surface.card : colors.surface.raised },
                ]}
              >
                {columns.map((_, cellIndex) => (
                  <Text
                    key={`${rowIndex}-${cellIndex}`}
                    numberOfLines={cellIndex === 2 ? undefined : 2}
                    style={[styles.bodyCell, { width: columnWidths[cellIndex] }]}
                  >
                    {detail && cellIndex === 0 ? `${expanded ? '⌃' : '⌄'}  ` : ''}{String(item[cellIndex] ?? '')}
                  </Text>
                ))}
              </TouchableOpacity>
              {detail && expanded && (
                <View style={styles.detailShell}>
                  <Text style={styles.detailTitle}>{detail.title}</Text>
                  {detail.rows.map((detailRow, detailIndex) => (
                    <View key={detailIndex} style={styles.detailRow}>
                      <Text style={styles.detailItem}>{String(detailRow[1] ?? '')}</Text>
                      <Text style={styles.detailValue}>{String(detailRow[4] ?? '')}</Text>
                    </View>
                  ))}
                </View>
              )}
              </Fragment>;
            })}

            {totalRow && (
              <View style={styles.totalRow}>
                {columns.map((_, index) => (
                  <Text
                    key={`total-${index}`}
                    numberOfLines={2}
                    style={[styles.totalCell, { width: columnWidths[index] }]}
                  >
                    {String(totalRow[index] ?? '')}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
});

const styles = {
  toolbar: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    marginTop: 12,
  },
  downloadButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: radii.chip,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  downloadButtonDisabled: {
    opacity: 0.45,
  },
  downloadButtonText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.text.onAccent,
    textTransform: 'uppercase' as const,
  },
  tableShell: {
    marginTop: 10,
    borderRadius: radii.tile,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: 'hidden' as const,
  },
  headerRow: {
    flexDirection: 'row' as const,
    backgroundColor: colors.surface.raised,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase' as const,
  },
  bodyRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.borderSoft,
  },
  bodyCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
  },
  totalRow: {
    flexDirection: 'row' as const,
    backgroundColor: colors.tint.accent.bg,
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },
  totalCell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text.base,
  },
  detailShell: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.tint.accent.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  detailTitle: { fontFamily: fonts.bold, fontSize: 11, color: colors.text.base, marginBottom: 8 },
  detailRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, gap: 12, paddingVertical: 5 },
  detailItem: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.text.secondary },
  detailValue: { fontFamily: fonts.bold, fontSize: 12, color: colors.text.base },
};
