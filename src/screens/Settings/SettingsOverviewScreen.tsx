import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { SettingsStackParamList } from "@/types/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useOutlet } from "@/hooks/useOutlet";
import Icon from "react-native-vector-icons/Feather";
import { colors, fonts } from "@/theme";

export function SettingsOverviewScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const { logout, staff } = useAuth();
  const { currentOutlet, outlets } = useOutlet();

  const me = staff?.[0];
  const outletCount = outlets?.length ?? 0;
  const canSwitch = outletCount > 1;

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Log out of Banana Boss?")) logout();
      return;
    }
    Alert.alert(
      "Log out",
      "Log out of Banana Boss? You can sign back in with any business.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log out", style: "destructive", onPress: logout },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.canvas }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: colors.primaryDark,
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 26,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: 24,
              color: colors.text.onAccent,
            }}
          >
            {(me?.name || me?.nickName || "U")[0].toUpperCase()}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fonts.bold,
            fontSize: 20,
            color: colors.onPrimary,
          }}
        >
          {me?.name || me?.nickName || "Staff"}
        </Text>
        <Text
          style={{
            fontFamily: fonts.regular,
            fontSize: 12,
            color: colors.text.faint,
            marginTop: 2,
          }}
        >
          {[me?.roleName, me?.phone].filter(Boolean).join("  ·  ") || "Account"}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Business / Outlet ──────────────────────────────────── */}
        <Text style={sectionLabel}>Business</Text>

        <TouchableOpacity
          onPress={() => canSwitch && navigation.navigate("OutletSelector")}
          activeOpacity={canSwitch ? 0.7 : 1}
          disabled={!canSwitch}
          style={cardRow}
        >
          <View style={[iconTile, { backgroundColor: colors.tint.amber.bg }]}>
            <Icon name="home" size={18} color={colors.tint.amber.fg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cardTitle}>
              {currentOutlet?.name || "Current business"}
            </Text>
            <Text style={cardSubtitle}>
              {canSwitch
                ? `Tap to switch · ${outletCount} businesses`
                : "Your only business"}
            </Text>
          </View>
          {canSwitch && (
            <View style={switchPill}>
              <Icon name="repeat" size={13} color={colors.text.onAccent} />
              <Text style={switchPillText}>Switch</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Account ────────────────────────────────────────────── */}
        <Text style={[sectionLabel, { marginTop: 24 }]}>Account</Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={cardRow}
          activeOpacity={0.75}
        >
          <View style={[iconTile, { backgroundColor: colors.tint.rose.bg }]}>
            <Icon name="log-out" size={18} color={colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[cardTitle, { color: colors.danger }]}>Log out</Text>
            <Text style={cardSubtitle}>Sign in again with any business</Text>
            <Text style={cardSubtitle}>V 1.0</Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.text.faint} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const sectionLabel: import("react-native").TextStyle = {
  fontSize: 11,
  fontFamily: fonts.bold,
  color: colors.text.muted,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  marginBottom: 10,
};

const cardRow: import("react-native").ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.surface.card,
  borderRadius: 14,
  padding: 14,
  borderWidth: 1,
  borderColor: colors.surface.border,
};

const iconTile: import("react-native").ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 14,
};

const cardTitle: import("react-native").TextStyle = {
  fontSize: 14,
  fontFamily: fonts.bold,
  color: colors.text.base,
};

const cardSubtitle: import("react-native").TextStyle = {
  fontSize: 12,
  fontFamily: fonts.regular,
  color: colors.text.muted,
  marginTop: 2,
};

const switchPill: import("react-native").ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  backgroundColor: colors.primary,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
};

const switchPillText: import("react-native").TextStyle = {
  fontSize: 12,
  fontFamily: fonts.bold,
  color: colors.text.onAccent,
};
