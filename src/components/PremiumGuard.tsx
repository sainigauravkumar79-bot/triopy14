import React from 'react';
import { useSubscription } from '../hooks/useSubscription';

export const PremiumGuard: React.FC<{ 
  children: React.ReactNode; 
  requiredType?: 'study' | 'health' | 'fitness' 
}> = ({ children, requiredType }) => {
  const { subscription, loading } = useSubscription();

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

  const isAuthorized = subscription?.is_premium && (
    !requiredType ||
    subscription.subscription_type === 'all' ||
    subscription.subscription_type?.startsWith(requiredType)
  );

  if (!isAuthorized) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border shadow-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Premium Required</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Upgrade your subscription to access {requiredType || 'premium'} features.
        </p>
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
          View Plans
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
