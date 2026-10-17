import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  highlighted?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      interactive = false,
      padding = 'md',
      highlighted = false,
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
          'bg-white rounded-[20px] border border-[#E2E8F0] shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all duration-200',
          interactive &&
            'cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] hover:border-indigo-200 active:scale-[0.99]',
          highlighted && 'border-indigo-400 ring-2 ring-indigo-500/20 shadow-indigo-100',
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
