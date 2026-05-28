import React from 'react';
import { cn, clamp } from '../../lib/utils';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: string; // Tailwind class like bg-color-accent
}

export function ProgressBar({ value, color = 'bg-color-accent', className, ...props }: ProgressBarProps) {
  const safeValue = clamp(value, 0, 100);

  return (
    <div
      className={cn('w-full h-3 neu-inset rounded-full overflow-hidden', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', color)}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
