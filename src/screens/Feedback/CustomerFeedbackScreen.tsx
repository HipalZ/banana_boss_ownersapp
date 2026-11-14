import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Linking, Modal, Pressable,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import type { DateRangeValue } from '@/stores/appStore';
import { feedbackApi } from '@/api/services/feedback/feedback.api';
import type { FeedbackChoice, FeedbackItem, FeedbackParams } from '@/api/services/feedback/feedback.types';
import { useFeedbackPage, useFeedbackSummary } from '@/queries/feedback';
import { useOutlet } from '@/hooks/useOutlet';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { DateRangePicker, EmptyState, ErrorState, LoadingSkeleton, MetricCard } from '@/components/shared';
import { AppButton, AppCard } from '@/components/primitives';
import { colors, fonts, radii } from '@/theme';
import { formatDateTime } from '@/utils/date';

type ChoiceFilter = FeedbackChoice | 'ALL';
const choices: { label: string; value: ChoiceFilter }[] = [
  { label: 'All feedback', value: 'ALL' },
  { label: 'Excellent', value: 'EXCELLENT' },
  { label: 'Good', value: 'GOOD' },
  { label: 'Could be better', value: 'COULD BE BETTER' },
];
const phoneDigits = (phone: string) => phone.replace(/\D/g, '');
const initialRange = (): DateRangeValue => {
  const from = new Date(); from.setHours(0, 0, 0, 0);
  const to = new Date(); to.setHours(23, 59, 59, 999);
  return { from: from.getTime(), to: to.getTime(), preset: 'today' };
};
const choiceStyle = (choice: FeedbackChoice | null) => {
  if (choice === 'EXCELLENT') return { label: 'EXCELLENT', bg: colors.tint.sky.bg, fg: colors.tint.sky.fg };
  if (choice === 'GOOD') return { label: 'GOOD', bg: colors.tint.amber.bg, fg: colors.tint.amber.fg };
  if (choice === 'COULD BE BETTER') return { label: 'COULD BE BETTER', bg: colors.tint.rose.bg, fg: colors.tint.rose.fg };
  return { label: 'FEEDBACK', bg: colors.surface.raised, fg: colors.text.secondary };
};

