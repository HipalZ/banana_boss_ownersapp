import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MotiView } from 'moti';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import type { AppTabsParamList } from '@/types/navigation';
import { colors, fonts, shadows } from '@/theme';
import { useThemeStore } from '@/stores/themeStore';

const tabs: Record<keyof AppTabsParamList, { label: string; icon: string; brand?: boolean }> = {
  ReportsTab: { label: 'Reports', icon: 'bar-chart-2' },
  BillingTab: { label: 'Billing', icon: 'file-text' },
  WhatsappTab: { label: 'WhatsApp', icon: 'whatsapp', brand: true },
  FeedbackTab: { label: 'Feedback', icon: 'star' },
  SettingsTab: { label: 'Account', icon: 'user' },
};

export function OwnerTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const mode = useThemeStore((s) => s.mode);
  const [width, setWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const positioned = useRef(false);
  const barWidth = Math.min(screenWidth - 24, 490);
  const slot = width / state.routes.length;

  useEffect(() => {
    if (!width) return;
    const target = state.index * slot + (slot - 24) / 2;
    if (!positioned.current) {
      indicatorX.value = target;
      positioned.current = true;
    } else {
      indicatorX.value = withSpring(target, {
        damping: 24,
        stiffness: 220,
        mass: 0.8,
        reduceMotion: ReduceMotion.System,
      });
    }
  }, [indicatorX, state.index, slot, width]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: indicatorX.value }] }));
  const activeColor = mode === 'dark' ? colors.primary : colors.tint.accent.fg;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(10, insets.bottom + 4), alignItems: 'center' }}>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{
          width: barWidth,
          height: 72,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface.card,
          borderWidth: 1,
          borderColor: colors.surface.border,
          borderRadius: 27,
          ...shadows.soft,
          shadowOpacity: mode === 'dark' ? 0.3 : 0.12,
        }}
      >
        {width > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[{
              position: 'absolute',
              bottom: 5,
              left: 0,
              width: 24,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.primary,
            }, indicatorStyle]}
          />
        )}

        {state.routes.map((route, index) => {
          const tab = tabs[route.name as keyof AppTabsParamList];
          const focused = index === state.index;
          const iconColor = focused ? activeColor : colors.text.secondary;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <MotiView animate={{ scale: focused ? 1.08 : 1, translateY: focused ? -1 : 0 }} transition={{ type: 'timing', duration: 230 }} style={{ width: 28, height: 25, alignItems: 'center', justifyContent: 'center' }}>
                {tab.brand ? (
                  <FontAwesomeIcon name={tab.icon} size={21} color={iconColor} />
                ) : (
                  <FeatherIcon name={tab.icon} size={20} color={iconColor} />
                )}
              </MotiView>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ fontFamily: focused ? fonts.bold : fonts.medium, fontSize: 10, color: focused ? activeColor : colors.text.secondary, textAlign: 'center', width: '100%', paddingHorizontal: 2 }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
