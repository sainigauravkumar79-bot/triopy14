import React, { useEffect, useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

interface StudySession {
  subject: string;
  duration: number;
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusHistory: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchSessions = async () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', oneMonthAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (!error && data) {
        setSessions(data);
        const total = data.reduce((acc, curr) => acc + curr.duration, 0);
        setTotalTime(total);
      }
    };

    fetchSessions();
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Focus History</h2>
          <button onClick={onClose}><X className="text-gray-500 dark:text-gray-400" /></button>
        </div>

        <div className="mb-6 p-4 bg-purple-100 dark:bg-purple-900 rounded-xl">
          <p className="text-sm text-purple-800 dark:text-purple-200">Total Focus Time</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-white">{Math.round(totalTime / 60)} hours</p>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {sessions.map((session, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
              <span className="font-medium text-gray-800 dark:text-white">{session.subject}</span>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Clock size={16} />
                {Math.round(session.duration / 60)} min
                <Calendar size={16} />
                {new Date(session.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
