import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableSkeleton = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const skeletonTypes = {
    card: <CardSkeleton />,
    list: <ListSkeleton />,
    table: <TableSkeleton />
  };

  return (
    <div className="space-y-4">
      {type === 'card' ? 
        Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />) :
        skeletonTypes[type]
      }
    </div>
  );
};

export default SkeletonLoader;