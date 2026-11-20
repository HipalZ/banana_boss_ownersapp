import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQueries } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/stores/appStore";
import { billsApi } from "@/api/services/bills/bills.api";
import { queryKeys } from "@/queries/queryKeys";
import { useCurrency } from "@/hooks/useCurrency";
import { ScreenWrapper } from "@/components/layout";
import { AdaptiveValueText, MetricCard, DateRangePicker } from "@/components/shared";
import { RunningTablesSheet } from "@/components/outletAdmin/RunningTablesSheet";
import { getTodayRange } from "@/utils/date";
import { colors, fonts, radii, shadows } from "@/theme";
import type { DateRangeValue } from "@/stores/appStore";

export function AllOutletsScreen() {
  const { outlets, logout } = useAuth();
  const setSelectedBusiness = useAppStore((s) => s.setSelectedBusiness);
  const setAdminInOutlet = useAppStore((s) => s.setAdminInOutlet);

  // Drill into an outlet the same way a staff login enters the app:
  // set the selected business, then switch to the full tabbed dashboard.
  const openOutlet = (outletId: string) => {
    setSelectedBusiness(outletId);
    setAdminInOutlet(true);
  };
  const { format } = useCurrency();
  const outletList = outlets ?? [];
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    ...getTodayRange(),
    preset: "today",
  });

  const { from, to } = dateRange;
  const [tablesSheetOpen, setTablesSheetOpen] = useState(false);

  // One dashboard query per outlet — resolves independently (progressive).
  const results = useQueries({
    queries: outletList.map((o) => ({
      queryKey: queryKeys.bills.dashboard(o._id, from, to),
      queryFn: () => billsApi.getDashboard(o._id, from, to),
    })),
  });

  // Per-outlet running tables (with tableId) — powers the KOT drill-down sheet.
  const runningResults = useQueries({
    queries: outletList.map((o) => ({
      queryKey: queryKeys.bills.runningTables(o._id),
      queryFn: () => billsApi.getRunningTables(o._id),
      staleTime: 30_000,
    })),
  });

  const runningGroups = useMemo(
    () =>
      outletList
        .map((o, i) => ({
          outletId: o._id,
          outletName: o.name,
          tables: (runningResults[i]?.data?.tables ?? []).map((t) => ({
            tableId: t.tableId,
            tableName: t.tableName,
            amount: t.tableCurrentAmount,
          })),
        }))
        .filter((g) => g.tables.length > 0),
    [outletList, runningResults],
  );

  const totals = useMemo(
    () => {
      const salesTotals = results.reduce(
        (acc, r) => {
          if (r.isSuccess && r.data) {
            acc.collection += r.data.overall?.totalSale ?? 0;
            acc.orders += r.data.overall?.totalOrders ?? 0;
          }
          return acc;
        },
        { collection: 0, orders: 0, activeValue: 0, activeCount: 0 },
      );

      return runningResults.reduce((acc, r) => {
        if (r.isSuccess && r.data) {
          acc.activeValue += r.data.totalActiveTableValue ?? 0;
          acc.activeCount += r.data.tables?.length ?? 0;
        }
        return acc;
      }, salesTotals);
    },
    [results, runningResults],
  );

  const loadedCount = results.filter((r) => r.isSuccess).length;

  return (
    <ScreenWrapper scrollable hasTabBar={false}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: 24,
              color: colors.text.base,
            }}
          >
            All Outlets
          </Text>
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: 12,
              color: colors.text.muted,
              marginTop: 2,
            }}
          >
            {outletList.length} outlet{outletList.length === 1 ? "" : "s"}
            {loadedCount < outletList.length
              ? ` • loading ${loadedCount}/${outletList.length}`
              : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={logout}
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.chip,
            backgroundColor: colors.surface.card,
            borderWidth: 1,
            borderColor: colors.surface.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="log-out" size={17} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      {/* Date range picker */}
      <View style={{ marginBottom: 18 }}>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </View>

      {/* Total sales across all outlets */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        <MetricCard
          title="Total Collection"
          value={format(totals.collection)}
          icon="dollar-sign"
        />
        <MetricCard
          title="Orders"
          value={String(totals.orders)}
          icon="shopping-bag"
          tone="success"
        />
      </View>
      <View style={{ marginBottom: 24 }}>
        <MetricCard
          title="Active Tables"
          subtitle={
            totals.activeCount > 0
              ? `${totals.activeCount} running now - tap to view`
              : `${totals.activeCount} running now`
          }
          value={format(totals.activeValue)}
          icon="grid"
          onPress={
            totals.activeCount > 0 ? () => setTablesSheetOpen(true) : undefined
          }
        />
      </View>

      {/* Outlets list */}
      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: 11,
          color: colors.text.muted,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        Outlets
      </Text>

      {outletList.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            marginTop: 30,
            fontFamily: fonts.medium,
            color: colors.text.faint,
          }}
        >
          No outlets found for this admin
        </Text>
      ) : (
        outletList.map((outlet, i) => {
          const r = results[i];
          const running = runningResults[i];
          const overall = r?.data?.overall;
          const activeCount = running?.data?.tables?.length ?? 0;
          const activeValue = running?.data?.totalActiveTableValue ?? 0;
          return (
            <TouchableOpacity
              key={outlet._id}
              activeOpacity={0.85}
              onPress={() => openOutlet(outlet._id)}
              style={{
                backgroundColor: colors.surface.card,
                borderRadius: radii.card,
                borderWidth: 1,
                borderColor: colors.surface.border,
                padding: 16,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                ...shadows.soft,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.semibold,
                    fontSize: 15,
                    color: colors.text.base,
                  }}
                >
                  {outlet.name}
                </Text>
                {r?.isPending ? (
                  <ActivityIndicator
                    color={colors.primaryDark}
                    style={{ alignSelf: "flex-start", marginTop: 6 }}
                  />
                ) : (
                  <AdaptiveValueText
                    value={format(overall?.totalSale ?? 0)}
                    baseFontSize={20}
                    minimumFontSize={15}
                    style={{ maxWidth: '90%', fontFamily: fonts.bold, color: colors.text.base, marginTop: 4 }}
                  />
                )}
                <Text
                  style={{
                    fontFamily: fonts.regular,
                    fontSize: 11,
                    color: activeCount > 0 ? colors.success : colors.text.muted,
                    marginTop: 2,
                  }}
                >
                  {running?.isPending
                    ? "Checking live tables..."
                    : activeCount > 0
                      ? `${format(activeValue)} active - ${activeCount} table${activeCount === 1 ? "" : "s"} running`
                      : "0 tables running"}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.text.faint} />
            </TouchableOpacity>
          );
        })
      )}

      <RunningTablesSheet
        visible={tablesSheetOpen}
        onClose={() => setTablesSheetOpen(false)}
        groups={runningGroups}
      />
    </ScreenWrapper>
  );
}
