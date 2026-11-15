import React from 'react';
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import type { SettingsStackParamList } from '@/types/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useOutlet } from '@/hooks/useOutlet';
import { ScreenWrapper, TopBar } from '@/components/layout';
import { ScreenEntrance } from '@/components/shared';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';
import { colors, fonts, radii } from '@/theme';

export function SettingsOverviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const { logout, staff, isAdmin } = useAuth();
  const { canInstall, install } = usePwaInstall();
  const { outletId, currentOutlet, outlets } = useOutlet();
  const themeMode = useThemeStore((state) => state.mode);
  const toggleThemeMode = useThemeStore((state) => state.toggleMode);
  const me = outletId ? staff?.find((person) => person.outletId === outletId) : staff?.[0];
  const canSwitch = (outlets?.length ?? 0) > 1;
  const ownerName = me?.name?.trim() || me?.nickName?.trim() || (isAdmin ? 'Administrator' : 'Staff');

  const selectTheme = (mode: ThemeMode) => {
    if (mode !== themeMode) toggleThemeMode();
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Log out of Banana Boss?')) logout();
      return;
    }
    Alert.alert('Log out', 'Log out of Banana Boss? You can sign back in with any business.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScreenWrapper scrollable>
      <TopBar title={currentOutlet?.name || 'Account'} showBack={false} />
      <ScreenEntrance style={{ width: '100%', maxWidth: 720, alignSelf: 'center', paddingBottom: 24 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 28, color: colors.text.base, marginTop: 10, marginBottom: 16, letterSpacing: -0.4 }}>Account</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: radii.tile, backgroundColor: colors.surface.card, borderWidth: 1, borderColor: colors.surface.border }}>
          <View style={{ width: 52, height: 52, borderRadius: radii.tile, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Text style={{ fontFamily: fonts.extrabold, fontSize: 22, color: colors.onPrimary }}>{ownerName[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={2} style={{ fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, color: colors.text.base }}>{ownerName}</Text>
            <Text numberOfLines={1} style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, marginTop: 4 }}>
              {[me?.roleName, me?.phone].filter(Boolean).join(' · ') || 'Account'}
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.text.base, marginTop: 28, marginBottom: 12 }}>Business</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={canSwitch ? 'Switch business' : 'Current business'}
          disabled={!canSwitch}
          activeOpacity={canSwitch ? 0.75 : 1}
          onPress={() => navigation.navigate('OutletSelector')}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 16, minHeight: 72, borderRadius: radii.tile, backgroundColor: colors.surface.card, borderWidth: 1, borderColor: colors.surface.border }}
        >
          <View style={{ width: 42, height: 42, borderRadius: radii.tile, backgroundColor: colors.surface.raised, borderWidth: 1, borderColor: colors.surface.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Icon name="home" size={17} color={colors.text.base} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={2} style={{ fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.text.base }}>{currentOutlet?.name || 'Current business'}</Text>
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.text.muted, marginTop: 3 }}>{canSwitch ? `${outlets?.length} businesses · tap to switch` : 'Current outlet'}</Text>
          </View>
          {canSwitch && <Icon name="chevron-right" size={18} color={colors.text.muted} />}
        </TouchableOpacity>

        <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.text.base, marginTop: 28, marginBottom: 12 }}>Appearance</Text>
        <View style={{ padding: 5, flexDirection: 'row', borderRadius: radii.tile, backgroundColor: colors.surface.card, borderWidth: 1, borderColor: colors.surface.border }}>
          {(['light', 'dark'] as const).map((mode) => {
            const selected = themeMode === mode;
            return (
              <TouchableOpacity key={mode} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => selectTheme(mode)} style={{ flex: 1, minHeight: 42, borderRadius: radii.chip, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.primary : 'transparent' }}>
                <Text style={{ fontFamily: selected ? fonts.bold : fonts.medium, fontSize: 14, color: selected ? colors.onPrimary : colors.text.secondary }}>{mode === 'light' ? 'Light' : 'Dark'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.text.muted, marginTop: 8 }}>Saved on this device</Text>

        {canInstall && (
          <TouchableOpacity accessibilityRole="button" onPress={install} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28, padding: 16, minHeight: 58, borderRadius: radii.tile, backgroundColor: colors.surface.card, borderWidth: 1, borderColor: colors.surface.border }}>
            <Icon name="download" size={17} color={colors.text.base} />
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.text.base, marginLeft: 12, flex: 1 }}>Install app</Text>
            <Icon name="chevron-right" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        )}

        <TouchableOpacity accessibilityRole="button" onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 36, padding: 16, minHeight: 58, borderRadius: radii.tile, backgroundColor: colors.surface.card, borderWidth: 1, borderColor: colors.surface.border }}>
          <Icon name="log-out" size={17} color={colors.danger} />
          <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.danger, marginLeft: 12, flex: 1 }}>Log out</Text>
          <Icon name="chevron-right" size={18} color={colors.text.muted} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.text.faint, textAlign: 'center', marginTop: 20 }}>Version 1.0</Text>
      </ScreenEntrance>
    </ScreenWrapper>
  );
}
