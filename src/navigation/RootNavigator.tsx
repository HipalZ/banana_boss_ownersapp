import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/appStore';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';
import { OutletAdminStack } from './OutletAdminStack';
import { BrandedOwnerSplash } from '@/components/layout/BrandedOwnerSplash';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

export function RootNavigator() {
  const { isAuthenticated, isAdmin, staff } = useAuth();
  const adminInOutlet = useAppStore((s) => s.adminInOutlet);
  const selectedBusiness = useAppStore((s) => s.selectedBusiness);
  const outlets = useAuthStore((s) => s.outlets);
  const themeMode = useThemeStore((s) => s.mode);
  const savedNavigation = React.useRef<{ mode: string; state: any } | null>(null);
  const [lastShownOutletId, setLastShownOutletId] = React.useState<string | null>(null);

  // Guests → login.
  // Admin (email) on the universal view → all-outlets experience.
  // Admin who drilled into an outlet, and all staff → the full tabbed app
  // (mirrors banana_boss web: tapping an outlet enters the normal dashboard).
  const mode = !isAuthenticated
    ? 'guest'
    : isAdmin && !adminInOutlet
      ? 'admin'
      : 'app';

  React.useEffect(() => {
    if (mode === 'guest') {
      savedNavigation.current = null;
      setLastShownOutletId(null);
    }
  }, [mode]);

  const selectedOutlet = outlets?.find((outlet) => outlet._id === selectedBusiness);
  const selectedStaffOutlet = staff?.find((item) => item.outletId === selectedBusiness);
  if (mode === 'app' && selectedBusiness && lastShownOutletId !== selectedBusiness) {
    return (
      <BrandedOwnerSplash
        key={selectedBusiness}
        outletName={selectedOutlet?.name || selectedStaffOutlet?.outletName || 'Restaurant'}
        logoUrl={selectedOutlet?.outletImageUrl || selectedStaffOutlet?.outletImageUrl}
        onComplete={() => setLastShownOutletId(selectedBusiness)}
      />
    );
  }

  // key forces a full remount when the mode flips so stale nav state is cleared.
  return (
    <NavigationContainer
      key={`${mode}-${themeMode}`}
      initialState={savedNavigation.current?.mode === mode ? savedNavigation.current.state : undefined}
      onStateChange={(state) => { savedNavigation.current = { mode, state }; }}
    >
      {mode === 'guest' ? (
        <AuthStack />
      ) : mode === 'admin' ? (
        <OutletAdminStack />
      ) : (
        <AppTabs />
      )}
    </NavigationContainer>
  );
}
