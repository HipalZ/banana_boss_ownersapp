/**
 * Shared corner-radius scale from the customer app's menu surfaces.
 *
 *   chip  10  — chips, small badges
 *   tile  14  — icon tiles, steppers, inputs
 *   card  18  — cards, action buttons
 *   sheet 22  — bottom sheets, large feature cards
 *   hero  26  — hero media / hero cards
 *   full  999 — avatars, pills, FABs
 */
export const radii = {
  chip: 10,
  tile: 14,
  card: 18,
  sheet: 22,
  hero: 26,
  full: 999,
} as const;
