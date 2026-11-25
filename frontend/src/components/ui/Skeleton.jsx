import React from 'react';

/**
 * Reusable Whimsical Loading Skeletons
 * Animated with a soft pastel pulse effect matching the SkillSwap palette
 */

export function Skeleton({ className = '', rounded = 'rounded-2xl', ...props }) {
  return (
    <div
      className={`animate-pulse bg-charcoal/8 border border-charcoal/5 ${rounded} ${className}`}
      {...props}
    />
  );
}

export function SkeletonAvatar({ size = 'w-12 h-12', className = '' }) {
  return (
    <Skeleton
      className={`${size} rounded-full border-2 border-charcoal/10 flex-shrink-0 ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 rounded-lg ${
            i === lines - 1 ? 'w-2/3' : i === 0 ? 'w-full' : 'w-5/6'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonBadge({ width = 'w-16', className = '' }) {
  return <Skeleton className={`h-6 ${width} rounded-full ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 border-2 border-charcoal/10 space-y-4 shadow-sm ${className}`}
    >
      {/* Top badges */}
      <div className="flex justify-between items-center">
        <SkeletonBadge width="w-24" />
        <SkeletonBadge width="w-16" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-3/4 rounded-xl" />

      {/* Description lines */}
      <SkeletonText lines={2} />

      {/* Wants pill box */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Bottom user footer */}
      <div className="pt-4 border-t border-charcoal/10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <SkeletonAvatar size="w-8 h-8" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-2.5 w-12 rounded" />
          </div>
        </div>
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  );
}
