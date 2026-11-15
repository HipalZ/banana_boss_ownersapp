import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Platform, type TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii } from '@/theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const AppInput = React.memo(function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  onFocus,
  onBlur,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.text.secondary, marginBottom: 6, letterSpacing: 0.1 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: error
            ? colors.danger
            : isFocused
            ? colors.primaryDark
            : colors.surface.border,
          borderRadius: radii.tile,
          paddingHorizontal: 16,
          backgroundColor: colors.surface.card,
          shadowColor: colors.primaryDark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.04 : 0,
          shadowRadius: 4,
          elevation: isFocused ? 1 : 0,
        }}
      >
        {leftIcon && <Icon name={leftIcon} size={18} color={colors.text.faint} style={{ marginRight: 10 }} />}
        <TextInput
          style={[
            {
              flex: 1,
              minWidth: 0,
              borderWidth: 0,
              backgroundColor: 'transparent',
              ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
              paddingVertical: 14,
              fontFamily: fonts.medium,
              fontSize: 14,
              color: colors.text.base,
            },
            style,
          ]}
          placeholderTextColor={colors.text.faint}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} activeOpacity={0.7}>
            <Icon name={rightIcon} size={18} color={colors.text.faint} style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4, fontFamily: fonts.medium }}>{error}</Text>}
    </View>
  );
});
