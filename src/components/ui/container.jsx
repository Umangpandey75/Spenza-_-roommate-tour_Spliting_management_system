import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

const Container = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
      className
    )}
    {...props}
  />
));
Container.displayName = 'Container';

const ContainerFluid = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('w-full px-4 sm:px-6 lg:px-8', className)}
    {...props}
  />
));
ContainerFluid.displayName = 'ContainerFluid';

const ContainerNarrow = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8',
      className
    )}
    {...props}
  />
));
ContainerNarrow.displayName = 'ContainerNarrow';

const ContainerWide = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8',
      className
    )}
    {...props}
  />
));
ContainerWide.displayName = 'ContainerWide';

export { Container, ContainerFluid, ContainerNarrow, ContainerWide };