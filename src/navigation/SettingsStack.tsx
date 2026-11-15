import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/types/navigation';
import { SettingsOverviewScreen } from '@/screens/Settings/SettingsOverviewScreen';
import { OutletSelectorScreen } from '@/screens/Settings/OutletSelectorScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.surface.canvas },
  animation: 'slide_from_right' as const,
};

export function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="SettingsOverview" component={SettingsOverviewScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="OutletSelector" component={OutletSelectorScreen} options={{ title: 'Select Outlet' }} />
    </Stack.Navigator>
  );
}
