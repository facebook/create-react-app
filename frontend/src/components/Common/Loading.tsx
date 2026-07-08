import React from 'react';
import { ReactNode } from 'react';

interface LoadingProps {
  message?: string;
  children?: ReactNode;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', children }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">{message}</p>
      {children}
    </div>
  );
};
