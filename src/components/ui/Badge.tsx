import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant =
  | 'working'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'admin'
  | 'recent'
  | 'neutral'
  | 'completed';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = true,
  className,
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    working: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dotColor: 'bg-amber-500 animate-ping',
      border: 'border-amber-200/80',
    },
    pending: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      dotColor: 'bg-orange-500',
      border: 'border-orange-200/80',
    },
    approved: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      border: 'border-emerald-200/80',
    },
    rejected: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      dotColor: 'bg-rose-500',
      border: 'border-rose-200/80',
    },
    admin: {
      bg: 'bg-amber-100/70',
      text: 'text-amber-900 font-bold',
      dotColor: 'bg-amber-600',
      border: 'border-amber-300',
    },
    recent: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700 font-medium',
      dotColor: 'bg-indigo-600',
      border: 'border-indigo-200',
    },
    completed: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dotColor: 'bg-blue-500',
      border: 'border-blue-200',
    },
    neutral: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dotColor: 'bg-slate-400',
      border: 'border-slate-200',
    },
  };

  const current = variantStyles[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border select-none tabular-nums',
        current.bg,
        current.text,
        current.border,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {variant === 'working' && (
            <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', current.dotColor)} />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', current.dotColor.split(' ')[0])} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};
