import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-[12px] transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

    // Touch targets >= 44px for accessibility
    const sizeStyles = {
      sm: 'text-xs px-3.5 py-2 min-h-[38px] gap-1.5',
      md: 'text-sm px-5 py-2.5 min-h-[46px] gap-2',
      lg: 'text-base px-6 py-3.5 min-h-[52px] gap-2.5 tracking-wide',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white hover:from-[#4338CA] hover:to-[#4F46E5] hover:-translate-y-0.5 active:scale-[0.98] shadow-md hover:shadow-lg shadow-indigo-500/25 focus-visible:ring-[#4F46E5]',
      secondary:
        'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:-translate-y-0.5 active:scale-[0.98] shadow-sm hover:shadow focus-visible:ring-slate-400',
      outline:
        'border-2 border-[#4F46E5] text-[#4F46E5] bg-transparent hover:bg-[#EEF2FF] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-[#4F46E5]',
      danger:
        'bg-[#EF4444] text-white hover:bg-[#DC2626] hover:-translate-y-0.5 active:scale-[0.98] shadow-md shadow-red-500/20 focus-visible:ring-red-500',
      success:
        'bg-[#10B981] text-white hover:bg-[#059669] hover:-translate-y-0.5 active:scale-[0.98] shadow-md shadow-emerald-500/20 focus-visible:ring-emerald-500',
      ghost:
        'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] active:scale-[0.98] focus-visible:ring-slate-400',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
