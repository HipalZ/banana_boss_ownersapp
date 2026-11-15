import React from 'react';
import { Text, View } from 'react-native';
import { AppCard } from '@/components/primitives/AppCard';
import { colors, fonts, radii } from '@/theme';

type Props = {
  name: string;
  phone: string;
  detail: string;
  detailLabel: string;
  detailColor?: string;
  badge?: string;
  badgeActive?: boolean;
};

export function BillingAccountRow({ name, phone, detail, detailLabel, detailColor, badge, badgeActive }: Props) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || '?';
  return (
    <AppCard style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface.card }}>
      <View style={{ width: 42, height: 42, borderRadius: radii.tile, backgroundColor: colors.surface.raised, borderWidth: 1, borderColor: colors.surface.border, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, fontFamily: fonts.extrabold, color: colors.text.secondary }}>{initials}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={2} style={{ fontSize: 15, lineHeight: 20, fontFamily: fonts.bold, color: colors.text.base }}>{name}</Text>
        <Text numberOfLines={1} style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.text.muted, marginTop: 3 }}>{phone}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', maxWidth: '35%' }}>
        <Text style={{ fontSize: 11, fontFamily: fonts.semibold, color: colors.text.muted }}>{detailLabel}</Text>
        <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: fonts.extrabold, color: detailColor || colors.text.base, marginTop: 2 }}>{detail}</Text>
        {badge ? <Text style={{ fontSize: 10, fontFamily: fonts.bold, color: badgeActive ? colors.success : colors.text.muted, marginTop: 4 }}>{badge}</Text> : null}
      </View>
    </AppCard>
  );
}
