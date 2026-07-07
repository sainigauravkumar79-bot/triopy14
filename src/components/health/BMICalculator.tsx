import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export const BMICalculator: React.FC = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) {
      const result = parseFloat((w / (h * h)).toFixed(1));
      setBmi(result);
      
      if (result < 18.5) setCategory('Underweight');
      else if (result < 25) setCategory('Normal weight');
      else if (result < 30) setCategory('Overweight');
      else setCategory('Obese');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BMI Calculator</h3>
      </div>
      <div className="space-y-3">
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={calculateBMI}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
        >
          Calculate
        </button>
        {bmi !== null && (
          <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{bmi}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{category}</p>
          </div>
        )}
      </div>
    </div>
  );
};
