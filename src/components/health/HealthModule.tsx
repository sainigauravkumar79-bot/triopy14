import React from 'react';
import { BMICalculator } from './BMICalculator';
import { WaterTracker } from './WaterTracker';

export const HealthModule: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BMICalculator />
      <WaterTracker />
    </div>
  );
};
