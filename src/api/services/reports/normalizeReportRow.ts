/** Fill legacy report aliases without replacing fields supplied by the server. */
export function normalizeReportRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const out: any = { ...row };
  const fill = (key: string, ...candidates: any[]) => {
    if (out[key] == null) {
      const value = candidates.find((candidate) => candidate != null);
      if (value != null) out[key] = value;
    }
  };

  fill('gross', row.grossAmount);
  fill('grossAmount', row.gross);
  fill('tax', row.totalTax, row.gst);
  fill('totalTax', row.tax, row.gst);
  fill('total', row.totalSales, row.netSales, row.amount, row.net);
  fill('totalSales', row.total, row.netSales, row.amount);
  fill('net', row.netSales, row.totalSales, row.total);
  fill('count', row.categoryCount, row.billCount, row.orderCount);
  fill('quantity', row.qty);
  fill('contribution', row.contributionPercent);
  fill('contributionPercent', row.contribution);

  fill('category', row.categoryName);
  fill('parentCategory', row.parentCategoryName, row.categoryName);
  fill('item', row.itemName);
  fill('area', row.areaName);
  fill('table', row.tableName);
  fill('itemType', row.itemTypeName);
  fill('addonName', row.addOnName);
  fill('variantName', row.variant);

  return out;
}

/** Normalize grand totals separately: bill-wise totals use payable and tax components. */
export function normalizeReportTotals(totals: any): any {
  if (!totals || typeof totals !== 'object') return totals;
  const source = { ...totals };
  if (source.totalTax == null && source.tax == null &&
      (source.cgstTotal != null || source.sgstTotal != null || source.vatTotal != null)) {
    source.totalTax = Number(source.cgstTotal ?? 0) + Number(source.sgstTotal ?? 0) + Number(source.vatTotal ?? 0);
  }
  if (source.discount == null && source.discountTotal != null) source.discount = source.discountTotal;
  if (source.total == null && source.payable != null) source.total = source.payable;
  return normalizeReportRow(source);
}
