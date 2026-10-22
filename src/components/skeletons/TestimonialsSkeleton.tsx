import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface TestimonialsSkeletonProps {
  count?: number;
}

export const TestimonialsSkeleton: React.FC<TestimonialsSkeletonProps> = ({ count = 3 }) => {
  return (
    <div
      role="status"
      aria-label="Loading client testimonials..."
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111726] rounded-2xl p-7 border border-neutral-200/90 dark:border-[#1e293b] shadow-2xs flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            {/* 5-Star Row */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Skeleton key={starIndex} className="w-4 h-4 rounded-sm" />
              ))}
            </div>

            {/* Quote Lines */}
            <div className="space-y-2 pt-1">
              <Skeleton className="w-full h-4 rounded-md" />
              <Skeleton className="w-11/12 h-4 rounded-md" />
              <Skeleton className="w-4/5 h-4 rounded-md" />
            </div>
          </div>

          {/* Client Avatar & Details */}
          <div className="pt-5 border-t border-neutral-100 dark:border-[#1e293b] flex items-center gap-3.5">
            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="w-24 h-4 rounded-md" />
              <Skeleton className="w-32 h-3.5 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
