import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii } from '@/theme';

interface ExportExcelButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  loading?: boolean;
  disabled?: boolean;
}

export function ExportExcelButton({ onPress, accessibilityLabel, loading = false, disabled = false }: ExportExcelButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={loading || disabled}
      style={{
        minHeight: 40,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 12,
        borderRadius: radii.chip,
        backgroundColor: colors.exportAction.bg,
        borderWidth: 1,
        borderColor: colors.exportAction.border,
        opacity: loading || disabled ? 0.55 : 1,
      }}
    >
      {loading ? <ActivityIndicator size="small" color={colors.exportAction.text} /> : <Icon name="download" size={14} color={colors.exportAction.text} />}
      <Text style={{ fontFamily: fonts.semibold, fontSize: 11, color: colors.exportAction.text }}>
        {loading ? 'Preparing' : 'Download Excel'}
      </Text>
    </TouchableOpacity>
  );
}
