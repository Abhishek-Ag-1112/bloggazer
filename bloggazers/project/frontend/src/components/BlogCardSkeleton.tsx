// src/components/BlogCardSkeleton.tsx
import React from 'react';

const BlogCardSkeleton: React.FC = () => {
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Image Placeholder */}
      <div className="relative h-48 overflow-hidden bg-gray-300 dark:bg-gray-700 animate-pulse">
        <div className="absolute top-4 right-4 h-6 w-24 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        {/* Meta Placeholder */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-3">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Title Placeholder */}
        <div className="h-6 w-5/6 bg-gray-400 dark:bg-gray-600 rounded mb-3 animate-pulse"></div>

        {/* Excerpt Placeholder */}
        <div className="space-y-2 flex-grow mb-4">
          <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Tags Placeholder */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>

        {/* Read More Placeholder */}
        <div className="mt-auto flex items-center justify-between">
          <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </article>
  );
};

export default BlogCardSkeleton;