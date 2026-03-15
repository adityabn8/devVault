import React from 'react';

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <div
    className={`${sizes[size]} border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export default LoadingSpinner;
