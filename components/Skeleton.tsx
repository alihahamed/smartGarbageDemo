import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'list' | 'text' | 'profile';
  count?: number;
}

export default function Skeleton({ className = '', variant = 'card', count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count });

  const renderSkeletonItem = (index: number) => {
    switch (variant) {
      case 'list':
        return (
          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-brand-surface-alt/50 border border-brand-surface-alt animate-pulse">
            <div className="space-y-2 w-2/3">
              <div className="h-4 bg-brand-text-muted/20 rounded w-1/3"></div>
              <div className="h-3 bg-brand-text-muted/10 rounded w-5/6"></div>
            </div>
            <div className="h-6 bg-brand-text-muted/20 rounded w-16"></div>
          </div>
        );
      case 'text':
        return (
          <div key={index} className="space-y-2 py-1 animate-pulse">
            <div className="h-4 bg-brand-text-muted/20 rounded w-full"></div>
            <div className="h-4 bg-brand-text-muted/20 rounded w-5/6"></div>
            <div className="h-4 bg-brand-text-muted/10 rounded w-2/3"></div>
          </div>
        );
      case 'profile':
        return (
          <div key={index} className="flex gap-4 items-center p-4 rounded-xl bg-brand-surface-alt/40 border border-brand-surface-alt animate-pulse">
            <div className="w-16 h-16 rounded-full bg-brand-text-muted/20"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-brand-text-muted/20 rounded w-1/2"></div>
              <div className="h-4 bg-brand-text-muted/10 rounded w-1/3"></div>
              <div className="h-3 bg-brand-text-muted/10 rounded w-3/4"></div>
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div key={index} className="p-4 rounded-xl bg-brand-surface-alt/40 border border-brand-accent/5 animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-brand-text-muted/20 rounded w-1/3"></div>
              <div className="h-4 bg-brand-text-muted/25 rounded w-12"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-brand-text-muted/20 rounded w-3/4"></div>
              <div className="h-3 bg-brand-text-muted/10 rounded w-5/6"></div>
            </div>
            <div className="pt-2 flex gap-2">
              <div className="h-8 bg-brand-text-muted/20 rounded w-20"></div>
              <div className="h-8 bg-brand-text-muted/10 rounded w-24"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((_, i) => renderSkeletonItem(i))}
    </div>
  );
}
