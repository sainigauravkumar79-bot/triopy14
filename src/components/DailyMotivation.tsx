import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export const DailyMotivation: React.FC = () => {
  const [quote, setQuote] = useState<string>('Loading inspiration...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quote')
      .then(res => res.json())
      .then(data => {
        setQuote(data.quote);
        setLoading(false);
      })
      .catch(() => {
        setQuote('Stay positive and keep going!');
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-3xl shadow-sm text-white mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-yellow-300" size={24} />
        <h3 className="text-lg font-semibold">Daily Motivation</h3>
      </div>
      <p className="text-lg italic">{loading ? '...' : quote}</p>
    </div>
  );
};
