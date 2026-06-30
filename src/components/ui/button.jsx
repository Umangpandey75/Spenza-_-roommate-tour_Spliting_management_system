import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';

const buttonVariants = {
  variant: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  },
  size: {
    default: 'h-9 sm:h-10 px-3 sm:px-4 py-2 text-sm',
    sm: 'h-8 sm:h-9 rounded-md px-2 sm:px-3 text-xs sm:text-sm',
    lg: 'h-10 sm:h-11 rounded-md px-6 sm:px-8 text-sm sm:text-base',
    icon: 'h-9 w-9 sm:h-10 sm:w-10',
  },
};

const Button = forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default',
  children,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-pressed': ariaPressed,
  disabled,
  ...props 
}, ref) => {
  // Ensure minimum touch target size for accessibility
  const isIconOnly = size === 'icon' || (!children && ariaLabel);
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
        'ring-offset-background transition-colors duration-[var(--motion-duration-fast)]',
        'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)]',
        'disabled:pointer-events-none disabled:opacity-50',
        // Ensure minimum 44px touch target for accessibility
        isIconOnly && 'min-w-[44px] min-h-[44px]',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      ref={ref}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-pressed={ariaPressed}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };