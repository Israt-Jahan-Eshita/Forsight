import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, fallback, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'neu-raised rounded-full flex items-center justify-center overflow-hidden bg-color-surface border-2 border-white',
        {
          'w-8 h-8 text-xs': size === 'sm',
          'w-12 h-12 text-base': size === 'md',
          'w-16 h-16 text-xl': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-color-muted">{fallback}</span>
      )}
    </div>
  );
}
