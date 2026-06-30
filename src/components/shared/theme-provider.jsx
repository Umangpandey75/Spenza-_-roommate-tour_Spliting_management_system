'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => null,
  reducedMotion: false,
  setReducedMotion: () => null,
  highContrast: false,
  setHighContrast: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  ...props
}) {
  // Initialize with default theme to match server-side rendering
  const [theme, setTheme] = useState(defaultTheme);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after hydration
  useEffect(() => {
    setMounted(true);
    
    // Load stored preferences after hydration
    const storedTheme = localStorage.getItem(storageKey) || defaultTheme;
    const storedReducedMotion = localStorage.getItem(`${storageKey}-reduced-motion`) === 'true';
    const storedHighContrast = localStorage.getItem(`${storageKey}-high-contrast`) === 'true';
    
    setTheme(storedTheme);
    setReducedMotion(storedReducedMotion);
    setHighContrast(storedHighContrast);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    // Only apply theme changes after component has mounted (client-side only)
    if (!mounted) return;
    
    const root = window.document.documentElement;

    // Handle theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Handle accessibility classes
    root.classList.toggle('reduced-motion', reducedMotion);
    root.classList.toggle('high-contrast', highContrast);

    // Set CSS custom properties for accessibility
    root.style.setProperty('--motion-scale', reducedMotion ? '0' : '1');
    root.style.setProperty('--contrast-scale', highContrast ? '1.5' : '1');
  }, [mounted, theme, reducedMotion, highContrast]);

  // Listen for system preference changes (client-side only)
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => {
      if (!localStorage.getItem(`${storageKey}-reduced-motion`)) {
        setReducedMotion(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    // Set initial value if not overridden
    if (!localStorage.getItem(`${storageKey}-reduced-motion`)) {
      setReducedMotion(mediaQuery.matches);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    reducedMotion,
    setReducedMotion: (value) => {
      localStorage.setItem(`${storageKey}-reduced-motion`, value.toString());
      setReducedMotion(value);
    },
    highContrast,
    setHighContrast: (value) => {
      localStorage.setItem(`${storageKey}-high-contrast`, value.toString());
      setHighContrast(value);
    },
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};