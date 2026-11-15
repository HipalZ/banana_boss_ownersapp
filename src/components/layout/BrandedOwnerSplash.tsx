import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '@/theme';

interface BrandedOwnerSplashProps {
  outletName: string;
  logoUrl?: string;
  onComplete: () => void;
}

/** The outlet mark is available from login data; no extra request is needed. */
export function BrandedOwnerSplash({ outletName, logoUrl, onComplete }: BrandedOwnerSplashProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.95);
  const onCompleteRef = useRef(onComplete);
  const [logoFailed, setLogoFailed] = useState(false);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!reduceMotion) {
      opacity.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
      scale.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    }
    const exitTimer = setTimeout(() => {
      if (reduceMotion) {
        onCompleteRef.current();
        return;
      }
      opacity.value = withTiming(0, { duration: 260, easing: Easing.inOut(Easing.cubic) });
      const finishTimer = setTimeout(() => onCompleteRef.current(), 260);
      finishTimerRef.current = finishTimer;
    }, 1500);
    const finishTimerRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };
    return () => {
      clearTimeout(exitTimer);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [opacity, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#FBF8EF', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar style="dark" />
      <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }, animatedStyle]}>
        <View style={{ width: 184, height: 184, borderRadius: 92, padding: 6, borderWidth: 1, borderColor: 'rgba(216,166,41,0.22)', backgroundColor: 'rgba(255,255,255,0.62)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 170, height: 170, borderRadius: 85, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#D8A629', alignItems: 'center', justifyContent: 'center' }}>
            {logoUrl?.trim() && !logoFailed ? (
              <Image source={{ uri: logoUrl.trim() }} onError={() => setLogoFailed(true)} resizeMode="contain" accessibilityLabel={`${outletName} logo`} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={{ color: '#0B4A3A', fontFamily: fonts.bold, fontSize: 56 }}>{outletName.trim().slice(0, 1).toUpperCase()}</Text>
            )}
          </View>
        </View>
        <Text numberOfLines={2} style={{ color: '#0B4A3A', fontFamily: fonts.medium, fontSize: 30, lineHeight: 38, textAlign: 'center', marginTop: 28 }}>
          {outletName}
        </Text>
      </Animated.View>
      <Image source={require('../../../assets/splash-restaurant-pattern.png')} resizeMode="stretch" style={{ position: 'absolute', left: 0, right: 0, bottom: 62, width: '100%', height: 168, opacity: 0.32 }} />
      <View style={{ alignItems: 'center', gap: 4, paddingBottom: 20 }}>
        <Text style={{ color: '#77736D', fontFamily: fonts.semibold, fontSize: 9, letterSpacing: 1.8 }}>POWERED BY</Text>
        <Text style={{ color: '#292B2A', fontFamily: fonts.bold, fontSize: 17 }}>Banana Boss</Text>
      </View>
    </View>
  );
}
