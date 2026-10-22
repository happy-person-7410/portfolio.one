import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular';
  shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  shimmer = true,
  ...props
}) => {
  const variantClass = {
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
    circular: 'rounded-full',
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-neutral-200/80 dark:bg-slate-800/80 ${variantClass} ${
        shimmer
          ? 'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.8s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/20 dark:after:via-white/5 after:to-transparent'
          : 'animate-pulse'
      } ${className}`}
      {...props}
    />
  );
};
