import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface AddOnsSkeletonProps {
  count?: number;
}

export const AddOnsSkeleton: React.FC<AddOnsSkeletonProps> = ({ count = 7 }) => {
  return (
    <div
      role="status"
      aria-label="Loading add-on services..."
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl border border-neutral-200/90 dark:border-[#1e293b] bg-white dark:bg-[#111726] shadow-2xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="w-3/4 h-5 rounded-md" />
            <Skeleton className="w-full h-3.5 rounded-md" />
            <Skeleton className="w-5/6 h-3.5 rounded-md" />
          </div>
          <div className="pt-3 border-t border-neutral-100 dark:border-[#1e293b] flex items-center justify-between">
            <Skeleton className="w-20 h-5 rounded-md" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
