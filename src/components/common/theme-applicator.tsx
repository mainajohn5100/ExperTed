
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserPreferences } from '@/types';

export default function ThemeApplicator() {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const prefs = user?.prefs as UserPreferences | undefined;

    // Apply Dark Mode (already handled by settings page and html class)
    // but ensure it's set on initial load if user pref exists
    if (prefs?.darkMode !== undefined) {
      if (prefs.darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches && prefs?.darkMode === undefined) {
      // Fallback to system preference if no user preference is set for dark mode
      // This part is tricky as the settings page also has its own logic.
      // For simplicity, let's assume the settings page manages the dark class primarily.
      // This component will ensure persisted theme/font-size classes are applied.
    }


    // Apply Font Size
    root.classList.remove('font-size-sm', 'font-size-lg'); // Remove specific size classes
    // Default (16px) is applied if no class is present or if 'font-size-default' is explicitly set
    if (prefs?.fontSize && prefs.fontSize !== 'default') {
      root.classList.add(`font-size-${prefs.fontSize}`);
    }

    // Apply Theme
    const themes = ['theme-default', 'theme-ocean', 'theme-forest', 'theme-rose'];
    themes.forEach(t => root.classList.remove(t));

    if (prefs?.theme) {
      root.classList.add(`theme-${prefs.theme}`);
    } else {
      root.classList.add('theme-default'); // Ensure default theme if none explicitly set
    }

  }, [user]); // Rerun when user object changes (which includes prefs)

  return null; // This component doesn't render anything itself
}
