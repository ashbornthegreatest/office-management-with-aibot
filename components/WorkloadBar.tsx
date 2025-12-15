import React from 'react';

interface Props {
  score: number;
  isCEO?: boolean;
}

export const WorkloadBar: React.FC<Props> = ({ score, isCEO }) => {
  let color = 'bg-green-500';
  let width = `${Math.min(100, Math.max(0, score))}%`;

  if (score < 40) color = 'bg-blue-400'; // Underutilized
  if (score > 80) color = 'bg-red-500'; // Overloaded
  
  // CEO Mode - Applies visual flair but keeps the width relative to the real score
  if (isCEO) {
      color = 'bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.7)]';
  }
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2 overflow-hidden">
      <div 
        className={`h-2.5 rounded-full ${color} transition-all duration-500 ease-out`} 
        style={{ width }}
      ></div>
    </div>
  );
};