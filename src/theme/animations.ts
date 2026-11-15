export const transitions = {
  screen: { type: 'timing' as const, duration: 240 },
  card: { type: 'timing' as const, duration: 220 },
  spring: { type: 'spring' as const, damping: 24, stiffness: 210 },
  press: { type: 'spring' as const, damping: 20, stiffness: 260 },
};
