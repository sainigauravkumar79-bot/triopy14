import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { Habit } from '../types';

export const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHabits = async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setHabits(data.map(h => ({
          ...h,
          userId: h.user_id,
          createdAt: h.created_at,
          completedDates: h.completed_dates || []
        })));
      }
      setLoading(false);
    };

    fetchHabits();
  }, [user]);

  return { habits, loading };
};
