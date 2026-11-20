import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { BillingStackParamList } from '@/types/navigation';
import { BillingOverviewScreen } from '@/screens/Billing/BillingOverviewScreen';
import { RunningTablesScreen } from '@/screens/Billing/RunningTablesScreen';
import { SalesDashboardScreen } from '@/screens/Billing/SalesDashboardScreen';
import { BillsListScreen } from '@/screens/Billing/BillsListScreen';
import { BillDetailScreen } from '@/screens/Billing/BillDetailScreen';
import { PaymentModesScreen } from '@/screens/Billing/PaymentModesScreen';
import { DuesScreen } from '@/screens/Billing/DuesScreen';
import { NpcScreen } from '@/screens/Billing/NpcScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<BillingStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.surface.canvas },
  animation: 'slide_from_right' as const,
};

export function BillingStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="BillingOverview" component={BillingOverviewScreen} options={{ title: 'Billing' }} />
      <Stack.Screen name="RunningTables" component={RunningTablesScreen} options={{ title: 'Running Tables' }} />
      <Stack.Screen name="SalesDashboard" component={SalesDashboardScreen} options={{ title: 'Sales Dashboard' }} />
      <Stack.Screen name="BillsList" component={BillsListScreen} options={{ title: 'Bills' }} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} options={{ title: 'Bill Detail' }} />
      <Stack.Screen name="PaymentModes" component={PaymentModesScreen} options={{ title: 'Payment Modes' }} />
      <Stack.Screen name="Dues" component={DuesScreen} options={{ title: 'Dues' }} />
      <Stack.Screen name="Npc" component={NpcScreen} options={{ title: 'NPC' }} />
    </Stack.Navigator>
  );
}
