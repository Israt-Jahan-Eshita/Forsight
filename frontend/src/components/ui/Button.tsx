import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        type={props.type || 'button'}
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent neu-focus neu-pressed disabled:opacity-50 disabled:pointer-events-none',
          {
            'btn-primary': variant === 'primary',
            'btn-secondary': variant === 'secondary',
            'p-2 rounded-xl neu-raised hover:scale-105 active:scale-95': variant === 'icon',
            'px-3 py-1.5 text-sm': size === 'sm' && variant !== 'icon',
            'px-4 py-2 text-base': size === 'md' && variant !== 'icon',
            'px-6 py-3 text-lg': size === 'lg' && variant !== 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