export function CustomerFeedbackScreen() {
  const { outletId, currentOutlet } = useOutlet();
  const isFocused = useIsFocused();
  const [dateRange, setDateRange] = useState<DateRangeValue>(initialRange);
  const [draftSearch, setDraftSearch] = useState('');
  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [choice, setChoice] = useState<ChoiceFilter>('ALL');
  const [draftChoice, setDraftChoice] = useState<ChoiceFilter>('ALL');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);

  const params = useMemo<FeedbackParams | null>(() => outletId ? {
    outletId, from: dateRange.from, to: dateRange.to,
    search: search || undefined,
    responseChoice: choice === 'ALL' ? undefined : choice,
    page, limit: 20,
  } : null, [outletId, dateRange.from, dateRange.to, search, choice, page]);
  const list = useFeedbackPage(params, isFocused);
  const summary = useFeedbackSummary(params, isFocused);

  const submitSearch = () => {
    const value = draftSearch.trim();
    if (/^[+\d\s()-]+$/.test(value) && value) {
      const digits = phoneDigits(value);
      if (digits.length !== 4 && (digits.length < 10 || digits.length > 15)) {
        setSearchError('Enter a full phone number or the last 4 digits.');
        return;
      }
    }
    setSearchError('');
    setSearch(value);
    setPage(1);
  };
  const contact = async (url: string, type: string) => {
    try { await Linking.openURL(url); }
    catch { Alert.alert(`${type} unavailable`, `Could not open ${type.toLowerCase()} on this device.`); }
  };
  const download = async () => {
    if (!params || downloading) return;
    setDownloading(true);
    try { await feedbackApi.downloadXlsx(params); }
    catch (error) { Alert.alert('Download failed', error instanceof Error ? error.message : 'Could not download Excel.'); }
    finally { setDownloading(false); }
  };

  const contactButtons = (item: FeedbackItem) => {
    const digits = phoneDigits(item.customerPhone);
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          accessibilityLabel={`WhatsApp ${item.customerName || 'customer'}`}
          disabled={!digits}
          onPress={() => void contact(`https://wa.me/${digits}`, 'WhatsApp')}
          style={{ width: 40, height: 40, borderRadius: radii.chip, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint.green.bg, borderWidth: 1, borderColor: colors.surface.border, opacity: digits ? 1 : 0.4 }}
        >
          <FontAwesomeIcon name="whatsapp" size={17} color={colors.tint.green.fg} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={`Call ${item.customerName || 'customer'}`}
          disabled={!digits}
          onPress={() => void contact(`tel:${item.customerPhone}`, 'Calling')}
          style={{ width: 40, height: 40, borderRadius: radii.chip, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.raised, borderWidth: 1, borderColor: colors.surface.border, opacity: digits ? 1 : 0.4 }}
        >
          <Icon name="phone" size={16} color={colors.text.muted} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFeedback = ({ item }: { item: FeedbackItem }) => {
    const tone = choiceStyle(item.choice);
    const name = item.customerName || 'Guest';
    return (
      <AppCard style={{ marginBottom: 12, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ width: 46, height: 46, borderRadius: radii.tile, backgroundColor: colors.tint.green.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 14, color: colors.tint.green.fg }}>{name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Text numberOfLines={2} style={{ flex: 1, minWidth: 0, fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.text.base }}>{name}</Text>
              {contactButtons(item)}
            </View>
            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text.secondary, marginTop: 3 }}>{item.customerPhone || 'No phone recorded'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
              <View style={{ borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: tone.bg }}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 10, color: tone.fg }}>{tone.label}</Text>
              </View>
              {item.rating != null && <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.text.secondary }}>{item.rating}/5</Text>}
            </View>
            <TouchableOpacity onPress={() => setSelected(item)} accessibilityLabel={`Read feedback from ${name}`}>
              <Text numberOfLines={3} style={{ fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.text.base, marginTop: 7 }}>
                {item.description || 'No written comment'}
              </Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginTop: 6 }}>
              {item.tableName ? `Table ${item.tableName} · ` : ''}{formatDateTime(item.respondedAt || item.visitAt)}
            </Text>
          </View>
        </View>
      </AppCard>
    );
  };

  const header = (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 8 }}>
        <DateRangePicker compact dark value={dateRange} outletId={outletId} onChange={(range) => { setDateRange(range); setPage(1); }} />
        <TouchableOpacity onPress={() => { setDraftChoice(choice); setFiltersOpen(true); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, minHeight: 40, borderRadius: radii.chip, backgroundColor: colors.surface.raised, borderWidth: 1, borderColor: colors.surface.border }}>
          <Icon name="sliders" size={14} color={colors.text.secondary} />
          <Text style={{ fontFamily: fonts.semibold, fontSize: 11, color: choice !== 'ALL' ? colors.primaryDark : colors.text.secondary }}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Download feedback Excel" onPress={() => void download()} disabled={downloading || list.isLoading} style={{ minHeight: 40, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 6, borderRadius: radii.chip, backgroundColor: colors.tint.green.bg, borderWidth: 1, borderColor: colors.tint.green.fg, opacity: downloading || list.isLoading ? 0.55 : 1 }}>
          {downloading ? <ActivityIndicator size="small" color={colors.tint.green.fg} /> : <Icon name="download" size={14} color={colors.tint.green.fg} />}
          <Text numberOfLines={1} style={{ fontFamily: fonts.semibold, fontSize: 11, color: colors.tint.green.fg }}>{downloading ? 'Preparing' : 'Download Excel'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 8 }}>
        <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface.raised, borderRadius: radii.tile, borderWidth: 1, borderColor: searchError ? colors.danger : colors.surface.border, paddingHorizontal: 12 }}>
          <Icon name="search" size={17} color={colors.text.faint} />
          <TextInput value={draftSearch} onChangeText={(value) => { setDraftSearch(value); setSearchError(''); }} onSubmitEditing={submitSearch} returnKeyType="search" placeholder="Name or phone" placeholderTextColor={colors.text.faint} style={{ flex: 1, color: colors.text.base, fontFamily: fonts.medium, fontSize: 12, paddingVertical: 12, marginLeft: 8 }} />
          {!!draftSearch && <TouchableOpacity accessibilityLabel="Clear search" onPress={() => { setDraftSearch(''); setSearch(''); setPage(1); }}><Icon name="x" size={16} color={colors.text.faint} /></TouchableOpacity>}
        </View>
        <TouchableOpacity onPress={submitSearch} style={{ paddingHorizontal: 15, borderRadius: radii.tile, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.onPrimary }}>Search</Text>
        </TouchableOpacity>
      </View>
      {!!searchError && <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.danger, marginTop: 6 }}>{searchError}</Text>}
      <View style={{ marginTop: 14, gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard compact title="Responses" value={String(summary.data?.responses ?? '—')} icon="message-circle" />
          <MetricCard compact title="Excellent" value={String(summary.data?.excellent ?? '—')} icon="star" />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard compact title="Good" value={String(summary.data?.good ?? '—')} icon="thumbs-up" />
          <MetricCard compact title="Could be better" value={String(summary.data?.couldBeBetter ?? '—')} icon="alert-circle" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.text.base }}>Feedback</Text>
        <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted }}>{list.data?.total ?? 0} found</Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <TopBar title="Customer Feedback" subtitle={currentOutlet?.name || 'Customer responses'} />
      {list.isError || summary.isError ? (
        <ErrorState title="Could not load feedback" subtitle={(list.error || summary.error)?.message || 'Please try again.'} onRetry={() => { void list.refetch(); void summary.refetch(); }} />
      ) : (
        <FlatList
          data={list.data?.items || []}
          keyExtractor={(item) => item.id}
          renderItem={renderFeedback}
          ListHeaderComponent={header}
          ListEmptyComponent={list.isLoading ? <LoadingSkeleton type="bill-row" count={5} /> : <EmptyState icon="message-square" title="No feedback found" subtitle="Try another date, search or filter." />}
          ListFooterComponent={list.data && list.data.pages > 1 ? (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 18 }}>
              <TouchableOpacity accessibilityLabel="Previous page" disabled={page <= 1} onPress={() => setPage((value) => Math.max(1, value - 1))} style={{ opacity: page <= 1 ? 0.35 : 1, padding: 8 }}><Icon name="chevron-left" size={20} color={colors.text.base} /></TouchableOpacity>
              <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.secondary }}>Page {page} of {list.data.pages}</Text>
              <TouchableOpacity accessibilityLabel="Next page" disabled={page >= list.data.pages} onPress={() => setPage((value) => Math.min(list.data!.pages, value + 1))} style={{ opacity: page >= list.data.pages ? 0.35 : 1, padding: 8 }}><Icon name="chevron-right" size={20} color={colors.text.base} /></TouchableOpacity>
            </View>
          ) : null}
          refreshing={list.isRefetching && !list.isLoading}
          onRefresh={() => { void list.refetch(); void summary.refetch(); }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable onPress={() => setFiltersOpen(false)} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.surface.overlay }}>
          <Pressable onPress={(event) => event.stopPropagation()} style={{ backgroundColor: colors.surface.card, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, padding: 20 }}>
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 19, color: colors.text.base }}>Filter feedback</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: colors.text.muted, marginTop: 22, marginBottom: 9 }}>RESPONSE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {choices.map((option) => <TouchableOpacity key={option.value} onPress={() => setDraftChoice(option.value)} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: radii.chip, backgroundColor: draftChoice === option.value ? colors.primary : colors.surface.raised }}><Text style={{ fontFamily: fonts.semibold, fontSize: 11, color: draftChoice === option.value ? colors.onPrimary : colors.text.secondary }}>{option.label}</Text></TouchableOpacity>)}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 10 }}>
              <AppButton label="Reset" variant="secondary" style={{ flex: 1 }} onPress={() => setDraftChoice('ALL')} />
              <AppButton label="Apply filters" style={{ flex: 1 }} onPress={() => { setChoice(draftChoice); setPage(1); setFiltersOpen(false); }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable onPress={() => setSelected(null)} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.surface.overlay }}>
          <Pressable onPress={(event) => event.stopPropagation()} style={{ backgroundColor: colors.surface.card, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, padding: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text numberOfLines={2} style={{ flex: 1, fontFamily: fonts.extrabold, fontSize: 19, color: colors.text.base }}>{selected?.customerName || 'Guest'}</Text>
              <TouchableOpacity accessibilityLabel="Close feedback details" onPress={() => setSelected(null)}><Icon name="x" size={20} color={colors.text.secondary} /></TouchableOpacity>
            </View>
            <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text.secondary, marginTop: 6 }}>{selected?.customerPhone}</Text>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 12, color: selected ? choiceStyle(selected.choice).fg : colors.text.secondary, marginTop: 14 }}>{selected ? choiceStyle(selected.choice).label : ''}{selected?.rating != null ? ` · ${selected.rating}/5` : ''}</Text>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.text.base, marginTop: 12 }}>{selected?.description || 'No written comment'}</Text>
            {!!selected?.categories?.length && <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, marginTop: 12 }}>{selected.categories.join(' · ')}</Text>}
            <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, marginTop: 12 }}>{selected?.tableName ? `Table ${selected.tableName} · ` : ''}{selected ? formatDateTime(selected.respondedAt || selected.visitAt) : ''}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
}
