import React, { useState } from 'react';
import { Footprints } from 'lucide-react';

export const StepTracker: React.FC = () => {
  const [steps, setSteps] = useState(0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Footprints className="text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Step Tracker</h3>
      </div>
      <div className="text-center mb-4">
        <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{steps}</p>
        <p className="text-sm text-gray-500">Total Steps Today</p>
      </div>
      <button
        onClick={() => setSteps(s => s + 500)}
        className="w-full py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-xl font-semibold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
      >
        +500 steps
      </button>
    </div>
  );
};
