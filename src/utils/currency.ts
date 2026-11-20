export function formatINR(n: any): string {
  const val = Number(n);
  const safeNum = isNaN(val) || !isFinite(val) ? 0 : val;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNum);

  return formatted.replace('₹', '₹\u00A0');
}
