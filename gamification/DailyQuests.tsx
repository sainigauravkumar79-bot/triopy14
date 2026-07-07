import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

interface Quest {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
}

export const DailyQuests: React.FC = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchQuests = async () => {
        const { data, error } = await supabase
            .from('quests')
            .select('*')
            .eq('user_id', user.id);
            
        if (!error && data) {
            if (data.length === 0) {
                await supabase.from('quests').insert([
                    { user_id: user.id, title: 'Complete a study session', xp: 50, completed: false },
                    { user_id: user.id, title: 'Drink 2L water', xp: 30, completed: false }
                ]);
                fetchQuests();
            } else {
                setQuests(data as Quest[]);
            }
        }
    };
    fetchQuests();
  }, [user]);

  const toggleQuest = async (quest: Quest) => {
    if (!user) return;
    
    const { error: questError } = await supabase
        .from('quests')
        .update({
            completed: !quest.completed,
            completed_at: !quest.completed ? new Date() : null
        })
        .eq('id', quest.id);

    if (questError) {
        console.error("Error updating quest:", questError);
        return;
    }

    const { data: stats } = await supabase
        .from('stats')
        .select('total_xp')
        .eq('user_id', user.id)
        .eq('id', 'main')
        .single();
    
    const currentXP = stats?.total_xp || 0;
    const xpChange = !quest.completed ? quest.xp : -quest.xp;
    
    await supabase
        .from('stats')
        .upsert({
            user_id: user.id,
            id: 'main',
            total_xp: Math.max(0, currentXP + xpChange)
        }, { onConflict: 'user_id,id' });

    setQuests(prev => prev.map(q => q.id === quest.id ? {...q, completed: !q.completed} : q));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Quests</h3>
      </div>
      <div className="space-y-3">
        {quests.map(quest => (
          <div key={quest.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
            <span className="text-gray-800 dark:text-gray-200">{quest.title} (+{quest.xp} XP)</span>
            <button onClick={() => toggleQuest(quest)}>
              {quest.completed ? <CheckCircle className="text-green-500" /> : <Circle className="text-gray-300 dark:text-gray-600" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
