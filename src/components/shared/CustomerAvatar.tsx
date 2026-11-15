import React from 'react';
import { Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme';

interface CustomerAvatarProps {
  name?: string | null;
}

export function CustomerAvatar({ name }: CustomerAvatarProps) {
  const initial = name?.trim().charAt(0).toLocaleUpperCase() || 'G';

  return (
    <View
      accessible={false}
      style={{
        width: 42,
        height: 42,
        borderRadius: radii.tile,
        backgroundColor: colors.surface.raised,
        borderWidth: 1,
        borderColor: colors.surface.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text.base }}>
        {initial}
      </Text>
    </View>
  );
}
