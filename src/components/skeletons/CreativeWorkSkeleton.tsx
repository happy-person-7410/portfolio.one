import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface CreativeWorkSkeletonProps {
  count?: number;
}

export const CreativeWorkSkeleton: React.FC<CreativeWorkSkeletonProps> = ({ count = 6 }) => {
  return (
    <div role="status" aria-label="Loading creative works..." className="space-y-8">
      {/* Tab Selectors Skeleton */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2">
        <div className="inline-flex p-1.5 bg-neutral-100 dark:bg-[#111726] rounded-2xl border border-neutral-200/80 dark:border-[#1e293b] gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-32 h-9 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#111726] rounded-2xl border border-neutral-200/90 dark:border-[#1e293b] overflow-hidden shadow-xs flex flex-col"
          >
            {/* Image Box */}
            <div className="relative aspect-4/3 w-full bg-neutral-100 dark:bg-slate-900 overflow-hidden">
              <Skeleton className="w-full h-full rounded-none" />
              <div className="absolute top-3 left-3">
                <Skeleton className="w-20 h-5 rounded-md" />
              </div>
            </div>

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <Skeleton className="w-3/4 h-5 rounded-md" />
                <Skeleton className="w-full h-3.5 rounded-md" />
                <Skeleton className="w-4/5 h-3.5 rounded-md" />
              </div>

              {/* Tools row */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-[#1e293b]">
                <div className="flex gap-1.5">
                  <Skeleton className="w-14 h-5 rounded-md" />
                  <Skeleton className="w-14 h-5 rounded-md" />
                </div>
                <Skeleton className="w-6 h-6 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
