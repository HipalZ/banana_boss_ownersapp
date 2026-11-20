import React from 'react';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AppCard } from '@/components/primitives/AppCard';
import { colors, fonts } from '@/theme';
import { AdaptiveValueText } from './AdaptiveValueText';

interface OwnerSummaryMetricProps {
  label: string;
  value: string;
  onPress?: () => void;
}

export function OwnerSummaryMetric({ label, value, onPress }: OwnerSummaryMetricProps) {
  return (
    <AppCard onPress={onPress} style={{ minHeight: 95, padding: 15, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
        <Text numberOfLines={2} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted }}>
          {label}
        </Text>
        {onPress && <Icon name="arrow-up-right" size={15} color={colors.text.muted} />}
      </View>
      <AdaptiveValueText
        value={value}
        baseFontSize={22}
        minimumFontSize={16}
        style={{ width: '100%', fontFamily: fonts.extrabold, color: colors.text.base }}
      />
    </AppCard>
  );
}
