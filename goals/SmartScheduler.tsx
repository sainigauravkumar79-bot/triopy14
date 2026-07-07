import React, { useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

interface JournalEntry {
  note: string;
  timestamp: string;
}

export const SmartScheduler: React.FC = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSchedule = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('note, timestamp')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (error) throw error;
      const journalEntries = data as JournalEntry[];
      
      const response = await fetch('/api/suggest-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntries })
      });
      
      const dataResponse = await response.json();
      setSchedule(dataResponse.schedule);
    } catch (error) {
      console.error(error);
      alert('Failed to generate schedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Scheduler</h3>
      </div>
      
      <button 
        onClick={generateSchedule} 
        disabled={loading}
        className="w-full p-3 bg-purple-600 text-white rounded-xl flex items-center justify-center gap-2 mb-4 hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        <Sparkles size={18} />
        {loading ? 'Analyzing...' : 'Suggest Optimized Schedule'}
      </button>

      {schedule && (
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-sm text-purple-900 dark:text-purple-200 whitespace-pre-line">
          {schedule}
        </div>
      )}
    </div>
  );
};
