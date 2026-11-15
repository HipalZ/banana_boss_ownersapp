import React, { useState } from 'react';
import { View, Text, FlatList, Modal, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BillingStackParamList } from '@/types/navigation';
import { useOutlet } from '@/hooks/useOutlet';
import { useNpcUsersQuery, useCreateNpcUserMutation } from '@/queries/npcUser';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { BillingActionButton } from './BillingActionButton';
import { BillingAccountRow } from './BillingAccountRow';
import { AppButton } from '@/components/primitives/AppButton';
import { AppInput } from '@/components/primitives/AppInput';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/shared';
import Icon from 'react-native-vector-icons/Feather';
import { formatDateTime } from '@/utils/date';
import { colors, fonts, radii } from '@/theme';

export function NpcScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<BillingStackParamList>>();
  const { outletId } = useOutlet();
  const { data, isLoading, isError, refetch } = useNpcUsersQuery(outletId);
  const createMutation = useCreateNpcUserMutation(outletId);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleAddNpcUser = async () => {
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
      });

      setModalVisible(false);
      setName('');
      setPhone('');
      Alert.alert('Success', 'NPC profile created successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to create NPC profile.');
    }
  };

  return (
    <ScreenWrapper>
      <TopBar title="NPC Accounts" showBack onBack={() => navigation.goBack()} rightActions={<BillingActionButton label="Add account" onPress={() => setModalVisible(true)} />} />

      <View style={{ marginTop: 16, marginBottom: 12, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 18, fontFamily: fonts.bold, color: colors.text.base }}>Complimentary accounts</Text>
        <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.text.muted, marginTop: 3 }}>{data?.length ?? 0} guest profiles</Text>
      </View>

      {isLoading ? <LoadingSkeleton type="bill-row" count={4} /> : isError ? <ErrorState onRetry={refetch} /> : <FlatList
        data={data || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const displayName = item.userName || item.name || 'Unknown User';
          const displayPhone = item.userPhone || item.phone || 'No Phone';

          return <BillingAccountRow name={displayName} phone={displayPhone} detail={item.createdAt ? formatDateTime(new Date(item.createdAt).getTime()).split(',')[0] : 'N/A'} detailLabel="Created" />;
        }}
        ListEmptyComponent={<EmptyState title="No NPC Registry Profiles" subtitle="Add Complimentary accounts for special guests." />}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />}

      {/* Add NPC User Modal */}
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
                Add NPC Account
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                <Icon name="x" size={22} color={colors.text.base} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <AppInput
                label="Guest / Account Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter guest or account name"
                autoCapitalize="words"
              />

              <AppInput
                label="Phone Number (Optional)"
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
                  label="Create Account"
                  variant="primary"
                  onPress={handleAddNpcUser}
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
