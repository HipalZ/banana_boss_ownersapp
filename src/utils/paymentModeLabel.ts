const acronyms = new Set(['UPI', 'NPC', 'AMEX']);

/** Keep server payment keys intact while showing readable names in the app. */
export function paymentModeLabel(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map((word) => acronyms.has(word.toUpperCase())
      ? word.toUpperCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
