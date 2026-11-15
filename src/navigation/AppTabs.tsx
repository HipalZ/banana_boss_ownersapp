import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { AppTabsParamList } from '@/types/navigation';
import { ReportsStack } from './ReportsStack';
import { BillingStack } from './BillingStack';
import { SettingsStack } from './SettingsStack';
import { WhatsappStack } from './WhatsappStack';
import { CustomerFeedbackScreen } from '@/screens/Feedback/CustomerFeedbackScreen';
import { OwnerTabBar } from './OwnerTabBar';

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="ReportsTab"
      tabBar={(props) => <OwnerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="ReportsTab"  component={ReportsStack}  options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="BillingTab"  component={BillingStack}  options={{ tabBarLabel: 'Billing' }} />
      <Tab.Screen name="WhatsappTab" component={WhatsappStack} options={{ tabBarLabel: 'WhatsApp' }} />
      <Tab.Screen name="FeedbackTab" component={CustomerFeedbackScreen} options={{ tabBarLabel: 'Feedback' }} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}

