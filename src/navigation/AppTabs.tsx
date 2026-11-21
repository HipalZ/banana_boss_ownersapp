import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { AppTabsParamList } from '@/types/navigation';
import { OwnerTabBar } from './OwnerTabBar';

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="ReportsTab"
      tabBar={(props) => <OwnerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="ReportsTab"  getComponent={() => require('./ReportsStack').ReportsStack}  options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="BillingTab"  getComponent={() => require('./BillingStack').BillingStack}  options={{ tabBarLabel: 'Billing' }} />
      <Tab.Screen name="WhatsappTab" getComponent={() => require('./WhatsappStack').WhatsappStack} options={{ tabBarLabel: 'WhatsApp' }} />
      <Tab.Screen name="FeedbackTab" getComponent={() => require('@/screens/Feedback/CustomerFeedbackScreen').CustomerFeedbackScreen} options={{ tabBarLabel: 'Feedback' }} />
      <Tab.Screen name="SettingsTab" getComponent={() => require('./SettingsStack').SettingsStack} options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}

