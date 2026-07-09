import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

export const StreakCounter: React.FC = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;

    const calculateStreak = async () => {
      const { data, error } = await supabase
        .from('quests')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error || !data) {
        setStreak(0);
        return;
      }

      const completedDates = new Set<string>();
      data.forEach((item: any) => {
        if (item.completed_at) {
          const date = new Date(item.completed_at).toISOString().split('T')[0];
          completedDates.add(date);
        }
      });

      const sortedDates = Array.from(completedDates).sort().reverse();
      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      const todayStr = checkDate.toISOString().split('T')[0];
      const yesterday = new Date(checkDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) {
        setStreak(0);
        return;
      }

      for (let i = 0; i < sortedDates.length; i++) {
        const dateStr = sortedDates[i];
        const expectedDate = new Date(checkDate);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (dateStr === expectedDate.toISOString().split('T')[0]) {
          currentStreak++;
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    };

    calculateStreak();
  }, [user]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
      <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-2xl">
        <Flame className="text-orange-500" size={24} />
      </div>
      <div>
        <h3 className="text-sm text-gray-500 dark:text-gray-400">Current Streak</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{streak} days</p>
      </div>
    </div>
  );
};
