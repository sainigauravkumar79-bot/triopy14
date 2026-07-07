import React, { useState } from 'react';
import { PomodoroTimer } from './PomodoroTimer';
import { StudyLogger } from './StudyLogger';
import { FocusPlaylist } from './FocusPlaylist';
import { FocusHistory } from './FocusHistory';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

export const StudyModule: React.FC = () => {
  const { user } = useAuth();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleSessionComplete = async (duration: number) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('study_sessions').insert({
        user_id: user.id,
        subject: 'General Study',
        duration,
        timestamp: new Date()
      });
      if (error) throw error;
      alert('Study session logged!');
    } catch (error) {
      console.error("Error logging session:", error);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setIsHistoryOpen(true)}
        className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline"
      >
        View Study History
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PomodoroTimer onComplete={handleSessionComplete} />
        <StudyLogger />
        <FocusPlaylist />
      </div>
      <FocusHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
};
