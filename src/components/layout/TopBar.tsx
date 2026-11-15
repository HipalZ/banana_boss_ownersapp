import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useOutlet } from '@/hooks/useOutlet';
import { useAppStore } from '@/stores/appStore';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii } from '@/theme';
import { useThemeStore } from '@/stores/themeStore';

interface TopBarProps {
  title: string;
  subtitle?: string;
  rightActions?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export const TopBar = React.memo(function TopBar({
  title,
  subtitle,
  rightActions,
  showBack,
  onBack,
}: TopBarProps) {
  const navigation = useNavigation();
  const { width: viewportWidth } = useWindowDimensions();
  const compactHeader = viewportWidth < 440;
  const canGoBack = navigation.canGoBack();
  const shouldShowBack = showBack !== undefined ? showBack : canGoBack;
  
  const { isAdmin } = useAuth();
  const { outletId, currentOutlet, outlets, selectOutlet } = useOutlet();
  const setAdminInOutlet = useAppStore((s) => s.setAdminInOutlet);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleThemeMode = useThemeStore((s) => s.toggleMode);
  const [outletModalVisible, setOutletModalVisible] = useState(false);

  // Outlet switcher: shown on top-level screens for admins or multi-outlet staff.
  const showOutletSwitcher =
    !shouldShowBack && (isAdmin || (outlets?.length ?? 0) > 1);

  const handleSelectOutlet = (id: string) => {
    selectOutlet(id);
    setOutletModalVisible(false);
  };

  const handleAllOutlets = () => {
    setOutletModalVisible(false);
    // Return the admin to the all-outlets universal view.
    setAdminInOutlet(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (canGoBack) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        backgroundColor: 'transparent',
      }}
    >
      {shouldShowBack && (
        <TouchableOpacity
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{
            marginRight: 10,
            width: 36,
            height: 36,
            borderRadius: radii.chip,
            backgroundColor: colors.surface.card,
            borderWidth: 1,
            borderColor: colors.surface.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="arrow-left" size={18} color={colors.text.base} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: fonts.bold, fontSize: 18, color: colors.text.base }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.text.muted, marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {showOutletSwitcher && (
          <TouchableOpacity
            onPress={() => setOutletModalVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Switch outlet. Current outlet: ${currentOutlet?.name ?? 'Select Outlet'}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: compactHeader ? 3 : 6,
              maxWidth: compactHeader ? 42 : 160,
              minWidth: compactHeader ? 42 : undefined,
              height: 36,
              paddingHorizontal: compactHeader ? 7 : 12,
              borderRadius: radii.chip,
              backgroundColor: colors.surface.card,
              borderWidth: 1,
              borderColor: colors.surface.border,
            }}
          >
            <Icon name="home" size={13} color={colors.text.muted} />
            {!compactHeader && (
              <Text
                numberOfLines={1}
                style={{ fontFamily: fonts.semibold, fontSize: 12, color: colors.text.base, flexShrink: 1 }}
              >
                {currentOutlet?.name ?? 'Select Outlet'}
              </Text>
            )}
            <Icon name="chevron-down" size={13} color={colors.text.muted} />
          </TouchableOpacity>
        )}

        {rightActions}

        <TouchableOpacity
          onPress={toggleThemeMode}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
          activeOpacity={0.8}
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.chip,
            backgroundColor: colors.surface.card,
            borderWidth: 1,
            borderColor: colors.surface.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={themeMode === 'dark' ? 'sun' : 'moon'} size={17} color={colors.text.base} />
        </TouchableOpacity>

      </View>

      {/* Outlet switcher modal */}
      <Modal
        visible={outletModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOutletModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: colors.surface.overlay, justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setOutletModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: colors.surface.card,
              borderTopLeftRadius: radii.sheet,
              borderTopRightRadius: radii.sheet,
              paddingTop: 8,
              paddingBottom: 32,
              maxHeight: '75%',
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.surface.border,
                alignSelf: 'center',
                marginBottom: 12,
              }}
            />
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 16,
                color: colors.text.base,
                paddingHorizontal: 20,
                marginBottom: 12,
              }}
            >
              Switch Outlet
            </Text>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}>
              {(outlets ?? []).map((o) => {
                const active = o._id === outletId;
                return (
                  <TouchableOpacity
                    key={o._id}
                    onPress={() => handleSelectOutlet(o._id)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      borderRadius: radii.tile,
                      backgroundColor: active ? colors.surface.raised : 'transparent',
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: radii.chip,
                        backgroundColor: colors.surface.raised,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="home" size={15} color={colors.text.base} />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: active ? fonts.bold : fonts.semibold,
                        fontSize: 15,
                        color: colors.text.base,
                      }}
                      numberOfLines={1}
                    >
                      {o.name}
                    </Text>
                    {active && <Icon name="check" size={17} color={colors.primaryDark} />}
                  </TouchableOpacity>
                );
              })}

              {isAdmin && (
                <TouchableOpacity
                  onPress={handleAllOutlets}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    marginTop: 6,
                    borderRadius: radii.tile,
                    borderTopWidth: 1,
                    borderTopColor: colors.surface.border,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radii.chip,
                      backgroundColor: colors.tint.accent.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="grid" size={15} color={colors.tint.accent.fg} />
                  </View>
                  <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.text.base }}>
                    All Outlets
                  </Text>
                  <Icon name="chevron-right" size={17} color={colors.text.faint} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});
