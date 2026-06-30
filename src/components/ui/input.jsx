import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';

const Input = forwardRef(({ 
  className, 
  type, 
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  id,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      id={id}
      className={cn(
        'flex h-11 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base',
        'ring-offset-background transition-colors duration-[var(--motion-duration-fast)]',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-[var(--focus-ring-color)] focus-visible:ring-offset-[var(--focus-ring-offset)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Ensure minimum touch target on mobile
        'min-h-[44px]',
        // Error state styling
        ariaInvalid && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      ref={ref}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };