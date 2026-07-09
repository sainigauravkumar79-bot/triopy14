import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { supabase } from '../../lib/supabase';
import { 
  Utensils, Camera, Plus, Trash2, Clock, Bell, 
  Calendar, Flame, Apple, Coffee, AlertCircle, CheckCircle,
  Upload, X, Edit, Save
} from 'lucide-react';

interface Meal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  scheduled_time: string;
  image_url?: string;
  created_at: string;
}

interface MealReminder {
  id: string;
  user_id: string;
  meal_id: string;
  reminder_time: string;
  is_active: boolean;
}

export const SmartMealPlanner: React.FC = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [reminders, setReminders] = useState<MealReminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mealImage, setMealImage] = useState<string | null>(null);
  const [setReminder, setSetReminder] = useState(true);

  // AI Recommendation states
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [generatingRecommendation, setGeneratingRecommendation] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(2000);

  // User profile for calorie goals
  const [userWeight, setUserWeight] = useState('');
  const [userHeight, setUserHeight] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userGender, setUserGender] = useState('male');

  useEffect(() => {
    if (!user) return;
    loadMeals();
    loadReminders();
    loadUserProfile();
    checkMealTimes();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('age, weight, height, gender')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        if (data.weight) setUserWeight(data.weight);
        if (data.height) setUserHeight(data.height);
        if (data.age) setUserAge(data.age);
        if (data.gender) setUserGender(data.gender);
        
        // Calculate BMR and calorie goal
        calculateCalorieGoal(data.weight, data.height, data.age, data.gender);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const calculateCalorieGoal = (weight: number, height: number, age: number, gender: string) => {
    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    // Sedentary multiplier
    const maintenance = Math.round(bmr * 1.2);
    setCalorieGoal(maintenance);
  };

  const loadMeals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error('Error loading meals:', error);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('meal_reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (!error && data) {
        setReminders(data);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const checkMealTimes = () => {
    // Check if any meal reminder should trigger
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      reminders.forEach(reminder => {
        const reminderTime = new Date(reminder.reminder_time);
        const reminderMinutes = reminderTime.getHours() * 60 + reminderTime.getMinutes();
        
        if (Math.abs(currentTime - reminderMinutes) <= 5) {
          // Trigger notification
          const meal = meals.find(m => m.id === reminder.meal_id);
          if (meal) {
            sendNotification(`⏰ Time to eat: ${meal.name}`, `Your scheduled meal is ready. Calories: ${meal.calories} kcal`);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  };

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window) {
      Notification.requestPermission();
    }
    // Also show in-app alert
    setSuccess(`${title} - ${body}`);
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mealName || !calories) return;

    setLoading(true);
    setError(null);

    try {
      const mealData = {
        user_id: user.id,
        name: mealName,
        calories: parseInt(calories),
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
        meal_type: mealType,
        scheduled_time: scheduledTime || new Date().toISOString(),
        image_url: mealImage,
      };

      const { data, error } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();

      if (error) throw error;

      // If reminder is enabled, create reminder
      if (setReminder && scheduledTime) {
        await supabase
          .from('meal_reminders')
          .insert({
            user_id: user.id,
            meal_id: data.id,
            reminder_time: scheduledTime,
            is_active: true
          });
      }

      setSuccess(`✅ Meal "${mealName}" added successfully!`);
      resetForm();
      loadMeals();
      loadReminders();
    } catch (error) {
      console.error('Error adding meal:', error);
      setError('Failed to add meal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      // Delete reminders first
      await supabase
        .from('meal_reminders')
        .delete()
        .eq('meal_id', mealId);

      // Delete meal
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
      setSuccess('✅ Meal deleted successfully');
      loadMeals();
      loadReminders();
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMealImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setMealName('');
    setMealType('breakfast');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setScheduledTime('');
    setMealImage(null);
    setIsAdding(false);
    setAiRecommendation(null);
  };

  // AI Recommendation
  const generateRecommendation = async () => {
    setGeneratingRecommendation(true);
    try {
      const prompt = `Based on the user's details (Age: ${userAge || 'N/A'}, Gender: ${userGender || 'N/A'}, Weight: ${userWeight || 'N/A'} kg, Height: ${userHeight || 'N/A'} cm) and calorie goal (${calorieGoal} kcal/day), suggest a daily meal plan with 3 meals (breakfast, lunch, dinner) and 2 snacks. Include food names, approximate calories, and timing. Keep it practical and healthy.`;

      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setAiRecommendation(data.plan || 'Check your internet connection. Here\'s a sample plan:\n\nBreakfast (8 AM): Oatmeal with fruits - 350 kcal\nLunch (1 PM): Grilled chicken salad - 450 kcal\nSnack (4 PM): Greek yogurt - 150 kcal\nDinner (7 PM): Salmon with veggies - 500 kcal\nSnack (9 PM): Almonds - 100 kcal');
    } catch (error) {
      setAiRecommendation('Breakfast (8 AM): Oatmeal with fruits - 350 kcal\nLunch (1 PM): Grilled chicken salad - 450 kcal\nSnack (4 PM): Greek yogurt - 150 kcal\nDinner (7 PM): Salmon with veggies - 500 kcal\nSnack (9 PM): Almonds - 100 kcal');
    } finally {
      setGeneratingRecommendation(false);
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = calorieGoal - totalCalories;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Utensils className="text-emerald-600 dark:text-emerald-400" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Meal Planner</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Plan meals, track calories, get reminders</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Plus size={16} /> Add Meal
        </button>
      </div>

      {/* Calorie Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Daily Goal</div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{calorieGoal} kcal</div>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Meals</div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{meals.length}</div>
        </div>
        <div className={`p-4 rounded-xl text-center ${remainingCalories >= 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
          <div className="text-xs text-gray-500 dark:text-gray-400">Remaining</div>
          <div className={`text-xl font-bold ${remainingCalories >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {remainingCalories} kcal
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="mb-6">
        <button
          onClick={generateRecommendation}
          disabled={generatingRecommendation}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
        >
          {generatingRecommendation ? 'Generating...' : '💡 Get AI Meal Recommendation'}
        </button>
        {aiRecommendation && (
          <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/30 whitespace-pre-line text-sm">
            {aiRecommendation}
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Meals List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {meals.map((meal) => (
          <div key={meal.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 flex-1">
              {meal.image_url ? (
                <img src={meal.image_url} alt={meal.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Apple className="text-emerald-600 dark:text-emerald-400" size={20} />
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-gray-800 dark:text-white">{meal.name}</div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="capitalize">{meal.meal_type}</span>
                  <span>🔥 {meal.calories} kcal</span>
                  <span>💪 {meal.protein || 0}g protein</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {meal.scheduled_time && (
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(meal.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <button
                onClick={() => handleDeleteMeal(meal.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Meal Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Meal</h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Meal Name</label>
                <input
                  type="text"
                  required
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., Chicken Salad, Oatmeal"
                  className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Schedule Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Calories</label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="e.g., 350"
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="e.g., 25"
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="e.g., 45"
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Fat (g)</label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="e.g., 12"
                    className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Meal Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="mealImage"
                  />
                  <label htmlFor="mealImage" className="flex-1 p-3 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-c
