import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-2 p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-color-muted">{title}</span>
        {icon && <div className="text-color-muted opacity-70">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-color-text">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold',
              trend.value > 0 ? 'text-color-danger' : trend.value < 0 ? 'text-color-success' : 'text-color-muted'
            )}
          >
            {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
    </Card>
  );
}
