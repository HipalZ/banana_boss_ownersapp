import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii, shadows } from '@/theme';
import { MetricIllustration } from './MetricIllustration';
import { AdaptiveValueText } from './AdaptiveValueText';

interface BreakdownItem {
  label: string;
  value: number;
  direction?: 'positive' | 'negative' | 'neutral';
}

interface MetricCardProps {
  title: string;
  subtitle?: string;
  value: string;
  icon: string;
  tone?: 'default' | 'success' | 'danger' | 'muted';
  breakdown?: BreakdownItem[];
  onPress?: () => void;
  compact?: boolean;
}

export const MetricCard = React.memo(function MetricCard({
  title,
  subtitle,
  value,
  icon,
  tone = 'default',
  onPress,
  compact = false,
}: MetricCardProps) {
  const cardStyle = {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    paddingVertical: compact ? 11 : 13,
    paddingHorizontal: compact ? 8 : 9,
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.surface.border,
    ...shadows.card,
  };

  const content = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: compact ? 6 : 10, minHeight: 38 }}>
        <Text numberOfLines={2} style={{ fontFamily: fonts.bold, fontSize: compact ? 11 : 12, lineHeight: compact ? 15 : 17, color: colors.text.base, flex: 1, flexShrink: 1, marginRight: 6 }}>
          {title}
        </Text>
        <MetricIllustration icon={icon} />
      </View>
      <AdaptiveValueText
        value={value}
        baseFontSize={compact ? 21 : 22}
        minimumFontSize={16}
        style={{ width: '100%', fontFamily: fonts.extrabold, color: colors.text.base }}
      />
      {subtitle && <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginTop: 6 }}>{subtitle}</Text>}
      {onPress && <Icon name="arrow-up-right" size={14} color={colors.text.muted} style={{ position: 'absolute', right: 11, bottom: 10 }} />}
    </>
  );

  return onPress ? (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${title}: ${value}. View details`} activeOpacity={0.8} onPress={onPress} style={cardStyle}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={cardStyle}>{content}</View>
  );
});
