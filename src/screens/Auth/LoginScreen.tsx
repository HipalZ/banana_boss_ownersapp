import React, { useState } from 'react';
import { Image, View, Text, TouchableOpacity, Keyboard, StatusBar, Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { AppInput, AppButton, AppLoader } from '@/components/primitives';
import { KeyboardWrapper } from '@/components/layout';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fonts, radii, shadows } from '@/theme';

/** Banana Boss logo mark */
function BananaLogo() {
  return (
    <View
      style={{
        width: 96,
        height: 96,
        borderRadius: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <Image
        source={require('../../../assets/icon.png')}
        style={{ width: '100%', height: '100%', borderRadius: 18 }}
        resizeMode="contain"
        accessibilityLabel="Banana Boss logo"
      />
    </View>
  );
}

type LoginMode = 'email' | 'mobile';

export function LoginScreen() {
  const { login, loginAdmin, rememberedPhone, rememberedPassword } = useAuth();
  // Login already sets selectedBusiness inside useAuth.login — no need to call it here.

  const [mode, setMode] = useState<LoginMode>('mobile');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(rememberedPhone || '');
  const [password, setPassword] = useState(rememberedPassword || '');
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError('');
    if (mode === 'email') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter email and password');
        return;
      }
    } else if (!phone.trim() || !password.trim()) {
      setError('Please enter phone and password');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'email') {
        // Main admin → all businesses. Navigation happens via RootNavigator.
        await loginAdmin(email.trim(), password.trim());
      } else {
        await login(phone.trim(), password.trim(), remember);
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardWrapper style={{ backgroundColor: colors.surface.canvas }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface.canvas} />
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>

        {/* ── Brand ──────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <BananaLogo />
          <Text style={{ fontFamily: fonts.bold, fontSize: 28, color: colors.text.base }}>
            Banana Boss
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.text.muted, marginTop: 4 }}>
            Reports & Billing
          </Text>
        </View>

        {/* ── Card ───────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: colors.surface.card,
            borderRadius: radii.sheet,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.surface.border,
            ...shadows.soft,
          }}
        >
          {/* Mode toggle: Email (admin, all outlets) vs Mobile (staff, single) */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.surface.canvas,
              borderRadius: radii.chip,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {(['email', 'mobile'] as LoginMode[]).map((m) => {
              const active = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => {
                    setMode(m);
                    setError('');
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: radii.chip - 2,
                    backgroundColor: active ? colors.primary : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.semibold,
                      fontSize: 13,
                      color: active ? colors.text.onAccent : colors.text.muted,
                    }}
                  >
                    {m === 'email' ? 'Email (Admin)' : 'Mobile (Staff)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {mode === 'email' ? (
            <AppInput
              label="Email"
              placeholder="Enter admin email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail"
            />
          ) : (
            <AppInput
              label="Phone Number"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              leftIcon="phone"
            />
          )}
          <AppInput
            label="Password"
            placeholder="Enter password"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            leftIcon="lock"
            rightIcon={secure ? 'eye-off' : 'eye'}
            onRightIconPress={() => setSecure(!secure)}
          />

          <TouchableOpacity
            onPress={() => setRemember(!remember)}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          >
            <Icon
              name={remember ? 'check-square' : 'square'}
              size={18}
              color={remember ? colors.primaryDark : colors.text.faint}
            />
              <Text style={{ marginLeft: 8, fontFamily: fonts.medium, fontSize: 13, color: colors.text.secondary }}>
              Remember me
            </Text>
          </TouchableOpacity>

          {error ? (
            <View
              style={{
                backgroundColor: colors.tint.rose.bg,
                borderRadius: radii.chip,
                padding: 12,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="alert-circle" size={15} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 13, fontFamily: fonts.medium, flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          <AppButton label="Login" onPress={handleLogin} loading={loading} />

          {/* PWA Install Prompt */}
          {deferredPrompt && (
            <View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderColor: colors.surface.border, alignItems: 'center' }}>
              <View style={{ backgroundColor: colors.tint.accent.bg, padding: 10, borderRadius: radii.chip, marginBottom: 10 }}>
                <Icon name="download" size={20} color={colors.tint.accent.fg} />
              </View>
              <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.text.base, marginBottom: 4 }}>
                Get the Full App Experience
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.text.muted, textAlign: 'center', marginBottom: 14 }}>
                Install Banana Boss on your home screen for fast, offline-ready access.
              </Text>
              <TouchableOpacity
                onPress={handleInstallPWA}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: radii.chip,
                }}
              >
                <Text style={{ fontFamily: fonts.bold, color: colors.text.onAccent, fontSize: 13 }}>Download App</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <AppLoader visible={false} fullScreen />
    </KeyboardWrapper>
  );
}
