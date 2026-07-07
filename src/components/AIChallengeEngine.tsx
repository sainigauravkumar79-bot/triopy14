import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { Sparkles, Trophy, Plus, Trash2, Play, Pause, CheckCircle2, RefreshCw, X, Edit, Zap } from 'lucide-react';

interface AIChallenge {
  id: string;
  title: string;
  category: 'study' | 'health' | 'fitness';
  scope: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  target: number;
  current: number;
  xp_reward: number;
  coins_reward: number;
  badge_reward: string;
  status: 'active' | 'paused' | 'completed';
  user_id: string;
}

export const AIChallengeEngine: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<AIChallenge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'study' | 'health' | 'fitness'>('study');
  const [scope, setScope] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [target, setTarget] = useState(5);
  const [xpReward, setXpReward] = useState(100);
  const [coinsReward, setCoinsReward] = useState(25);
  const [badgeReward, setBadgeReward] = useState('Novice Champion');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_challenges')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setChallenges(data as AIChallenge[]);
      } else {
        const initialChallenges = [
          {
            user_id: user.id,
            title: 'Hydration Sprint - 8 Glasses',
            category: 'health',
            scope: 'Daily',
            target: 8,
            current: 3,
            xp_reward: 120,
            coins_reward: 30,
            badge_reward: 'Water Master',
            status: 'active',
          },
          {
            user_id: user.id,
            title: 'Study Focus: 120 Mins',
            category: 'study',
            scope: 'Daily',
            target: 120,
            current: 60,
            xp_reward: 200,
            coins_reward: 50,
            badge_reward: 'Focus Legend',
            status: 'active',
          },
        ];

        for (const challenge of initialChallenges) {
          const { data, error } = await supabase
            .from('ai_challenges')
            .insert(challenge)
            .select()
            .single();

          if (!error && data) {
            setChallenges(prev => [...prev, data as AIChallenge]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading AI challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const data = {
      user_id: user.id,
      title,
      category,
      scope,
      target: Number(target),
      current: isEdit ? challenges.find(c => c.id === editId)?.current || 0 : 0,
      xp_reward: Number(xpReward),
      coins_reward: Number(coinsReward),
      badge_reward: badgeReward,
      status: isEdit ? challenges.find(c => c.id === editId)?.status || 'active' : 'active',
    };

    try {
      if (isEdit && editId) {
        const { error } = await supabase
          .from('ai_challenges')
          .update(data)
          .eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_challenges')
          .insert(data);
        if (error) throw error;
      }
      resetForm();
      loadChallenges();
    } catch (error) {
      console.error('Error saving challenge:', error);
      alert('Failed to save challenge. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('study');
    setScope('Daily');
    setTarget(5);
    setXpReward(100);
    setCoinsReward(25);
    setBadgeReward('Novice Champion');
    setIsModalOpen(false);
    setIsEdit(false);
    setEditId(null);
  };

  const handleEdit = (challenge: AIChallenge) => {
    setIsEdit(true);
    setEditId(challenge.id);
    setTitle(challenge.title);
    setCategory(challenge.category);
    setScope(challenge.scope);
    setTarget(challenge.target);
    setXpReward(challenge.xp_reward);
    setCoinsReward(challenge.coins_reward);
    setBadgeReward(challenge.badge_reward);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('ai_challenges')
        .delete()
        .eq('id', id);
      if (error) throw error;
      loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge.');
    }
  };

  const handleToggleStatus = async (challenge: AIChallenge) => {
    if (!user) return;
    const newStatus = challenge.status === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase
        .from('ai_challenges')
        .update({ status: newStatus })
        .eq('id', challenge.id);
      if (error) throw error;
      loadChallenges();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleIncrementProgress = async (challenge: AIChallenge) => {
    if (!user) return;
    const newCurrent = Math.min(challenge.target, challenge.current + 1);
    const isCompleted = newCurrent >= challenge.target;

    try {
      const updates: any = { current: newCurrent };
      if (isCompleted) {
        updates.status = 'completed';
        alert(`🏆 Challenge Completed! You earned:\n+${challenge.xp_reward} XP\n+${challenge.coins_reward} Coins\nBadge unlocked: "${challenge.badge_reward}"!`);

        const { data: statsData } = await supabase
          .from('stats')
          .select('total_xp, coins, badges, streak')
          .eq('user_id', user.id)
          .eq('id', 'main')
          .single();

        let totalXP = challenge.xp_reward;
        let totalCoins = challenge.coins_reward;
        let badges = [challenge.badge_reward];
        let streak = 1;

        if (statsData) {
          totalXP += statsData.total_xp || 0;
          totalCoins += statsData.coins || 0;
          badges = Array.from(new Set([...(statsData.badges || []), challenge.badge_reward]));
          streak = (statsData.streak || 0) + 1;
        }

        await supabase
          .from('stats')
          .upsert({
            user_id: user.id,
            id: 'main',
            total_xp: totalXP,
            coins: totalCoins,
            badges,
            streak,
            last_updated: new Date().toISOString()
          });

        const { data: lifeData } = await supabase
          .from('life_scores')
          .select('*')
          .eq('user_id', user.id)
          .eq('id', 'current')
          .single();

        if (lifeData) {
          const categoryKey = challenge.category;
          const updatedCat = Math.min(100, (lifeData[categoryKey] || 50) + 10);
          const newOverall = Math.round((updatedCat + (lifeData.study || 50) + (lifeData.health || 50) + (lifeData.fitness || 50)) / 3);
          await supabase
            .from('life_scores')
            .upsert({
              user_id: user.id,
              id: 'current',
              ...lifeData,
              [categoryKey]: updatedCat,
              overall: newOverall
            });
        }
      }

      const { error } = await supabase
        .from('ai_challenges')
        .update(updates)
        .eq('id', challenge.id);

      if (error) throw error;
      loadChallenges();
    } catch (error) {
      console.error('Error incrementing progress:', error);
    }
  };

  const handleAIGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const categories: ('study' | 'health' | 'fitness')[] = ['study', 'health', 'fitness'];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];

      let aiTitle = '';
      let aiTarget = 10;
      let rewardXP = 150;
      let badge = 'Novice AI';

      if (randomCat === 'study') {
        const topics = ['Algebra Prep', 'Physics Quick revision', 'Vocabulary Builder', 'Technical Reading', 'Mock Practice Code'];
        aiTitle = `AI: Focus on ${topics[Math.floor(Math.random() * topics.length)]} for 45 Mins`;
        aiTarget = 45;
        rewardXP = 180;
        badge = 'Brain Power';
      } else if (randomCat === 'health') {
        const goals = ['Deep Sleep Routine', 'Mindful Eating tracker', 'No Sugar Snacks', 'Correct Sitting Posture Monitor'];
        aiTitle = `AI: Complete ${goals[Math.floor(Math.random() * goals.length)]}`;
        aiTarget = 1;
        rewardXP = 130;
        badge = 'Aura Cleanse';
      } else {
        const movements = ['Squats Streak', 'Burpees Sprint', 'Outdoor jogging', 'Isometric Planks duration'];
        aiTitle = `AI: Perform ${movements[Math.floor(Math.random() * movements.length)]} Daily`;
        aiTarget = 15;
        rewardXP = 160;
        badge = 'Kinetic Master';
      }

      const newChallenge = {
        user_id: user.id,
        title: aiTitle,
        category: randomCat,
        scope: 'Daily',
        target: aiTarget,
        current: 0,
        xp_reward: rewardXP,
        coins_reward: 40,
        badge_reward: badge,
        status: 'active',
      };

      const { error } = await supabase
        .from('ai_challenges')
        .insert(newChallenge);

      if (error) throw error;
      loadChallenges();
      alert(`✨ Smart AI Challenge created! "${aiTitle}"`);
    } catch (error) {
      console.error('Error generating AI challenge:', error);
      alert('Failed to generate AI challenge. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Loading challenges...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-yellow-500 animate-pulse" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Challenge Engine</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Personalized gamification tasks based on your lifestyle profile.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'AI Generate'}
          </button>
          <button
            onClick={() => { setIsEdit(false); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Plus size={14} /> Add Custom
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((c) => {
          const categoryColors = {
            study: 'bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-300',
            health: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300',
            fitness: 'bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-300',
          };

          const progressPercent = Math.min(100, Math.round((c.current / c.target) * 100));

          return (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                c.status === 'completed'
                  ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-70'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${categoryColors[c.category]}`}>
                    {c.category} • {c.scope}
                  </span>
                  <div className="flex gap-1.5">
                    {c.status !== 'completed' && (
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                        title={c.status === 'active' ? 'Pause Challenge' : 'Resume Challenge'}
                      >
                        {c.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-3">{c.title}</h3>

                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>Progress: {c.current} / {c.target}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        c.category === 'study' ? 'bg-purple-600' : c.category === 'health' ? 'bg-emerald-600' : 'bg-orange-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700/60">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-xs text-yellow-600 font-bold" title="XP Reward">
                    <Zap size={12} />
                    <span>{c.xp_reward} XP</span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold" title="Coins Reward">
                    <Trophy size={12} />
                    <span>{c.coins_reward}c</span>
                  </div>
                </div>

                {c.status === 'completed' ? (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={14} /> Completed
                  </div>
                ) : (
                  <button
                    onClick={() => handleIncrementProgress(c)}
                    disabled={c.status === 'paused'}
                    className="px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    + Progress
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-md border border-gray-100 dark:border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Edit AI Challenge' : 'Add Custom Challenge'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Read 15 pages / Do 50 pushups"
                  className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="study">Study</option>
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Target Count</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Badge Reward</label>
                  <input
                    type="text"
                    required
                    value={badgeReward}
                    onChange={(e) => setBadgeReward(e.target.value)}
                    placeholder="e.g. Cardio Star"
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">XP Reward</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Coins Reward</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={coinsReward}
                    onChange={(e) => setCoinsReward(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-white rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors"
                >
                  {isEdit ? 'Save Changes' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
