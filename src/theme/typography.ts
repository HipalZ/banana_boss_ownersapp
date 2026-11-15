import { fonts } from './fonts';

/**
 * Type scale — aligned with the customer app's Plus Jakarta Sans family.
 * Pair `fontFamily` (controls glyph weight) with `fontSize`/`letterSpacing`.
 */
export const typography = {
  h1: { fontSize: 30, fontFamily: fonts.bold, fontWeight: '700' as const, letterSpacing: -0.4 },
  h2: { fontSize: 24, fontFamily: fonts.bold, fontWeight: '700' as const, letterSpacing: -0.25 },
  h3: { fontSize: 18, fontFamily: fonts.bold, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fonts.regular, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontFamily: fonts.semibold, fontWeight: '600' as const },
  caption: { fontSize: 12, fontFamily: fonts.semibold, fontWeight: '600' as const, letterSpacing: 0.2 },
  label: { fontSize: 13, fontFamily: fonts.semibold, fontWeight: '600' as const },
  number: { fontSize: 30, fontFamily: fonts.bold, fontWeight: '700' as const },
};
