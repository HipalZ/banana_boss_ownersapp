import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import type { AppTabsParamList } from '@/types/navigation';
import { ReportsStack } from './ReportsStack';
import { BillingStack } from './BillingStack';
import { SettingsStack } from './SettingsStack';
import { WhatsappStack } from './WhatsappStack';
import { colors, fonts, radii, shadows } from '@/theme';

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="BillingTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'ReportsTab':   iconName = 'bar-chart-2'; break;
            case 'BillingTab':   iconName = 'credit-card'; break;
            case 'WhatsappTab':  iconName = 'message-circle'; break;
            case 'SettingsTab':  iconName = 'user'; break;
            default:             iconName = 'circle';
          }
          return <Icon name={iconName} size={size - 2} color={color} />;
        },
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.text.faint,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.semibold,
          marginTop: -2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: colors.surface.card,
          borderRadius: radii.hero,
          height: 68,
          paddingBottom: Platform.OS === 'ios' ? 4 : 8,
          paddingTop: 8,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.surface.border,
          ...shadows.soft,
        },
      })}
    >
      <Tab.Screen name="ReportsTab"  component={ReportsStack}  options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="BillingTab"  component={BillingStack}  options={{ tabBarLabel: 'Billing' }} />
      <Tab.Screen name="WhatsappTab" component={WhatsappStack} options={{ tabBarLabel: 'WhatsApp' }} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}

