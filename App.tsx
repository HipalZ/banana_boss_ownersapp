import React, { useEffect, useState } from "react";
import { Platform, Text as RNText } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/queries/queryClient";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useOTAUpdates } from "@/hooks/useOTAUpdates";
import { fonts } from "@/theme";
import { useThemeStore } from '@/stores/themeStore';

// Inject Feather icon font on web so icons render correctly
function injectIconFont(family: string, url: string) {
  if (typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `@font-face { font-family: '${family}'; src: url('${url}') format('truetype'); }`;
  document.head.appendChild(style);
}

async function loadIconFonts() {
  try {
    // Static require — Metro resolves this path at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const featherFont = require("react-native-vector-icons/Fonts/Feather.ttf");
    injectIconFont("Feather", featherFont);
  } catch {
    // Non-fatal: icons fall back to empty sankalesh
  }
}

function configureDefaultTextFont() {
  const textComponent = RNText as any;
  if (textComponent.__brandFontConfigured) return;

  const defaultProps = textComponent.defaultProps || {};
  textComponent.defaultProps = {
    ...defaultProps,
    style: [defaultProps.style, { fontFamily: fonts.regular }],
  };
  textComponent.__brandFontConfigured = true;
}

export default function App() {
  // Auto-apply over-the-air (EAS) updates on launch + foreground.
  useOTAUpdates();
  const themeMode = useThemeStore((s) => s.mode);

  const [fontsReady, setFontsReady] = useState(Platform.OS !== "web");
  const [brandFontReady] = useFonts({
    PlusJakartaSans_400Regular: require('./assets/fonts/PlusJakartaSans_400Regular.ttf'),
    PlusJakartaSans_500Medium: require('./assets/fonts/PlusJakartaSans_500Medium.ttf'),
    PlusJakartaSans_600SemiBold: require('./assets/fonts/PlusJakartaSans_600SemiBold.ttf'),
    PlusJakartaSans_700Bold: require('./assets/fonts/PlusJakartaSans_700Bold.ttf'),
    PlusJakartaSans_800ExtraBold: require('./assets/fonts/PlusJakartaSans_800ExtraBold.ttf'),
    FontAwesome: require("react-native-vector-icons/Fonts/FontAwesome.ttf"),
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      loadIconFonts().finally(() => setFontsReady(true));
    }
  }, []);

  if (brandFontReady) {
    configureDefaultTextFont();
  }

  if (!fontsReady || !brandFontReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
