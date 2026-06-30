'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';
import { AccessibilitySettings } from './accessibility-settings';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getNextTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    return themes[(currentIndex + 1) % themes.length];
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-10 sm:w-10"
          disabled
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <AccessibilitySettings />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={`Current theme: ${theme}. Click to switch to ${getNextTheme()} theme`}
        title={`Switch to ${getNextTheme()} theme`}
        className="h-9 w-9 sm:h-10 sm:w-10"
      >
        {getIcon()}
      </Button>
      <AccessibilitySettings />
    </div>
  );
}