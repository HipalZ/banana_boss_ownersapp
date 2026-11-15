import React from 'react';
import { View, type ViewProps, TouchableOpacity } from 'react-native';
import { colors, radii, shadows } from '@/theme';

interface AppCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
}

export const AppCard = React.memo(function AppCard({
  variant = 'default',
  onPress,
  style,
  children,
  ...props
}: AppCardProps) {
  const baseStyle: any = {
    borderRadius: radii.card,
    padding: 18,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.surface.border,
  };

  if (variant === 'elevated') {
    Object.assign(baseStyle, shadows.soft);
  } else if (variant === 'outlined') {
    baseStyle.borderWidth = 1.5;
    baseStyle.borderColor = colors.surface.border;
  } else if (variant === 'filled') {
    baseStyle.backgroundColor = colors.surface.raised;
    baseStyle.borderWidth = 0;
  } else {
    // Default — fine border + a light micro shadow
    Object.assign(baseStyle, shadows.card);
  }

  const content = (
    <View style={[baseStyle, style]} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity accessibilityRole="button" activeOpacity={0.9} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});
