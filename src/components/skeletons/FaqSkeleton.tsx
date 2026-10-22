import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface FaqSkeletonProps {
  count?: number;
}

export const FaqSkeleton: React.FC<FaqSkeletonProps> = ({ count = 5 }) => {
  return (
    <div role="status" aria-label="Loading FAQs..." className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111726] rounded-2xl border border-neutral-200/90 dark:border-[#1e293b] p-5 sm:p-6 shadow-2xs flex items-center justify-between gap-4"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="w-4/5 sm:w-3/5 h-5 rounded-md" />
          </div>
          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
};
