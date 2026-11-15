import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii } from '@/theme';

type Props = { label: string; onPress: () => void; disabled?: boolean };

export function BillingActionButton({ label, onPress, disabled = false }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={{ minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: radii.chip, backgroundColor: colors.primaryDark, opacity: disabled ? 0.45 : 1 }}
    >
      <Icon name="plus" size={15} color={colors.onPrimary} />
      <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: colors.onPrimary }}>{label}</Text>
    </TouchableOpacity>
  );
}
