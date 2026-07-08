import React from 'react';
import { Progress } from '../../types';

interface ProgressBarProps {
  progress: Progress;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Progress</span>
        <span className="text-sm font-semibold text-blue-600">{progress.progressPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
