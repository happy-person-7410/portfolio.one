import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface ServicesSkeletonProps {
  count?: number;
}

export const ServicesSkeleton: React.FC<ServicesSkeletonProps> = ({ count = 8 }) => {
  return (
    <div
      role="status"
      aria-label="Loading services..."
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-neutral-200/90 dark:border-[#1e293b] shadow-2xs flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            {/* Icon + Category pill */}
            <div className="flex items-center justify-between">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>

            {/* Title & Description */}
            <Skeleton className="w-4/5 h-6 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="w-full h-3.5 rounded-md" />
              <Skeleton className="w-11/12 h-3.5 rounded-md" />
              <Skeleton className="w-4/6 h-3.5 rounded-md" />
            </div>

            {/* Feature Bullets */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded-full" />
                <Skeleton className="w-3/4 h-3.5 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded-full" />
                <Skeleton className="w-2/3 h-3.5 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded-full" />
                <Skeleton className="w-4/5 h-3.5 rounded-md" />
              </div>
            </div>
          </div>

          {/* Pricing tag & CTA */}
          <div className="pt-4 border-t border-neutral-100 dark:border-[#1e293b] flex items-center justify-between">
            <div>
              <Skeleton className="w-12 h-3 rounded-md mb-1" />
              <Skeleton className="w-20 h-5 rounded-md" />
            </div>
            <Skeleton className="w-20 h-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};
