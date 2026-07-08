import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { PremiumGuard } from './PremiumGuard';
import { DailyMotivation } from './DailyMotivation';
import { DailyQuests } from './gamification/DailyQuests';
import { HealthJournal } from './journal/HealthJournal';
import { QuestTrends } from './gamification/QuestTrends';
import { Badges } from './gamification/Badges';
import { CommunityLeaderboard } from './gamification/CommunityLeaderboard';
import { GoalTracker } from './journal/GoalTracker';
import { StreakCounter } from './gamification/StreakCounter';
import { ChallengeRoom } from './gamification/ChallengeRoom';
import { DailyHabits } from './habits/DailyHabits';
import { HabitTrendChart } from './habits/HabitTrendChart';
import { WaterTracker } from './health/WaterTracker';
import { DataExport } from './DataExport';
import { SmartScheduler } from './goals/SmartScheduler';
import { ThemeSwitcher } from './ThemeSwitcher';
import { SpeechReminder } from './SpeechReminder';
import { useHabits } from '../hooks/useHabits';
import { LifeScore } from './LifeScore';
import { AIChallengeEngine } from './AIChallengeEngine';
import { FriendChallenges } from './FriendChallenges';
import { RealTimeCameraAI } from './RealTimeCameraAI';
import { supabase } from '../lib/supabase';

// ============================================
// HEALTH MODULE – Directly Embedded
// ============================================
const HealthModule: React.FC = () => {
  const BMICalculator = () => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [category, setCategory] = useState<string>('');

    const calculateBMI = () => {
      const w = parseFloat(weight);
      const h = parseFloat(height) / 100;
      if (w > 0 && h > 0) {
        const result = parseFloat((w / (h * h)).toFixed(1));
        setBmi(result);
        if (result < 18.5) setCategory('Underweight');
        else if (result < 25) setCategory('Normal weight');
        else if (result < 30) setCategory('Overweight');
        else setCategory('Obese');
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-indigo-600 text-2xl">📊</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BMI Calculator</h3>
        </div>
        <div className="space-y-3">
          <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white" />
          <input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white" />
          <button onClick={calculateBMI} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold">Calculate</button>
          {bmi !== null && (
            <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{bmi}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{category}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BMICalculator />
      <WaterTracker />
    </div>
  );
};

// ============================================
// FITNESS MODULE – Directly Embedded
// ============================================
const FitnessModule: React.FC = () => {
  const WorkoutTracker = () => {
    const { user } = useAuth();
    const [workout, setWorkout] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogWorkout = async () => {
      if (!user || !workout.trim() || !duration) return;
      setLoading(true);
      try {
        await supabase.from('workouts').insert({ user_id: user.id, name: workout, duration: parseInt(duration), type: 'cardio', created_at: new Date() });
        alert('Workout logged!');
        setWorkout(''); setDuration('');
      } catch (error) { alert('Failed to log workout.'); } finally { setLoading(false); }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4"><span className="text-purple-600 text-2xl">🏋️</span><h3 className="text-lg font-semibold">Workout Tracker</h3></div>
        <input type="text" placeholder="Enter workout" value={workout} onChange={(e) => setWorkout(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white mb-3" />
        <input type="number" placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white mb-3" />
        <button onClick={handleLogWorkout} disabled={loading} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50">{loading ? 'Logging...' : 'Log Workout'}</button>
      </div>
    );
  };

  const StepTracker = () => {
    const [steps, setSteps] = useState(0);
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4"><span className="text-orange-500 text-2xl">👣</span><h3 className="text-lg font-semibold">Step Tracker</h3></div>
        <div className="text-center mb-4"><p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{steps}</p></div>
        <button onClick={() => setSteps(s => s + 500)} className="w-full py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-xl font-semibold">+500 steps</button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <WorkoutTracker />
      <StepTracker />
    </div>
  );
};

// ============================================
// STUDY MODULE – Directly Embedded
// ============================================
const StudyModule: React.FC = () => {
  const { user } = useAuth();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const PomodoroTimer = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isActive) {
        if (minutes === 0 && seconds === 0) { setIsActive(false); return; }
        interval = setInterval(() => {
          if (seconds === 0) { setMinutes(m => m - 1); setSeconds(59); } else { setSeconds(s => s - 1); }
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isActive, minutes, seconds]);

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4"><span className="text-teal-600 text-2xl">⏱️</span><h3 className="text-lg font-semibold">Pomodoro Timer</h3></div>
        <div className="text-center mb-4"><p className="text-4xl font-bold text-teal-600">{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</p></div>
        <button onClick={() => setIsActive(!isActive)} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold">{isActive ? 'Pause' : 'Start'}</button>
      </div>
    );
  };

  const StudyLogger = () => {
    const [subject, setSubject] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLog = async () => {
      if (!user || !subject.trim() || !duration) return;
      setLoading(true);
      try {
        await supabase.from('study_sessions').insert({ user_id: user.id, subject, duration: parseInt(duration), timestamp: new Date() });
        alert('Session logged!');
        setSubject(''); setDuration('');
      } catch (error) { alert('Failed to log session.'); } finally { setLoading(false); }
    };
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4"><span className="text-teal-600 text-2xl">📚</span><h3 className="text-lg font-semibold">Study Logger</h3></div>
        <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white mb-3" />
        <input type="number" placeholder="Duration (min)" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white mb-3" />
        <button onClick={handleLog} disabled={loading} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold disabled:opacity-50">{loading ? 'Logging...' : 'Log Session'}</button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="text-sm text-purple-600 hover:underline">View Study History</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PomodoroTimer />
        <StudyLogger />
      </div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD
// ============================================
export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { habits } = useHabits();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hello, {user?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back to Triopy.</p>
        </div>
        <div className="flex gap-2 items-center">
          <SpeechReminder />
          <ThemeSwitcher />
        </div>
      </header>

      <DailyMotivation />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Premium Status</h2>
          <p className="text-sm text-gray-500">Active Pro Account</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Live Health Engine</h2>
          <p className="text-sm text-emerald-600 font-bold">Synced & Active</p>
        </div>
        <StreakCounter />
      </div>

      <div className="space-y-6">
        <LifeScore />
        <RealTimeCameraAI />
        <AIChallengeEngine />
        <FriendChallenges />
        <HabitTrendChart habits={habits} />
        <WaterTracker />
        <DailyHabits />
        <ChallengeRoom />
        <DataExport />
        <SmartScheduler />
        <GoalTracker />
        <Badges />
        <CommunityLeaderboard />
        <HealthJournal />
        <QuestTrends />
        <DailyQuests />
        <PremiumGuard requiredType="health"><HealthModule /></PremiumGuard>
        <PremiumGuard requiredType="fitness"><FitnessModule /></PremiumGuard>
        <PremiumGuard requiredType="study"><StudyModule /></PremiumGuard>
      </div>
    </div>
  );
};
