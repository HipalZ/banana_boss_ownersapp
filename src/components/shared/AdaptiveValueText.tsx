import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

interface AdaptiveValueTextProps {
  value: string;
  baseFontSize: number;
  minimumFontSize?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Keeps exact numeric values on one line across native and web. React Native
 * Web does not reliably honour adjustsFontSizeToFit, so the deterministic
 * fallback prevents compact metric cards from replacing digits with ellipses.
 */
export function getAdaptiveValueFontSize(
  value: string,
  baseFontSize: number,
  minimumFontSize = Math.round(baseFontSize * 0.72),
) {
  const length = Array.from(value.trim()).length;
  const scale = length <= 8 ? 1 : length <= 10 ? 0.9 : length === 11 ? 0.82 : length === 12 ? 0.76 : 0.7;
  return Math.max(minimumFontSize, Math.round(baseFontSize * scale));
}

export function AdaptiveValueText({
  value,
  baseFontSize,
  minimumFontSize,
  style,
}: AdaptiveValueTextProps) {
  const fontSize = getAdaptiveValueFontSize(value, baseFontSize, minimumFontSize);

  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={minimumFontSize ? minimumFontSize / baseFontSize : 0.72}
      style={[
        { minWidth: 0, flexShrink: 1, fontVariant: ['tabular-nums'] },
        style,
        { fontSize },
      ]}
    >
      {value}
    </Text>
  );
}
