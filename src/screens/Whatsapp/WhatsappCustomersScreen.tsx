import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useIsFocused } from '@react-navigation/native';
import { useOutlet } from '@/hooks/useOutlet';
import {
  useWhatsappCustomersQuery,
  useWhatsappIntegrationQuery,
} from '@/queries/whatsappCustomers';
import type {
  WhatsappCustomer,
  WhatsappCustomerSort,
  WhatsappCustomerType,
} from '@/api/services/whatsappCustomers/whatsappCustomers.types';
import type { DateRangeValue } from '@/stores/appStore';
import { ScreenWrapper, TopBar } from '@/components/layout';
import {
  DateRangePicker,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  MetricCard,
} from '@/components/shared';
import { AppButton, AppCard } from '@/components/primitives';
import { colors, fonts, radii } from '@/theme';
import { formatDateTime } from '@/utils/date';
import {
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_PHONE,
} from '@/config/support';
import { whatsappCustomersApi } from '@/api/services/whatsappCustomers/whatsappCustomers.api';

const initialDateRange = (): DateRangeValue => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return { from: from.getTime(), to: to.getTime(), preset: 'today' };
};

const sortOptions: { label: string; value: WhatsappCustomerSort }[] = [
  { label: 'Recently active', value: 'RECENT' },
  { label: 'Most scans', value: 'MOST_SCANS' },
  { label: 'Customer name', value: 'NAME' },
  { label: 'First seen', value: 'FIRST_SEEN' },
];

const customerTypes: { label: string; value: WhatsappCustomerType }[] = [
  { label: 'All customers', value: 'ALL' },
  { label: 'New', value: 'NEW' },
  { label: 'Returning', value: 'RETURNING' },
];

const phoneDigits = (value: string) => value.replace(/\D/g, '');

