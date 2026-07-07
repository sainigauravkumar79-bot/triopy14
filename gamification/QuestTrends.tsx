import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

export const QuestTrends: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchTrends = async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: quests, error } = await supabase
        .from('quests')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', oneWeekAgo.toISOString());
        
      if (error) {
        console.error('Error fetching trends:', error);
        return;
      }
      
      const counts: Record<string, number> = {};
      quests?.forEach(quest => {
        if (quest.completed_at) {
          const date = new Date(quest.completed_at).toLocaleDateString();
          counts[date] = (counts[date] || 0) + 1;
        }
      });
      
      const chartData = Object.keys(counts).map(date => ({
        date,
        completions: counts[date]
      }));
      setData(chartData);
    };
    
    fetchTrends();
  }, [user]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quest Completion Trend (Last 7 Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis allowDecimals={false} stroke="#9ca3af" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Line type="monotone" dataKey="completions" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
