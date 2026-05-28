import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-color-muted ml-1">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'neu-inset w-full px-4 py-2 text-color-text bg-color-background placeholder:text-color-muted/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all',
            error && 'ring-2 ring-color-danger',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-color-danger ml-1 animate-fade-in">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