export function WhatsappCustomersScreen() {
  const { outletId, currentOutlet } = useOutlet();
  const isScreenFocused = useIsFocused();
  const [dateRange, setDateRange] = useState<DateRangeValue>(initialDateRange);
  const [draftSearch, setDraftSearch] = useState('');
  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [customerType, setCustomerType] = useState<WhatsappCustomerType>('ALL');
  const [tableName, setTableName] = useState('');
  const [sort, setSort] = useState<WhatsappCustomerSort>('RECENT');
  const [draftCustomerType, setDraftCustomerType] = useState<WhatsappCustomerType>('ALL');
  const [draftTableName, setDraftTableName] = useState('');
  const [draftSort, setDraftSort] = useState<WhatsappCustomerSort>('RECENT');
  const [isDownloading, setIsDownloading] = useState(false);

  const integrationQuery = useWhatsappIntegrationQuery(outletId, isScreenFocused);
  const integrationActive = Boolean(
    integrationQuery.data?.enabled && integrationQuery.data?.buzbizPhoneNumberId,
  );

  const params = useMemo(
    () =>
      outletId
        ? {
            outletId,
            // The server resolves Today using the outlet billing cycle and any
            // active extension. Other presets send their explicit range.
            ...(dateRange.preset === 'today'
              ? {}
              : { from: dateRange.from, to: dateRange.to }),
            search: search || undefined,
            tableName: tableName || undefined,
            customerType,
            sort,
            page,
            limit: 20,
          }
        : null,
    [outletId, dateRange, search, tableName, customerType, sort, page],
  );

  const customersQuery = useWhatsappCustomersQuery(
    params,
    integrationActive && isScreenFocused,
  );
  const data = customersQuery.data;
  const activeFilterCount =
    (customerType !== 'ALL' ? 1 : 0) + (tableName ? 1 : 0) + (sort !== 'RECENT' ? 1 : 0);

  const submitSearch = () => {
    const value = draftSearch.trim();
    if (/^[+\d\s()-]+$/.test(value) && value) {
      const digits = phoneDigits(value);
      if (digits.length !== 4 && (digits.length < 10 || digits.length > 15)) {
        setSearchError('Enter a complete phone number or the last 4 digits.');
        return;
      }
    }
    setSearchError('');
    setSearch(value);
    setPage(1);
  };

  const clearSearch = () => {
    setDraftSearch('');
    setSearch('');
    setSearchError('');
    setPage(1);
  };

  const openFilters = () => {
    setDraftCustomerType(customerType);
    setDraftTableName(tableName);
    setDraftSort(sort);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setCustomerType(draftCustomerType);
    setTableName(draftTableName.trim());
    setSort(draftSort);
    setPage(1);
    setFiltersOpen(false);
  };

  const openUrl = async (url: string, failureMessage: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open', failureMessage);
    }
  };

  const contactAdministrator = () => {
    const businessName = currentOutlet?.name || 'my business';
    const text = encodeURIComponent(
      `Hi, I would like to activate WhatsApp Customers for ${businessName}.`,
    );
    void openUrl(
      `https://wa.me/${SUPPORT_WHATSAPP_PHONE}?text=${text}`,
      `Please contact the administrator at ${SUPPORT_WHATSAPP_DISPLAY}.`,
    );
  };

  const downloadCustomers = async () => {
    if (!params || isDownloading) return;
    setIsDownloading(true);
    try {
      await whatsappCustomersApi.downloadXlsx(params);
    } catch (error) {
      Alert.alert(
        'Download failed',
        error instanceof Error ? error.message : 'Unable to download the customer Excel file.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const renderCustomer = ({ item }: { item: WhatsappCustomer }) => {
    const digits = phoneDigits(item.phone);
    const isNew = item.customerType === 'NEW';
    return (
      <AppCard style={{ marginBottom: 12, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: radii.tile,
              backgroundColor: colors.tint.green.bg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 14, color: colors.tint.green.fg }}>
              {(item.name || 'WC').slice(0, 2).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text
                numberOfLines={1}
                style={{ flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.text.base }}
              >
                {item.name}
              </Text>
              <View
                style={{
                  borderRadius: radii.full,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  backgroundColor: isNew ? colors.tint.sky.bg : colors.tint.violet.bg,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: 9,
                    color: isNew ? colors.tint.sky.fg : colors.tint.violet.fg,
                  }}
                >
                  {isNew ? 'NEW' : 'REPEAT'}
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text.secondary, marginTop: 3 }}>
              {item.phone}
            </Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.text.muted, marginTop: 6 }}>
              {item.scansInRange} {item.scansInRange === 1 ? 'scan' : 'scans'} this period
              {item.lastTableName ? ` · Table ${item.lastTableName}` : ''}
            </Text>
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginTop: 2 }}>
              Last active {formatDateTime(item.lastSeenAt)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            onPress={() =>
              void openUrl(`https://wa.me/${digits}`, 'WhatsApp could not be opened for this customer.')
            }
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radii.chip,
              backgroundColor: colors.tint.green.bg,
              borderWidth: 1,
              borderColor: colors.surface.border,
            }}
          >
            <FontAwesomeIcon name="whatsapp" size={17} color={colors.tint.green.fg} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => void openUrl(`tel:${item.phone}`, 'Calling is unavailable on this device.')}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radii.chip,
              backgroundColor: colors.surface.raised,
              borderWidth: 1,
              borderColor: colors.surface.border,
            }}
          >
            <Icon name="phone" size={16} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      </AppCard>
    );
  };

  if (integrationQuery.isLoading) {
    return (
      <ScreenWrapper>
        <TopBar title="WhatsApp Customers" subtitle="Customer activity from WhatsApp QR scans" />
        <LoadingSkeleton type="card-grid" count={4} />
      </ScreenWrapper>
    );
  }

  if (integrationQuery.isError) {
    return (
      <ScreenWrapper>
        <TopBar title="WhatsApp Customers" subtitle="Customer activity from WhatsApp QR scans" />
        <ErrorState
          title="WhatsApp connection unavailable"
          subtitle="We could not verify this outlet's WhatsApp connection."
          onRetry={integrationQuery.refetch}
        />
      </ScreenWrapper>
    );
  }

  if (!integrationActive) {
    return (
      <ScreenWrapper scrollable>
        <TopBar title="WhatsApp Customers" subtitle="Customer activity from WhatsApp QR scans" />
        <AppCard style={{ marginTop: 20, padding: 24 }}>
          <Text style={{ fontFamily: fonts.extrabold, fontSize: 22, color: colors.text.base }}>
            Know your WhatsApp customers
          </Text>
          <Text
            style={{
              fontFamily: fonts.regular,
              fontSize: 13,
              lineHeight: 21,
              color: colors.text.muted,
              marginTop: 10,
              marginBottom: 22,
            }}
          >
            Connect WhatsApp to view customer scans and repeat visits.
          </Text>
          <TouchableOpacity
            onPress={contactAdministrator}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 14,
              paddingHorizontal: 22,
              borderRadius: radii.tile,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary }}>
              Contact administrator
            </Text>
          </TouchableOpacity>
        </AppCard>
      </ScreenWrapper>
    );
  }

  const listHeader = (
    <View>
      <View
        style={{
          marginVertical: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <DateRangePicker
          value={dateRange}
          onChange={(value) => {
            setDateRange(value);
            setPage(1);
          }}
          outletId={outletId}
          dark
        />

        <TouchableOpacity
          onPress={openFilters}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: radii.chip,
            backgroundColor: colors.surface.raised,
            borderWidth: 1,
            borderColor: colors.surface.border,
          }}
        >
          <Icon name="sliders" size={14} color={colors.text.secondary} />
          <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.text.secondary }}>
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'stretch' }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface.raised,
            borderRadius: radii.tile,
            borderWidth: 1,
            borderColor: searchError ? colors.danger : colors.surface.border,
            paddingHorizontal: 12,
          }}
        >
          <Icon name="search" size={17} color={colors.text.faint} />
          <TextInput
            value={draftSearch}
            onChangeText={(value) => {
              setDraftSearch(value);
              if (searchError) setSearchError('');
            }}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            placeholder="Name, full phone or last 4"
            placeholderTextColor={colors.text.faint}
            style={{
              flex: 1,
              color: colors.text.base,
              fontFamily: fonts.medium,
              fontSize: 12,
              paddingVertical: 12,
              marginLeft: 8,
            }}
          />
          {draftSearch ? (
            <TouchableOpacity onPress={clearSearch} hitSlop={8}>
              <Icon name="x" size={16} color={colors.text.faint} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={submitSearch}
          style={{
            paddingHorizontal: 15,
            borderRadius: radii.tile,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.onPrimary }}>Search</Text>
        </TouchableOpacity>
      </View>
      {searchError ? (
        <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.danger, marginTop: 6 }}>
          {searchError}
        </Text>
      ) : null}

      <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => void downloadCustomers()}
          disabled={isDownloading || customersQuery.isLoading}
          style={{
            minHeight: 40,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingHorizontal: 14,
            borderRadius: radii.chip,
            backgroundColor: colors.surface.raised,
            borderWidth: 1,
            borderColor: colors.surface.border,
            opacity: isDownloading || customersQuery.isLoading ? 0.55 : 1,
          }}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={colors.text.secondary} />
          ) : (
            <Icon name="download" size={15} color={colors.text.secondary} />
          )}
          <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.text.secondary }}>
            {isDownloading ? 'Preparing Excel' : 'Download Excel'}
          </Text>
        </TouchableOpacity>
      </View>

      {data ? (
        <View style={{ marginTop: 18, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MetricCard title="Customers" value={String(data.summary.totalCustomers)} icon="users" />
            <MetricCard title="QR scans" value={String(data.summary.totalScans)} icon="maximize" />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MetricCard title="New" value={String(data.summary.newCustomers)} icon="user-plus" />
            <MetricCard title="Returning" value={String(data.summary.returningCustomers)} icon="repeat" />
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text.base }}>Customers</Text>
        {data ? (
          <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted }}>
            {data.total} found
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <TopBar title="WhatsApp Customers" subtitle={currentOutlet?.name || 'Customer activity'} />
      {customersQuery.isError ? (
        <ErrorState
          title="Could not load customers"
          subtitle={customersQuery.error?.message || 'Please try again.'}
          onRetry={customersQuery.refetch}
        />
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomer}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            customersQuery.isLoading ? (
              <LoadingSkeleton type="bill-row" count={5} />
            ) : (
              <EmptyState
                icon="message-circle"
                title="No WhatsApp customers found"
                subtitle="Try another billing period, search or filter."
              />
            )
          }
          ListFooterComponent={
            data && data.pages > 1 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 18 }}>
                <TouchableOpacity
                  disabled={page <= 1}
                  onPress={() => setPage((value) => Math.max(1, value - 1))}
                  style={{ opacity: page <= 1 ? 0.35 : 1, padding: 8 }}
                >
                  <Icon name="chevron-left" size={20} color={colors.text.base} />
                </TouchableOpacity>
                <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.secondary }}>
                  Page {page} of {data.pages}
                </Text>
                <TouchableOpacity
                  disabled={page >= data.pages}
                  onPress={() => setPage((value) => Math.min(data.pages, value + 1))}
                  style={{ opacity: page >= data.pages ? 0.35 : 1, padding: 8 }}
                >
                  <Icon name="chevron-right" size={20} color={colors.text.base} />
                </TouchableOpacity>
              </View>
            ) : null
          }
          refreshing={customersQuery.isRefetching && !customersQuery.isLoading}
          onRefresh={customersQuery.refetch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable
          onPress={() => setFiltersOpen(false)}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.surface.overlay }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: colors.surface.card,
              borderTopLeftRadius: radii.sheet,
              borderTopRightRadius: radii.sheet,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.extrabold, fontSize: 19, color: colors.text.base }}>Filter customers</Text>
              <TouchableOpacity onPress={() => setFiltersOpen(false)}>
                <Icon name="x" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.muted, marginTop: 22, marginBottom: 9 }}>
              CUSTOMER TYPE
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {customerTypes.map((option) => {
                const active = draftCustomerType === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setDraftCustomerType(option.value)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      borderRadius: radii.chip,
                      backgroundColor: active ? colors.primary : colors.surface.raised,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.semibold, fontSize: 11, color: active ? colors.onPrimary : colors.text.secondary }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.muted, marginTop: 20, marginBottom: 9 }}>
              TABLE
            </Text>
            <TextInput
              value={draftTableName}
              onChangeText={setDraftTableName}
              placeholder="Exact table name (optional)"
              placeholderTextColor={colors.text.faint}
              style={{
                backgroundColor: colors.surface.raised,
                color: colors.text.base,
                borderRadius: radii.tile,
                borderWidth: 1,
                borderColor: colors.surface.border,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontFamily: fonts.medium,
                fontSize: 13,
              }}
            />

            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.muted, marginTop: 20, marginBottom: 9 }}>
              SORT BY
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {sortOptions.map((option) => {
                const active = draftSort === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setDraftSort(option.value)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      borderRadius: radii.chip,
                      backgroundColor: active ? colors.primary : colors.surface.raised,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.semibold, fontSize: 11, color: active ? colors.onPrimary : colors.text.secondary }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 10 }}>
              <AppButton
                label="Reset"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => {
                  setDraftCustomerType('ALL');
                  setDraftTableName('');
                  setDraftSort('RECENT');
                }}
              />
              <AppButton label="Apply filters" style={{ flex: 1 }} onPress={applyFilters} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}
