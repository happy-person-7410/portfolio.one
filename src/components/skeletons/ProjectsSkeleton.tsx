import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface ProjectsSkeletonProps {
  count?: number;
}

export const ProjectsSkeleton: React.FC<ProjectsSkeletonProps> = ({ count = 4 }) => {
  return (
    <div
      role="status"
      aria-label="Loading projects showcase..."
      className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111726] rounded-2xl border border-neutral-200/90 dark:border-[#1e293b] overflow-hidden shadow-xs p-0 flex flex-col"
        >
          {/* 16:9 Media Area Skeleton */}
          <div className="relative aspect-video w-full bg-neutral-100 dark:bg-slate-900 overflow-hidden">
            <Skeleton className="w-full h-full rounded-none" />
            <div className="absolute top-3 left-3">
              <Skeleton className="w-24 h-6 rounded-lg" />
            </div>
            <div className="absolute top-3 right-3">
              <Skeleton className="w-16 h-6 rounded-lg" />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Category + Timeline */}
              <div className="flex items-center justify-between">
                <Skeleton className="w-28 h-4 rounded-md" />
                <Skeleton className="w-20 h-4 rounded-md" />
              </div>

              {/* Title */}
              <Skeleton className="w-3/4 h-7 rounded-lg" />

              {/* Short summary lines */}
              <div className="space-y-2 pt-1">
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-5/6 h-4 rounded-md" />
              </div>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <Skeleton className="w-16 h-6 rounded-md" />
                <Skeleton className="w-20 h-6 rounded-md" />
                <Skeleton className="w-18 h-6 rounded-md" />
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-4 border-t border-neutral-100 dark:border-[#1e293b] flex items-center justify-between gap-3">
              <Skeleton className="w-32 h-9 rounded-xl" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="w-9 h-9 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
