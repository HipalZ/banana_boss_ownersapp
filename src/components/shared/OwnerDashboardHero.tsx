import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii, shadows } from '@/theme';
import { useThemeStore } from '@/stores/themeStore';
import { AdaptiveValueText } from './AdaptiveValueText';

interface OwnerDashboardHeroProps {
  eyebrow?: string;
  title: string;
  value?: string;
  detail: string;
  image: ImageSourcePropType;
  loading?: boolean;
  onPress: () => void;
}

export function OwnerDashboardHero({ eyebrow, title, value, detail, image, loading, onPress }: OwnerDashboardHeroProps) {
  const mode = useThemeStore((s) => s.mode);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const animateScale = (toValue: number) => {
    scale.value = withSpring(toValue, { damping: 20, stiffness: 260, reduceMotion: ReduceMotion.System });
  };
  return (
    <Animated.View style={animatedStyle}>
    <Pressable
      onPress={onPress}
      onPressIn={() => animateScale(0.985)}
      onPressOut={() => animateScale(1)}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${value ?? detail}. Open details`}
      style={{
        minHeight: 168,
        borderRadius: radii.hero,
        overflow: 'hidden',
        backgroundColor: mode === 'dark' ? '#27241F' : '#FFF7E1',
        borderWidth: 1,
        borderColor: mode === 'dark' ? 'rgba(243,206,92,0.23)' : '#F0DFAD',
        padding: 20,
        justifyContent: 'space-between',
        ...shadows.card,
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', right: -58, top: -80, width: 235, height: 235, borderRadius: 118, backgroundColor: mode === 'dark' ? 'rgba(243,206,92,0.08)' : 'rgba(244,208,63,0.19)' }} />
      <Image source={image} resizeMode="contain" style={{ position: 'absolute', width: 176, height: 156, right: 0, top: 5 }} />

      <View style={{ maxWidth: '62%', zIndex: 1 }}>
        {eyebrow && <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase' }}>{eyebrow}</Text>}
        <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.text.secondary, marginTop: eyebrow ? 8 : 0 }}>{title}</Text>
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ alignSelf: 'flex-start', marginTop: 12 }} />
        ) : (
          <AdaptiveValueText
            value={value ?? '—'}
            baseFontSize={31}
            minimumFontSize={20}
            style={{ width: '100%', fontFamily: fonts.extrabold, lineHeight: 39, letterSpacing: -1.1, color: colors.text.base, marginTop: 3 }}
          />
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '62%', zIndex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.secondary }}>{detail}</Text>
        <Icon name="arrow-up-right" size={14} color={colors.text.secondary} />
      </View>
    </Pressable>
    </Animated.View>
  );
}
