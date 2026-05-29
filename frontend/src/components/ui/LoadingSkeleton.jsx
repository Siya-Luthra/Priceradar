import React from 'react';

export const SkeletonBox = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonBox className="h-32" />
        <SkeletonBox className="h-32" />
        <SkeletonBox className="h-32" />
      </div>
      <SkeletonBox className="h-[400px]" />
    </div>
  );
};
