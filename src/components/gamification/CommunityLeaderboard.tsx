import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
}

export const CommunityLeaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
            .from('stats')
            .select('user_id, total_xp')
            .order('total_xp', { ascending: false })
            .limit(10);
            
        if (!error && data) {
            setEntries(data as LeaderboardEntry[]);
        }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Users className="text-indigo-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Community Leaderboard</h3>
      </div>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={entry.user_id} className="flex justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-sm">
            <span className="text-gray-700 dark:text-gray-300">{index + 1}. User {entry.user_id.slice(0, 5)}...</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{entry.total_xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};
