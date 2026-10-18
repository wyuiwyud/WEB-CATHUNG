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
        'liquid-btn-glare bg-gradient-to-r from-[#4F46E5] via-[#5B54F0] to-[#6366F1] text-white hover:from-[#4338CA] hover:to-[#4F46E5] hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-indigo-500/30 border-t border-white/35 focus-visible:ring-[#4F46E5]',
      secondary:
        'liquid-btn-glare liquid-glass text-[#0F172A] hover:text-indigo-600 hover:-translate-y-0.5 active:scale-[0.98] shadow-sm hover:shadow focus-visible:ring-slate-400',
      outline:
        'border-2 border-indigo-500/70 text-[#4F46E5] bg-indigo-50/40 backdrop-blur-md hover:bg-indigo-100/60 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-[#4F46E5]',
      danger:
        'liquid-btn-glare bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-red-500/25 border-t border-white/30 focus-visible:ring-red-500',
      success:
        'liquid-btn-glare bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-emerald-500/25 border-t border-white/30 focus-visible:ring-emerald-500',
      ghost:
        'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 backdrop-blur-sm active:scale-[0.98] focus-visible:ring-slate-400',
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
