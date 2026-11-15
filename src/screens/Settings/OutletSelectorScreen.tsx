import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/types/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { queryClient } from '@/queries/queryClient';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { EmptyState } from '@/components/shared';
import { AppCard } from '@/components/primitives';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii } from '@/theme';

export function OutletSelectorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const outlets = useAuthStore((s) => s.outlets);
  const selectedBusiness = useAppStore((s) => s.selectedBusiness);
  const setSelectedBusiness = useAppStore((s) => s.setSelectedBusiness);

  const handleSelect = (id: string) => {
    setSelectedBusiness(id);
    queryClient.invalidateQueries({ queryKey: ['reports'] });
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.invalidateQueries({ queryKey: ['payment-modes'] });
    queryClient.invalidateQueries({ queryKey: ['dues-users'] });
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <TopBar title="Switch business" showBack onBack={() => navigation.goBack()} />
      <FlatList
        data={outlets || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isSelected = item._id === selectedBusiness;
          return (
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: isSelected }} accessibilityLabel={`${item.name}${isSelected ? ', current business' : ''}`} onPress={() => handleSelect(item._id)}>
              <AppCard
                style={{
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  minHeight: 76,
                  borderColor: isSelected ? colors.primary : colors.surface.border,
                  borderWidth: isSelected ? 2 : 1,
                }}
              >
                <View style={{ width: 42, height: 42, borderRadius: radii.tile, backgroundColor: colors.surface.raised, borderWidth: 1, borderColor: colors.surface.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Icon name="home" size={17} color={colors.text.base} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={2} style={{ fontSize: 15, lineHeight: 20, fontFamily: fonts.bold, color: colors.text.base }}>{item.name}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: fonts.regular, color: colors.text.muted, marginTop: 3 }}>
                    {item.registerName || item.name}
                  </Text>
                </View>
                {isSelected && <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.text.secondary, marginLeft: 8 }}>Current</Text>}
                {isSelected ? <Icon name="check-circle" size={20} color={colors.primaryDark} style={{ marginLeft: 8 }} /> : <Icon name="chevron-right" size={18} color={colors.text.muted} style={{ marginLeft: 8 }} />}
              </AppCard>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<EmptyState icon="home" title="No businesses available" subtitle="Ask an administrator to add this account to a business." />}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
      />
    </ScreenWrapper>
  );
}
