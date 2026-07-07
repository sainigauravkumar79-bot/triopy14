import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface PomodoroTimerProps {
  onComplete: (duration: number) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onComplete }) => {
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      if (minutes === 0 && seconds === 0) {
        setIsActive(false);
        onComplete(initialMinutes);
        return;
      }
      interval = setInterval(() => {
        if (seconds === 0) {
          setMinutes(m => m - 1);
          setSeconds(59);
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, initialMinutes, onComplete]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setInitialMinutes(val);
    setMinutes(val);
    setSeconds(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Timer className="text-teal-600 dark:text-teal-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pomodoro Timer</h3>
      </div>
      <div className="mb-4">
        <label className="text-sm text-gray-500 dark:text-gray-400">Duration (min):</label>
        <input
          type="number"
          value={initialMinutes}
          onChange={handleDurationChange}
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white"
          disabled={isActive}
        />
      </div>
      <div className="text-center mb-4">
        <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
      </div>
      <button
        onClick={() => setIsActive(!isActive)}
        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
      >
        {isActive ? 'Pause' : 'Start'}
      </button>
    </div>
  );
};
