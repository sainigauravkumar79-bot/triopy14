import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

export const WorkoutTracker: React.FC = () => {
  const { user } = useAuth();
  const [workout, setWorkout] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogWorkout = async () => {
    if (!user || !workout.trim() || !duration) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workout,
          duration: parseInt(duration),
          type: 'cardio',
          created_at: new Date()
        });
      if (error) throw error;
      alert('Workout logged successfully!');
      setWorkout('');
      setDuration('');
    } catch (error) {
      console.error(error);
      alert('Failed to log workout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Dumbbell className="text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workout Tracker</h3>
      </div>
      <input
        type="text"
        placeholder="Enter workout (e.g. Running)"
        value={workout}
        onChange={(e) => setWorkout(e.target.value)}
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={handleLogWorkout}
        disabled={loading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? 'Logging...' : 'Log Workout'}
      </button>
    </div>
  );
};
