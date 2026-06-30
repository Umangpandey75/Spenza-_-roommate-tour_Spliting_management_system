'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Container } from '@/components/ui/container';
import { PatternDots } from '@/components/ui/patterns';
import { getMotionVariants, getTransition } from '@/lib/utils/motion';

const AppShell = forwardRef(({ 
  children, 
  className, 
  pattern = 'dots',
  containerType = 'default',
  ...props 
}, ref) => {
  const PatternComponent = pattern === 'dots' ? PatternDots : PatternDots;
  const ContainerComponent = Container;

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative min-h-screen bg-background text-foreground',
        // Mobile-specific improvements
        'px-4 sm:px-6 lg:px-8',
        // Safe area support for devices with notches
        'pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]',
        className
      )}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={getMotionVariants('fadeIn')}
      transition={getTransition('normal')}
      {...props}
    >
      <PatternComponent className="pointer-events-none" />
      <div className="relative z-10">
        <ContainerComponent>
          {children}
        </ContainerComponent>
      </div>
    </motion.div>
  );
});
AppShell.displayName = 'AppShell';

const AppHeader = forwardRef(({ children, className, ...props }, ref) => (
  <motion.header
    ref={ref}
    className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      // Mobile-specific improvements
      'px-4 sm:px-6 lg:px-8 py-3 sm:py-4',
      // Safe area support for devices with notches
      'pt-[max(0.75rem,env(safe-area-inset-top))] px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]',
      className
    )}
    initial="initial"
    animate="animate"
    variants={getMotionVariants('fadeInDown')}
    transition={getTransition('normal')}
    {...props}
  >
    {children}
  </motion.header>
));
AppHeader.displayName = 'AppHeader';

const AppMain = forwardRef(({ children, className, ...props }, ref) => (
  <motion.main
    ref={ref}
    className={cn(
      'flex-1 py-4 sm:py-6',
      // Mobile-specific improvements
      'px-4 sm:px-6 lg:px-8',
      className
    )}
    initial="initial"
    animate="animate"
    variants={getMotionVariants('fadeInUp')}
    transition={getTransition('normal')}
    {...props}
  >
    {children}
  </motion.main>
));
AppMain.displayName = 'AppMain';

const AppFooter = forwardRef(({ children, className, ...props }, ref) => (
  <motion.footer
    ref={ref}
    className={cn(
      'border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}
    initial="initial"
    animate="animate"
    variants={getMotionVariants('fadeInUp')}
    transition={getTransition('normal')}
    {...props}
  >
    {children}
  </motion.footer>
));
AppFooter.displayName = 'AppFooter';

export { AppShell, AppHeader, AppMain, AppFooter };