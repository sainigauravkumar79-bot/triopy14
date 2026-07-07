import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

const BADGES = [
  { name: 'Novice', xp: 100 },
  { name: 'Apprentice', xp: 500 },
  { name: 'Master', xp: 1000 },
];

export const Badges: React.FC = () => {
  const { user } = useAuth();
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('stats')
        .select('total_xp')
        .eq('user_id', user.id)
        .eq('id', 'main')
        .single();
      
      if (!error && data) {
        setTotalXP(data.total_xp);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Award className="text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {BADGES.map(badge => (
          <div key={badge.name} className={`p-2 rounded-lg text-xs font-bold ${totalXP >= badge.xp ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
            {badge.name} ({badge.xp} XP)
          </div>
        ))}
      </div>
    </div>
  );
};
