import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

export const GoalTracker: React.FC = () => {
  const { user } = useAuth();
  const [goal, setGoal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const fetchData = async () => {
      const { data: studySessions, error: studyError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', oneWeekAgo.toISOString());
      
      if (!studyError && studySessions) {
        setCurrent(studySessions.length);
      }
      
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('target')
        .eq('user_id', user.id)
        .eq('type', 'study')
        .single();
      
      if (!goalError && goalData) {
        setGoal(goalData.target);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [user]);

  const updateGoal = async (newTarget: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('goals')
      .upsert({ user_id: user.id, type: 'study', target: newTarget }, { onConflict: 'user_id,type' });
    if (!error) {
      setGoal(newTarget);
    }
  };

  const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Target className="text-emerald-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Study Goal</h3>
      </div>
      
      <div className="mb-4">
        <label className="text-sm text-gray-500 dark:text-gray-400">Target sessions:</label>
        <input 
          type="number" 
          value={goal} 
          onChange={(e) => updateGoal(parseInt(e.target.value) || 0)} 
          className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
        <div className="bg-emerald-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{current} / {goal} sessions</p>
    </div>
  );
};
