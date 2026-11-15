import { Platform } from 'react-native';
import { create } from 'zustand';

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

const useInstallStore = create<{ prompt: InstallPrompt | null; setPrompt: (prompt: InstallPrompt | null) => void }>((set) => ({
  prompt: null,
  setPrompt: (prompt) => set({ prompt }),
}));

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    useInstallStore.getState().setPrompt(event as InstallPrompt);
  });
}

export function usePwaInstall() {
  const prompt = useInstallStore((state) => state.prompt);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    useInstallStore.getState().setPrompt(null);
  };

  return { canInstall: !!prompt, install };
}
