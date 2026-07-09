import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

interface Subscription {
  is_premium: boolean;
    subscription_type: string;
      trial_start_date?: string;
      }

      export const useSubscription = () => {
        const { user } = useAuth();
          const [subscription, setSubscription] = useState<Subscription | null>(null);
            const [loading, setLoading] = useState(true);

              useEffect(() => {
                  if (!user) {
                        setSubscription(null);
                              setLoading(false);
                                    return;
                                        }

                                            const fetchSubscription = async () => {
                                                  const { data, error } = await supabase
                                                          .from('subscriptions')
                                                                  .select('*')
                                                                          .eq('user_id', user.id)
                                                                                  .single();

                                                                                        if (!error && data) {
                                                                                                setSubscription(data);
                                                                                                      }
                                                                                                            setLoading(false);
                                                                                                                };

                                                                                                                    fetchSubscription();
                                                                                                                      }, [user]);

                                                                                                                        return { subscription, loading };
                                                                                                                        };