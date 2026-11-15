import { Platform, type ViewStyle } from 'react-native';

/**
 * Quiet elevation matching the customer app's rounded surface language.
 *
 *   card   — subtle lift for resting cards/rows
 *   soft   — floating panels / sheets
 *   button — modest lift for primary floating buttons / nav bar
 *   glow   — restrained accent lift for rare hero moments
 */
const BLACK = '#000000';

export const shadows = {
  none: {} as ViewStyle,

  card: {
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 1,
  } as ViewStyle,

  soft: {
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  } as ViewStyle,

  button: {
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: Platform.OS === 'ios' ? 0.13 : 0.16,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,

  // Accent glow — for the yellow primary button / hero moments.
  glow: {
    shadowColor: '#F3CE5C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  } as ViewStyle,
} as const;
