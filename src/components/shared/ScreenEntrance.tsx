import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { useReducedMotion } from 'react-native-reanimated';
import { transitions } from '@/theme';

interface ScreenEntranceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** A quiet page entrance shared by the owner tabs. */
export function ScreenEntrance({ children, style }: ScreenEntranceProps) {
  const reducedMotion = useReducedMotion();

  return (
    <MotiView
      from={{ opacity: reducedMotion ? 1 : 0.88, translateY: reducedMotion ? 0 : 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={reducedMotion ? { type: 'timing', duration: 0 } : transitions.screen}
      style={style}
    >
      {children}
    </MotiView>
  );
}
