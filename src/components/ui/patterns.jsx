import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

const PatternDots = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute inset-0 opacity-[0.02] dark:opacity-[0.05]',
      className
    )}
    style={{
      backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    }}
    {...props}
  />
));
PatternDots.displayName = 'PatternDots';

const PatternGrid = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute inset-0 z-0',
      className
    )}
    style={{
      backgroundImage: `
        linear-gradient(to right, #262626 1px, transparent 1px),
        linear-gradient(to bottom, #262626 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
    }}
    {...props}
  />
));
PatternGrid.displayName = 'PatternGrid';

const PatternLines = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute inset-0 opacity-[0.02] dark:opacity-[0.05]',
      className
    )}
    style={{
      backgroundImage: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        currentColor 10px,
        currentColor 11px
      )`,
    }}
    {...props}
  />
));
PatternLines.displayName = 'PatternLines';

const PatternCircles = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute inset-0 opacity-[0.02] dark:opacity-[0.05]',
      className
    )}
    style={{
      backgroundImage: `radial-gradient(circle at 50% 50%, transparent 20px, currentColor 21px, currentColor 22px, transparent 23px)`,
      backgroundSize: '40px 40px',
    }}
    {...props}
  />
));
PatternCircles.displayName = 'PatternCircles';

const PatternHexagons = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute inset-0 opacity-[0.02] dark:opacity-[0.05]',
      className
    )}
    style={{
      backgroundImage: `
        radial-gradient(circle at 25% 25%, transparent 20%, currentColor 21%, currentColor 22%, transparent 23%),
        radial-gradient(circle at 75% 75%, transparent 20%, currentColor 21%, currentColor 22%, transparent 23%)
      `,
      backgroundSize: '30px 30px',
      backgroundPosition: '0 0, 15px 15px',
    }}
    {...props}
  />
));
PatternHexagons.displayName = 'PatternHexagons';

const PatternWaves = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute inset-0 opacity-[0.02] dark:opacity-[0.05]',
      className
    )}
    style={{
      backgroundImage: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        currentColor 2px,
        currentColor 4px
      )`,
      transform: 'skewY(-12deg)',
    }}
    {...props}
  />
));
PatternWaves.displayName = 'PatternWaves';

// Enhanced grid pattern with dark theme styling
const PatternGridDark = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute inset-0 z-0',
      className
    )}
    style={{
      backgroundImage: `
        linear-gradient(to right, #262626 1px, transparent 1px),
        linear-gradient(to bottom, #262626 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
    }}
    {...props}
  />
));
PatternGridDark.displayName = 'PatternGridDark';

export {
  PatternDots,
  PatternGrid,
  PatternGridDark,
  PatternLines,
  PatternCircles,
  PatternHexagons,
  PatternWaves,
};