import React, { useState } from 'react';
import { View, Text, FlatList, Modal, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BillingStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useDuesUsersQuery, useCreateDuesUserMutation } from '@/queries/duesUser';
import { useCurrency } from '@/hooks/useCurrency';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { AppCard } from '@/components/primitives/AppCard';
import { AppButton } from '@/components/primitives/AppButton';
import { AppInput } from '@/components/primitives/AppInput';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/shared';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii } from '@/theme';

export function DuesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<BillingStackParamList>>();
  const { outletId } = useOutlet();
  const { data, isLoading, isError, refetch } = useDuesUsersQuery(outletId);
  const createMutation = useCreateDuesUserMutation(outletId);
  const { format } = useCurrency();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleAddDueUser = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');

    try {
      await createMutation.mutateAsync({
        outletId: outletId!,
        name: name.trim(),
        phone: phone.trim() || undefined,
        status: true,
        currentDuesAmount: 0,
      });

      setModalVisible(false);
      setName('');
      setPhone('');
      Alert.alert('Success', 'Dues profile created successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to create dues profile.');
    }
  };

  return (
    <ScreenWrapper>
      <TopBar 
        title="Dues Ledger" 
        showBack 
        onBack={() => navigation.goBack()} 
        rightActions={
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: colors.primaryDark,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: radii.chip,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={14} color={colors.onPrimary} />
            <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.onPrimary }}>Add User</Text>
          </TouchableOpacity>
        }
      />

      <View style={{ marginVertical: 8, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: colors.text.muted }}>
          Outstanding Balances
        </Text>
      </View>

      {isLoading && <LoadingSkeleton type="card-grid" count={6} />}
      {isError && <ErrorState onRetry={refetch} />}

      <FlatList
        data={data || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const displayName = item.userName || item.name || 'Unknown User';
          const displayPhone = item.userPhone || item.phone || 'No Phone';

          return (
          <AppCard style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface.card }}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: radii.tile,
              backgroundColor: colors.surface.raised,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.surface.border,
            }}>
              <Text style={{ fontSize: 14, fontFamily: fonts.extrabold, color: colors.text.secondary }}>
                {displayName.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 15, fontFamily: fonts.bold, color: colors.text.base }}>{displayName}</Text>
              <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.text.muted, marginTop: 3 }}>{displayPhone}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 16, fontFamily: fonts.extrabold, color: item.currentDuesAmount > 0 ? colors.danger : colors.success }}>
                {format(item.currentDuesAmount)}
              </Text>
              <View style={{
                marginTop: 4,
                backgroundColor: item.status ? colors.tint.green.bg : colors.surface.raised,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: radii.chip,
                borderWidth: 1,
                borderColor: item.status ? colors.tint.green.fg : colors.surface.border,
              }}>
                <Text style={{ fontSize: 9, fontFamily: fonts.bold, color: item.status ? colors.success : colors.text.muted }}>
                  {item.status ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>
          </AppCard>
          );
        }}
        ListEmptyComponent={<EmptyState title="No Dues Accounts" subtitle="Add customer profiles to manage outstanding dues." />}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Dues User Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: colors.surface.overlay,
        }}>
          <View style={{
            backgroundColor: colors.surface.canvas,
            borderTopLeftRadius: radii.hero,
            borderTopRightRadius: radii.hero,
            padding: 24,
            maxHeight: '80%',
            borderTopWidth: 1,
            borderColor: colors.surface.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontFamily: fonts.extrabold, color: colors.text.base }}>
                Add Dues Profile
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                <Icon name="x" size={22} color={colors.text.base} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <AppInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter customer name"
                autoCapitalize="words"
              />

              <AppInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter 10-digit number"
                keyboardType="phone-pad"
              />

              {error ? (
                <Text style={{ color: colors.danger, fontSize: 13, fontFamily: fonts.semibold, marginBottom: 16 }}>
                  {error}
                </Text>
              ) : null}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 24 }}>
                <AppButton
                  label="Cancel"
                  variant="secondary"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <AppButton
                  label="Create Profile"
                  variant="primary"
                  onPress={handleAddDueUser}
                  loading={createMutation.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
