import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

export const SubscriptionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const initSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            is_premium: true,
            trial_start_date: new Date(),
            subscription_type: 'trial'
          });
      }
    };
    initSubscription();
  }, [user]);

  return <>{children}</>;
};
