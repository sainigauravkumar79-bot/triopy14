import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';
import { Activity, BookOpen, Heart, Flame, Plus, CheckCircle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface LifeScores {
  study: number;
  health: number;
  fitness: number;
  overall: number;
}

interface ScoreHistory {
  date: string;
  study: number;
  health: number;
  fitness: number;
  overall: number;
}

export const LifeScore: React.FC = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<LifeScores>({ study: 50, health: 50, fitness: 50, overall: 50 });
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadScores();
    loadHistory();
  }, [user]);

  const loadScores = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('life_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', 'current')
        .single();
        
      if (!error && data) {
        setScores(data as LifeScores);
      } else {
        const initial = { study: 50, health: 50, fitness: 50, overall: 50 };
        await supabase.from('life_scores').insert({
            user_id: user.id,
            id: 'current',
            ...initial
        });
        setScores(initial);
      }
    } catch (error) {
      console.error('Error loading scores:', error);
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('life_scores_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(7);
      
      if (!error && data) {
        const historyData = data.map(item => ({
            date: item.date || new Date(item.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
            study: item.study,
            health: item.health,
            fitness: item.fitness,
            overall: item.overall,
        }));
        
        if (historyData.length < 3) {
            setHistory([
                { date: 'Mon', study: 40, health: 60, fitness: 55, overall: 51 },
                { date: 'Tue', study: 45, health: 62, fitness: 58, overall: 55 },
                { date: 'Wed', study: 50, health: 65, fitness: 52, overall: 56 },
                { date: 'Thu', study: 52, health: 61, fitness: 60, overall: 58 },
                { date: 'Fri', study: 48, health: 68, fitness: 64, overall: 60 },
                { date: 'Sat', study: scores.study, health: scores.health, fitness: scores.fitness, overall: scores.overall },
            ]);
        } else {
            setHistory(historyData.reverse());
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const updateScore = async (type: 'study' | 'health' | 'fitness', delta: number, activityName: string) => {
    if (!user) return;
    
    const newScores = { ...scores };
    newScores[type] = Math.min(100, Math.max(0, newScores[type] + delta));
    newScores.overall = Math.round((newScores.study + newScores.health + newScores.fitness) / 3);
    
    setScores(newScores);
    setMessage(`+${delta} to ${type.toUpperCase()} Score for: ${activityName}!`);
    setTimeout(() => setMessage(null), 3000);

    try {
      await supabase.from('life_scores').upsert({
        user_id: user.id,
        id: 'current',
        ...newScores
      }, { onConflict: 'user_id,id' });

      const todayStr = new Date().toLocaleDateString(undefined, { weekday: 'short' });
      await supabase.from('life_scores_history').insert({
        user_id: user.id,
        study: newScores.study,
        health: newScores.health,
        fitness: newScores.fitness,
        overall: newScores.overall,
        date: todayStr,
        activity: activityName,
        timestamp: new Date().toISOString(),
      });

      loadHistory();
    } catch (error) {
      console.error('Error saving updated scores:', error);
    }
  };

  return (
    <div id="life-score-module" className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="text-pink-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Life Score Engine</h2>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTimeframe(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedTimeframe === t
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle size={16} />
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center">
        <div className="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
          <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" fill="transparent" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" className="text-indigo-600" fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - scores.overall / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{scores.overall}</span>
          </div>
          <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Overall Life Score</span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">Weighted Average</span>
        </div>

        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" fill="transparent" />
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-purple-500" fill="transparent"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - scores.study / 100)}
                strokeLinecap="round"
              />
            </svg>
            <BookOpen className="absolute text-purple-200 dark:text-purple-900" size={24} />
            <span className="absolute text-base font-bold text-purple-700 dark:text-purple-300">{scores.study}</span>
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Study Score</span>
        </div>

        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" fill="transparent" />
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-emerald-500" fill="transparent"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - scores.health / 100)}
                strokeLinecap="round"
              />
            </svg>
            <Heart className="absolute text-emerald-200 dark:text-emerald-900" size={24} />
            <span className="absolute text-base font-bold text-emerald-700 dark:text-emerald-300">{scores.health}</span>
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Health Score</span>
        </div>

        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" fill="transparent" />
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-orange-500" fill="transparent"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - scores.fitness / 100)}
                strokeLinecap="round"
              />
            </svg>
            <Flame className="absolute text-orange-200 dark:text-orange-900" size={24} />
            <span className="absolute text-base font-bold text-orange-700 dark:text-orange-300">{scores.fitness}</span>
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fitness Score</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Plus size={14} /> Log Quick Activities to Earn Scores
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => updateScore('study', 8, 'Completed 25-min Study Block')}
            className="p-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-300 rounded-2xl text-left text-xs font-semibold border border-purple-100 dark:border-purple-900/30 flex justify-between items-center transition-all group"
          >
            <span>📚 Complete 25-min Study Block</span>
            <span className="bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full text-[10px] group-hover:scale-110 transition-transform">+8 Study</span>
          </button>
          <button
            onClick={() => updateScore('health', 5, 'Drank 250ml Water')}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-left text-xs font-semibold border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center transition-all group"
          >
            <span>💧 Drink 250ml Water</span>
            <span className="bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full text-[10px] group-hover:scale-110 transition-transform">+5 Health</span>
          </button>
          <button
            onClick={() => updateScore('fitness', 10, 'Completed a 30-min Workout')}
            className="p-3 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/30 text-orange-700 dark:text-orange-300 rounded-2xl text-left text-xs font-semibold border border-orange-100 dark:border-orange-900/30 flex justify-between items-center transition-all group"
          >
            <span>🏃‍♂️ Log 30-min Workout</span>
            <span className="bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full text-[10px] group-hover:scale-110 transition-transform">+10 Fit</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
          <TrendingUp size={14} /> Progress Over Time
        </h3>
        <div className="h-48 w-full bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-2 border border-gray-100 dark:border-gray-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#9CA3AF" style={{ fontSize: '10px' }} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} stroke="#9CA3AF" style={{ fontSize: '10px' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', background: '#fff', border: '1px solid #eee' }} />
              <Line type="monotone" dataKey="overall" name="Overall" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="study" name="Study" stroke="#8B5CF6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="health" name="Health" stroke="#10B981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="fitness" name="Fitness" stroke="#F97316" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
