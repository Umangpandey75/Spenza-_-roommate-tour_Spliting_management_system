import { cn } from '../../lib/utils/cn';

export function GridBackground({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'min-h-screen bg-background relative',
        'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]',
        'bg-[size:24px_24px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}