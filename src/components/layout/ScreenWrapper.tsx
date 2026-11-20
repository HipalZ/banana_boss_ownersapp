import React from 'react';
import {
  View,
  Image,
  ScrollView,
  RefreshControl,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { useThemeStore } from '@/stores/themeStore';
import { TopBar } from './TopBar';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshControl?: boolean;
  onRefresh?: () => void;
  padding?: boolean;
  horizontalPadding?: number;
  hasTabBar?: boolean;
  bg?: string;
  /** Fixed header (e.g. <TopBar/>) pinned above the scroll area. */
  header?: React.ReactNode;
}

export const ScreenWrapper = React.memo(function ScreenWrapper({
  children,
  scrollable,
  refreshControl,
  onRefresh,
  padding = true,
  horizontalPadding = 16,
  hasTabBar = true,
  bg = colors.surface.canvas,
  header,
  style,
  ...props
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const showCanvasPattern = bg === colors.surface.canvas;
  const canvasPattern = showCanvasPattern ? (
    <Image
      source={themeMode === 'dark'
        ? require('../../../assets/owner-dark-dots.png')
        : require('../../../assets/owner-light-dots.png')}
      resizeMode="stretch"
      style={{ position: 'absolute', width: '100%', height: '100%', opacity: themeMode === 'dark' ? 0.14 : 0.7 }}
    />
  ) : null;

  const containerStyle = {
    flex: 1,
    backgroundColor: bg,
    paddingTop: insets.top,
  };

  const contentStyle = {
    flex: 1,
    paddingHorizontal: padding ? horizontalPadding : 0,
  };

  const bottomOffset = hasTabBar ? (insets.bottom + 96) : (insets.bottom + 16);

  // Pin the header: use the explicit `header` prop, or auto-detect a <TopBar/>
  // rendered as a child so every screen gets a fixed header without changes.
  let pinned: React.ReactNode = header ?? null;
  let scrollChildren: React.ReactNode = children;
  if (!header) {
    const arr = React.Children.toArray(children);
    const idx = arr.findIndex(
      (child) => React.isValidElement(child) && child.type === TopBar,
    );
    if (idx >= 0) {
      pinned = arr[idx];
      scrollChildren = arr.filter((_, i) => i !== idx);
    }
  }

  // Fixed header sits outside the scroll view so it stays pinned at the top.
  const fixedHeader = pinned ? (
    <View style={{ paddingHorizontal: padding ? horizontalPadding : 0 }}>
      {pinned}
    </View>
  ) : null;

  if (scrollable) {
    return (
      <View style={containerStyle}>
        {canvasPattern}
        {fixedHeader}
        <ScrollView
          style={contentStyle}
          contentContainerStyle={{ paddingBottom: bottomOffset }}
          refreshControl={
            refreshControl && onRefresh ? (
              <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primaryDark} />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
          {...props}
        >
          {scrollChildren}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {canvasPattern}
      {fixedHeader}
      <View style={[contentStyle, { paddingBottom: bottomOffset }, style]} {...props}>
        {scrollChildren}
      </View>
    </View>
  );
});
