import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';
import { Droplet } from 'lucide-react';

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const WaterTracker: React.FC = () => {
  const { user } = useAuth();
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const todayStr = getLocalDateString(new Date());
  const GOAL = 8;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHydration = async () => {
      const { data, error } = await supabase
        .from('hydration')
        .select('glasses')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .single();

      if (!error && data) {
        setGlasses(data.glasses || 0);
      } else {
        setGlasses(0);
      }
      setLoading(false);
    };
    fetchHydration();
  }, [user, todayStr]);

  const handleAddGlass = async () => {
    if (!user) return;
    const newCount = glasses + 1;
    setGlasses(newCount);

    const { error } = await supabase
      .from('hydration')
      .upsert({ user_id: user.id, date: todayStr, glasses: newCount }, { onConflict: 'user_id,date' });

    if (error) console.error('Error updating hydration:', error);
  };

  const progress = Math.min((glasses / GOAL) * 100, 100);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
          <Droplet size={22} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hydration Tracker</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Keep hydrated throughout the day</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{glasses} <span className="text-lg text-gray-400 font-medium">/ {GOAL} glasses</span></p>
      </div>

      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        onClick={handleAddGlass}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm shadow-blue-600/20"
      >
        Add Glass of Water
      </button>
    </div>
  );
};
