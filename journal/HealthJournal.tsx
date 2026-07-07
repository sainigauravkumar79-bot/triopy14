import React, { useState, useEffect } from 'react';
import { BookOpen, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

interface JournalEntry {
  id: string;
  note: string;
  timestamp: string;
}

export const HealthJournal: React.FC = () => {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchEntries = async () => {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });
        if (!error && data) setEntries(data as JournalEntry[]);
    };
    fetchEntries();
  }, [user]);

  const addEntry = async () => {
    if (!user || !note.trim()) return;
    await supabase.from('journal_entries').insert({
      user_id: user.id,
      note,
      timestamp: new Date().toISOString()
    });
    setNote('');
    const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
    if (data) setEntries(data as JournalEntry[]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="text-pink-600 dark:text-pink-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Journal</h3>
      </div>
      <div className="flex gap-2 mb-4">
        <input 
          value={note} 
          onChange={e => setNote(e.target.value)}
          placeholder="How was your day?"
          className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button onClick={addEntry} className="p-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors"><Send size={20} /></button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {entries.map(entry => (
          <div key={entry.id} className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm text-gray-700 dark:text-gray-300">
            {entry.note}
          </div>
        ))}
      </div>
    </div>
  );
};
