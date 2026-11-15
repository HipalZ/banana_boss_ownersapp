/** Accept common Indian mobile formats while rejecting extra or missing digits. */
export function normalizeIndianPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  return /^(?:91|0)?([6-9]\d{9})$/.exec(digits)?.[1] ?? null;
}
