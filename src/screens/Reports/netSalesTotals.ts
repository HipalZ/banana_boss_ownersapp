const summaryKeys = [
  'totalOrders', 'pax', 'subtotal', 'discount', 'complementary', 'npc',
  'serviceCharge', 'gst', 'tips', 'roundOff', 'totalSales', 'netSales',
] as const;

const numberOrZero = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

/** Both the Reports hero and its detail screen use the same server totals and scope. */
export function aggregateNetSalesTotals(rows: readonly any[]) {
  const totals = {
    totalOrders: 0, pax: 0, subtotal: 0, discount: 0, complementary: 0,
    npc: 0, serviceCharge: 0, gst: 0, tips: 0, roundOff: 0,
    totalSales: 0, netSales: 0, duesTotal: 0, duesCount: 0,
  };

  for (const row of rows) {
    const summary = row?.data?.summary;
    if (!summary) continue;
    for (const key of summaryKeys) totals[key] += numberOrZero(summary[key]);
    totals.duesTotal += numberOrZero(row?.data?.duesSummary?.total);
    totals.duesCount += numberOrZero(row?.data?.duesSummary?.count);
  }
  return totals;
}
