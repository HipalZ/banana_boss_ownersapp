import React, { useEffect, useState } from "react";
import { Platform, Text as RNText } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/queries/queryClient";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useOTAUpdates } from "@/hooks/useOTAUpdates";
import { fonts } from "@/theme";

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
  if (textComponent.__poppinsConfigured) return;

  const defaultProps = textComponent.defaultProps || {};
  textComponent.defaultProps = {
    ...defaultProps,
    style: [defaultProps.style, { fontFamily: fonts.regular }],
  };
  textComponent.__poppinsConfigured = true;
}

export default function App() {
  // Auto-apply over-the-air (EAS) updates on launch + foreground.
  useOTAUpdates();

  const [fontsReady, setFontsReady] = useState(Platform.OS !== "web");
  const [poppinsReady] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    FontAwesome: require("react-native-vector-icons/Fonts/FontAwesome.ttf"),
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      loadIconFonts().finally(() => setFontsReady(true));
    }
  }, []);

  if (poppinsReady) {
    configureDefaultTextFont();
  }

  if (!fontsReady || !poppinsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
