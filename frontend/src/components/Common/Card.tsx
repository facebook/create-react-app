import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={clsx('bg-white rounded-lg shadow-md p-6', className)}>
      {children}
    </div>
  );
};
