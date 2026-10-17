import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isWorking?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  color = '#4F46E5',
  size = 'md',
  isWorking = false,
  className,
  ...props
}) => {
  // Extract initial: In Vietnamese, usually the last word (first name) or first letter
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    // Return first letter of last name (Tên)
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const initial = getInitials(name);

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-11 h-11 text-base font-bold',
    lg: 'w-14 h-14 text-xl font-extrabold',
    xl: 'w-20 h-20 text-2xl font-extrabold',
  };

  const dotSize = {
    sm: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5 ring-1.5',
    md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5 ring-2',
    lg: 'w-4 h-4 bottom-0 right-0 ring-2',
    xl: 'w-5 h-5 bottom-0.5 right-0.5 ring-2.5',
  };

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)} {...props}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white shadow-sm font-sans tracking-tight',
          sizeStyles[size]
        )}
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          boxShadow: `0 4px 12px ${color}33`,
        }}
        aria-label={name}
      >
        {initial}
      </div>

      {isWorking && (
        <span
          className={cn(
            'absolute rounded-full bg-emerald-500 ring-white animate-pulse',
            dotSize[size]
          )}
          title="Đang trong ca làm"
        />
      )}
    </div>
  );
};
