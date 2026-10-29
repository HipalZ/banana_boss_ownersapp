import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WhatsappStackParamList } from '@/types/navigation';
import { WhatsappCustomersScreen } from '@/screens/Whatsapp/WhatsappCustomersScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<WhatsappStackParamList>();

export function WhatsappStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.canvas },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="WhatsappCustomers" component={WhatsappCustomersScreen} />
    </Stack.Navigator>
  );
}
