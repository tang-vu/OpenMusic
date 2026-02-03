import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settings-store';

export function useTheme() {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
}
