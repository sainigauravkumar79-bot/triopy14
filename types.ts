export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age?: number;
  premiumStatus: boolean;
  premiumType?: 'monthly' | 'yearly' | 'all';
  currency: 'INR' | 'USD';
  healthScore: number;
  studyStreak: number;
  level: number;
}

export interface Meal {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  confidence?: number;
  timestamp: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  duration: number;
  type: 'cardio' | 'strength' | 'yoga' | 'hiit';
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  category: 'study' | 'fitness';
  createdAt: string;
  completedDates: string[];
  streak: number;
}

export interface Hydration {
  id: string;
  userId: string;
  date: string;
  glasses: number;
}

export interface AIChallenge {
  id: string;
  userId: string;
  title: string;
  category: 'study' | 'health' | 'fitness';
  scope: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  target: number;
  current: number;
  xpReward: number;
  coinsReward: number;
  badgeReward: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface LifeScore {
  userId: string;
  study: number;
  health: number;
  fitness: number;
  overall: number;
  updatedAt: string;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  xp: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}
