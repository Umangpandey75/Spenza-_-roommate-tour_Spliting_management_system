// accessibility-settings.jsx
'use client';

import { useTheme } from './theme-provider';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// 🔑 STEP 1: Replace Dialog imports with Popover imports
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'; 
import { Settings, Eye, Zap, Palette } from 'lucide-react';

export function AccessibilitySettings() {
  const { 
    theme, 
    setTheme, 
    reducedMotion, 
    setReducedMotion, 
    highContrast, 
    setHighContrast 
  } = useTheme();

  return (
    // 🔑 STEP 2: Change <Dialog> to <Popover>
    <Popover>
      {/* 🔑 STEP 3: Change <DialogTrigger> to <PopoverTrigger> */}
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="Open accessibility settings"
          title="Accessibility Settings"
          className="h-9 w-9 sm:h-10 sm:w-10"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      {/* 🔑 STEP 4: Change <DialogContent> to <PopoverContent> and set anchor alignment */}
      {/* The w-80 class is often better than max-w-md for popovers */}
      <PopoverContent className="w-80 p-4 bg-card/95 backdrop-blur-md border-border/50" align="end">
        
        {/* Simplified Header for a Popover (removed DialogHeader/Title) */}
        <h3 className="flex items-center gap-2 text-base font-semibold mb-4 border-b pb-2">
          <Settings className="h-4 w-4" />
          Accessibility Settings
        </h3>
        
        <div className="space-y-4">
          {/* Theme Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </CardTitle>
            </CardHeader> 
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {['light', 'dark', 'system'].map((themeOption) => (
                  <Button
                    key={themeOption}
                    variant={theme === themeOption ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(themeOption)}
                    className="capitalize text-xs sm:text-sm px-2 sm:px-3"
                    aria-pressed={theme === themeOption}
                  >
                    {themeOption}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reduced Motion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Motion
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Reduce motion</p>
                  <p className="text-xs text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Button
                  variant={reducedMotion ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReducedMotion(!reducedMotion)}
                  aria-pressed={reducedMotion}
                  aria-label={`${reducedMotion ? 'Disable' : 'Enable'} reduced motion`}
                  className="flex-shrink-0 min-w-[48px]"
                >
                  {reducedMotion ? 'On' : 'Off'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* High Contrast */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Contrast
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">High contrast</p>
                  <p className="text-xs text-muted-foreground">
                    Increase color contrast for better visibility
                  </p>
                </div>
                <Button
                  variant={highContrast ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHighContrast(!highContrast)}
                  aria-pressed={highContrast}
                  aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                  className="flex-shrink-0 min-w-[48px]"
                >
                  {highContrast ? 'On' : 'Off'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PopoverContent>
    </Popover>
  );
}