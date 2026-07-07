import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

export const StudyLogger: React.FC = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogSession = async () => {
    if (!user || !subject.trim() || !duration) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject: subject,
          duration: parseInt(duration),
          timestamp: new Date()
        });
      if (error) throw error;
      alert('Study session logged!');
      setSubject('');
      setDuration('');
    } catch (error) {
      console.error(error);
      alert('Failed to log session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="text-teal-600 dark:text-teal-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Study Logger</h3>
      </div>
      <input
        type="text"
        placeholder="Subject name"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <button
        onClick={handleLogSession}
        disabled={loading}
        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Logging...' : 'Log Session'}
      </button>
    </div>
  );
};
