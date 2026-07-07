import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

export const SpeechReminder: React.FC = () => {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled || !user) return;

    const checkSchedule = async () => {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .gte('time', now.toISOString())
        .lte('time', tenMinutesFromNow.toISOString());

      if (!error && data) {
        data.forEach(item => {
          const utterance = new SpeechSynthesisUtterance(
            `Reminder: You have a scheduled session for ${item.title} in a few minutes. You got this!`
          );
          window.speechSynthesis.speak(utterance);
        });
      }
    };

    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [enabled, user]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`p-2 rounded-full ${enabled ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
      title={enabled ? "Disable verbal reminders" : "Enable verbal reminders"}
    >
      {enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
};
