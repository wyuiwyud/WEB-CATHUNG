import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  highlighted?: boolean;
  variant?: 'glass' | 'solid';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      interactive = false,
      padding = 'md',
      highlighted = false,
      variant = 'glass',
      children,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-5',
      lg: 'p-6 sm:p-7',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[22px] transition-all duration-300 relative',
          variant === 'glass'
            ? 'liquid-glass'
            : 'bg-white rounded-[20px] border border-[#E2E8F0] shadow-[0_4px_16px_rgba(15,23,42,0.08)]',
          interactive &&
            'cursor-pointer liquid-glass-interactive active:scale-[0.985]',
          highlighted && 'border-indigo-400 ring-2 ring-indigo-500/25 shadow-indigo-100',
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
