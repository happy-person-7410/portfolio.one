import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface PricingSkeletonProps {
  count?: number;
}

export const PricingSkeleton: React.FC<PricingSkeletonProps> = ({ count = 3 }) => {
  return (
    <div
      role="status"
      aria-label="Loading pricing packages..."
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white dark:bg-[#111726] rounded-3xl p-8 border ${
            i === 1
              ? 'border-blue-500/50 shadow-xl shadow-blue-500/10'
              : 'border-neutral-200/90 dark:border-[#1e293b] shadow-2xs'
          } flex flex-col justify-between space-y-8`}
        >
          <div className="space-y-6">
            {/* Header: Title & Badge */}
            <div className="flex items-center justify-between">
              <Skeleton className="w-32 h-6 rounded-md" />
              {i === 1 && <Skeleton className="w-24 h-6 rounded-full" />}
            </div>

            {/* Description */}
            <Skeleton className="w-full h-4 rounded-md" />

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-[#171f33] space-y-2">
              <Skeleton className="w-16 h-3.5 rounded-md" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="w-36 h-9 rounded-lg" />
                <Skeleton className="w-16 h-4 rounded-md" />
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-2">
              <Skeleton className="w-28 h-4 rounded-md mb-2" />
              {Array.from({ length: 5 }).map((_, fIndex) => (
                <div key={fIndex} className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <Skeleton className="w-5/6 h-4 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Button */}
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      ))}
    </div>
  );
};
