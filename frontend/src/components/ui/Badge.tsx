import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        'neu-raised shadow-sm border border-black/5',
        {
          'bg-color-surface text-color-text': variant === 'default',
          'bg-color-success text-black': variant === 'success',
          'bg-color-warning text-black': variant === 'warning',
          'bg-color-danger text-black': variant === 'danger',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
