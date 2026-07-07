import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';
import { Habit } from '../../types';
import {
  Plus,
  Trash2,
  Flame,
  Check,
  BookOpen,
  Dumbbell,
  Calendar,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHabits } from '../../hooks/useHabits';

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: getLocalDateString(d),
      narrowLabel: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      shortLabel: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
};

const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completedDates)).sort().reverse();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = getLocalDateString(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
    return 0;
  }

  let currentStreak = 0;
  const checkDate = uniqueDates.includes(todayStr) ? new Date(today) : new Date(yesterday);

  while (true) {
    const checkStr = getLocalDateString(checkDate);
    if (uniqueDates.includes(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return currentStreak;
};

export const DailyHabits: React.FC = () => {
  const { user } = useAuth();
  const { habits, loading } = useHabits();
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'study' | 'fitness'>('study');

  const todayStr = getLocalDateString(new Date());
  const pastDays = getPast7Days();

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    try {
      setError(null);
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: name.trim(),
        category,
        created_at: new Date(),
        completed_dates: [],
        streak: 0,
      });
      if (error) throw error;
      setName('');
      setIsAdding(false);
    } catch (err: any) {
      console.error("Error creating habit:", err);
      setError("Failed to create habit.");
    }
  };

  const handleToggleHabitDay = async (habit: Habit, targetDateStr: string) => {
    if (!user) return;

    try {
      let updatedDates = [...habit.completedDates];
      if (updatedDates.includes(targetDateStr)) {
        updatedDates = updatedDates.filter(d => d !== targetDateStr);
      } else {
        updatedDates.push(targetDateStr);
      }

      const newStreak = calculateStreak(updatedDates);

      const { error } = await supabase.from('habits').update({
        completed_dates: updatedDates,
        streak: newStreak
      }).eq('id', habit.id);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error toggling habit day:", err);
      setError("Failed to update habit progress.");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('habits').delete().eq('id', habitId);
      if (error) throw error;
    } catch (err: any) {
      console.error("Error deleting habit:", err);
      setError("Failed to delete habit.");
    }
  };

  const completedTodayCount = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalHabits = habits.length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Habit Tracker</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Log your study & fitness routines</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl text-sm font-medium transition-all"
        >
          <Plus size={16} />
          <span>Add Habit</span>
        </button>
      </div>

      {totalHabits > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Today's Progress</span>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                {completedTodayCount} of {totalHabits} habits completed
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{completionPercentage}%</span>
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm border border-red-100 dark:border-red-900/30">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreateHabit}
            className="mb-6 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20 overflow-hidden space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Habit Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., LeetCode daily practice, 30 min Jogging"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCategory('study')}
                  className={`py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border transition-all ${category === 'study'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                >
                  <BookOpen size={16} />
                  <span>Study</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('fitness')}
                  className={`py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border transition-all ${category === 'fitness'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                >
                  <Dumbbell size={16} />
                  <span>Fitness</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-650 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/10 transition-all"
              >
                Create Habit
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Loading your habits...
        </div>
      ) : habits.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
          <div className="max-w-xs mx-auto space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No habits added yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Track and reinforce your study & fitness rituals by creating your first habit!</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/10"
            >
              <Plus size={14} />
              <span>Create First Habit</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const isCompletedToday = habit.completedDates.includes(todayStr);
            const isStudy = habit.category === 'study';

            return (
              <div
                key={habit.id}
                className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/25 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleHabitDay(habit, todayStr)}
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isCompletedToday
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400'
                        }`}
                    >
                      {isCompletedToday && <Check size={14} strokeWidth={3} />}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold truncate ${isCompletedToday ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                          {habit.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0 ${isStudy
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          }`}>
                          {habit.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-lg shrink-0">
                          <Flame size={12} fill="currentColor" />
                          <span>{habit.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-center sm:self-auto shrink-0 bg-white dark:bg-gray-900/30 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    {pastDays.map((day) => {
                      const isDone = habit.completedDates.includes(day.dateStr);
                      return (
                        <button
                          key={day.dateStr}
                          onClick={() => handleToggleHabitDay(habit, day.dateStr)}
                          title={`${day.shortLabel} ${day.dayNum} - ${isDone ? 'Completed' : 'Missed'}`}
                          className={`flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${day.isToday ? 'ring-1 ring-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/10' : ''
                            }`}
                        >
                          <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                            {day.narrowLabel}
                          </span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${isDone
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}>
                            {day.isToday && !isDone ? '•' : isDone ? '✓' : day.dayNum}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Habit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
