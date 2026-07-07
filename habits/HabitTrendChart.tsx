import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Habit } from '../../types';

interface HabitTrendChartProps {
  habits: Habit[];
}

export const HabitTrendChart: React.FC<HabitTrendChartProps> = ({ habits }) => {
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const studyHabits = habits.filter(h => h.category === 'study');
      const fitnessHabits = habits.filter(h => h.category === 'fitness');

      const studyCompleted = studyHabits.filter(h => h.completedDates.includes(dateStr)).length;
      const fitnessCompleted = fitnessHabits.filter(h => h.completedDates.includes(dateStr)).length;

      data.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        study: studyHabits.length > 0 ? (studyCompleted / studyHabits.length) * 100 : 0,
        fitness: fitnessHabits.length > 0 ? (fitnessCompleted / fitnessHabits.length) * 100 : 0,
      });
    }
    return data;
  }, [habits]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Progress</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '12px', border: 'none' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="study" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="fitness" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
