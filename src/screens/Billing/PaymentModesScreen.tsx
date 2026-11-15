import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BillingStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { usePaymentModesQuery, useCreatePaymentModeMutation, useUpdatePaymentModeMutation } from '@/queries/paymentMode';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { AppCard, AppButton } from '@/components/primitives';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/shared';
import { colors, fonts, radii } from '@/theme';
import { paymentModeLabel } from '@/utils/paymentModeLabel';
import { BillingActionButton } from './BillingActionButton';

// The server accepts only these payment mode names.
const PAYMENT_MODE_NAMES = [
  'CASH', 'UPI_MACHINE', 'CARD_MACHINE', 'NPC', 'ZOMATO_PAY',
  'SWIGGY_PAY', 'DUES', 'COMPLEMENTARY', 'SPLIT', 'UPI',
  'BANANA_PAY', 'EASY_DINER', 'MAGIC_PIN', 'AMEX_CARD',
  'COVER_CHARGE', 'RAZOR_PAY',
] as const;

export function PaymentModesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<BillingStackParamList>>();
  const { outletId } = useOutlet();
  const { data, isLoading, isError, refetch } = usePaymentModesQuery(outletId);
  const createMutation = useCreatePaymentModeMutation(outletId);
  const updateMutation = useUpdatePaymentModeMutation(outletId);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [saveError, setSaveError] = useState('');
  const availableNames = PAYMENT_MODE_NAMES.filter((name) => !data?.some((mode) => mode.name === name));

  const handleAdd = async () => {
    if (!outletId || !newName || createMutation.isPending) return;
    setSaveError('');
    try {
      await createMutation.mutateAsync({ outletId, name: newName, status: true });
      setShowAdd(false);
      setNewName('');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not add payment mode. Please try again.');
    }
  };

  const toggleStatus = (id: string, current: boolean) => {
    updateMutation.mutate({ id, payload: { status: !current } });
  };

  return (
    <ScreenWrapper>
      <TopBar title="Payment Modes" showBack onBack={() => navigation.goBack()} rightActions={<BillingActionButton label="Add mode" onPress={() => { setNewName(''); setSaveError(''); setShowAdd(true); }} disabled={!outletId || isLoading || isError || availableNames.length === 0} />} />

      <View style={{ marginTop: 16, marginBottom: 12, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 18, fontFamily: fonts.bold, color: colors.text.base }}>Accepted payment modes</Text>
        <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.text.muted, marginTop: 3 }}>{data?.filter((mode) => mode.status).length ?? 0} active modes</Text>
      </View>

      {isLoading ? <LoadingSkeleton type="bill-row" count={6} /> : isError ? <ErrorState onRetry={refetch} /> : <FlatList
        data={data || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AppCard style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: fonts.bold, color: colors.text.base }}>{paymentModeLabel(item.name)}</Text>
              <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: colors.text.faint }}>{item.status ? 'Active' : 'Inactive'}</Text>
            </View>
            <Switch
              value={item.status}
              onValueChange={() => toggleStatus(item._id, item.status)}
              trackColor={{ false: colors.surface.border, true: colors.primary }}
              thumbColor={item.status ? colors.primaryDark : colors.text.faint}
            />
          </AppCard>
        )}
        ListEmptyComponent={<EmptyState title="No payment modes" subtitle="Add a payment mode to get started." />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />}

      {showAdd && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface.card, padding: 16, borderTopWidth: 1, borderTopColor: colors.surface.borderSoft }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text.base, marginBottom: 10 }}>Select payment mode</Text>
          <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
            {availableNames.map((name) => (
              <TouchableOpacity
                key={name}
                accessibilityRole="radio"
                accessibilityState={{ selected: newName === name }}
                onPress={() => { setNewName(name); setSaveError(''); }}
                style={{ padding: 12, marginBottom: 6, borderRadius: radii.tile, borderWidth: 1, borderColor: newName === name ? colors.primaryDark : colors.surface.border, backgroundColor: newName === name ? colors.surface.raised : colors.surface.card }}
              >
                <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.text.base }}>{paymentModeLabel(name)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {!!saveError && <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.danger, marginTop: 8 }}>{saveError}</Text>}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <AppButton label="Cancel" onPress={() => { setShowAdd(false); setNewName(''); setSaveError(''); }} variant="ghost" disabled={createMutation.isPending} style={{ flex: 1 }} />
            <AppButton label="Save" onPress={handleAdd} disabled={!newName || !outletId} loading={createMutation.isPending} style={{ flex: 1 }} />
          </View>
        </View>
      )}

    </ScreenWrapper>
  );
}
