import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { supabase } from '../../lib/supabase';
import {
  Dumbbell, Plus, Trash2, Search, Play, Check,
  Clock, Flame, Brain, Activity, Yoga, Moon,
  Sun, Wind, Heart, Music, Filter, Edit, X,
  AlertCircle, CheckCircle
} from 'lucide-react';

interface Exercise {
  id: string;
  user_id: string;
  name: string;
  category: 'cardio' | 'strength' | 'yoga' | 'hiit' | 'flexibility';
  muscle_group: string;
  duration: number;
  calories_burn: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  instructions: string;
  video_url?: string;
  created_at: string;
}

interface Meditation {
  id: string;
  user_id: string;
  name: string;
  type: 'guided' | 'breathing' | 'mantra' | 'mindfulness' | 'body_scan' | 'loving_kindness';
  duration: number;
  benefits: string[];
  instructions: string;
  audio_url?: string;
  created_at: string;
}

export const ExerciseMeditationLibrary: React.FC = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [activeTab, setActiveTab] = useState<'exercises' | 'meditations'>('exercises');
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState<'exercise' | 'meditation'>('exercise');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Exercise form states
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState<'cardio' | 'strength' | 'yoga' | 'hiit' | 'flexibility'>('cardio');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurn, setCaloriesBurn] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [equipmentInput, setEquipmentInput] = useState('');
  const [instructions, setInstructions] = useState('');

  // Meditation form states
  const [meditationName, setMeditationName] = useState('');
  const [meditationType, setMeditationType] = useState<'guided' | 'breathing' | 'mantra' | 'mindfulness' | 'body_scan' | 'loving_kindness'>('guided');
  const [meditationDuration, setMeditationDuration] = useState('');
  const [meditationBenefits, setMeditationBenefits] = useState<string[]>([]);
  const [benefitsInput, setBenefitsInput] = useState('');
  const [meditationInstructions, setMeditationInstructions] = useState('');

  // Meditation timer
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);

  useEffect(() => {
    if (!user) return;
    loadExercises();
    loadMeditations();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMeditating) {
      interval = setInterval(() => {
        setMeditationTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeditating]);

  const loadExercises = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeditations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('meditations')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (!error && data) {
        setMeditations(data);
      }
    } catch (error) {
      console.error('Error loading meditations:', error);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !exerciseName) return;

    setLoading(true);
    setError(null);

    try {
      const exerciseData = {
        user_id: user.id,
        name: exerciseName,
        category: exerciseCategory,
        muscle_group: muscleGroup || 'General',
        duration: parseInt(duration) || 10,
        calories_burn: parseInt(caloriesBurn) || 0,
        difficulty: difficulty,
        equipment: equipment.length > 0 ? equipment : ['None'],
        instructions: instructions || 'Perform as directed',
      };

      const { error } = await supabase
        .from('exercises')
        .insert(exerciseData);

      if (error) throw error;

      setSuccess(`✅ Exercise "${exerciseName}" added successfully!`);
      resetExerciseForm();
      loadExercises();
    } catch (error) {
      console.error('Error adding exercise:', error);
      setError('Failed to add exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeditation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !meditationName) return;

    setLoading(true);
    setError(null);

    try {
      const meditationData = {
        user_id: user.id,
        name: meditationName,
        type: meditationType,
        duration: parseInt(meditationDuration) || 5,
        benefits: meditationBenefits.length > 0 ? meditationBenefits : ['Stress relief', 'Mental clarity'],
        instructions: meditationInstructions || 'Find a quiet place, sit comfortably, and follow the guidance.',
      };

      const { error } = await supabase
        .from('meditations')
        .insert(meditationData);

      if (error) throw error;

      setSuccess(`✅ Meditation "${meditationName}" added successfully!`);
      resetMeditationForm();
      loadMeditations();
    } catch (error) {
      console.error('Error adding meditation:', error);
      setError('Failed to add meditation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;
      setSuccess('✅ Exercise deleted successfully');
      loadExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      setError('Failed to delete exercise');
    }
  };

  const handleDeleteMeditation = async (meditationId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('meditations')
        .delete()
        .eq('id', meditationId);

      if (error) throw error;
      setSuccess('✅ Meditation deleted successfully');
      loadMeditations();
    } catch (error) {
      console.error('Error deleting meditation:', error);
      setError('Failed to delete meditation');
    }
  };

  const addEquipment = () => {
    if (equipmentInput.trim() && !equipment.includes(equipmentInput.trim())) {
      setEquipment([...equipment, equipmentInput.trim()]);
      setEquipmentInput('');
    }
  };

  const removeEquipment = (item: string) => {
    setEquipment(equipment.filter(e => e !== item));
  };

  const addBenefit = () => {
    if (benefitsInput.trim() && !meditationBenefits.includes(benefitsInput.trim())) {
      setMeditationBenefits([...meditationBenefits, benefitsInput.trim()]);
      setBenefitsInput('');
    }
  };

  const removeBenefit = (item: string) => {
    setMeditationBenefits(meditationBenefits.filter(b => b !== item));
  };

  const resetExerciseForm = () => {
    setExerciseName('');
    setExerciseCategory('cardio');
    setMuscleGroup('');
    setDuration('');
    setCaloriesBurn('');
    setDifficulty('beginner');
    setEquipment([]);
    setEquipmentInput('');
    setInstructions('');
    setIsAdding(false);
  };

  const resetMeditationForm = () => {
    setMeditationName('');
    setMeditationType('guided');
    setMeditationDuration('');
    setMeditationBenefits([]);
    setBenefitsInput('');
    setMeditationInstructions('');
    setIsAdding(false);
  };

  const startMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setMeditationTimer(0);
    setIsMeditating(true);
  };

  const stopMeditation = () => {
    setIsMeditating(false);
    setSelectedMeditation(null);
    setMeditationTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryColors = {
    cardio: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    strength: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    yoga: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    hiit: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
    flexibility: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  };

  const meditationTypeIcons = {
    guided: <Music size={16} />,
    breathing: <Wind size={16} />,
    mantra: <Moon size={16} />,
    mindfulness: <Brain size={16} />,
    body_scan: <Activity size={16} />,
    loving_kindness: <Heart size={16} />,
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exercise.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Dumbbell className="text-purple-600 dark:text-purple-400" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exercise & Meditation Library</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Custom exercise library + meditation sessions</p>
          </div>
        </div>
        <button
          onClick={() => { setIsAdding(true); setAddType('exercise'); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'exercises'
              ? 'bg-purple-600 text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Dumbbell size={14} className="inline mr-1" /> Exercises
        </button>
        <button
          onClick={() => setActiveTab('meditations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'meditations'
              ? 'bg-purple-600 text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Brain size={14} className="inline mr-1" /> Meditations
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="cardio">Cardio</option>
          <option value="strength">Strength</option>
          <option value="yoga">Yoga</option>
          <option value="hiit">HIIT</option>
          <option value="flexibility">Flexibility</option>
        </select>
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

      {/* Exercise List */}
      {activeTab === 'exercises' && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No exercises found. Add your first exercise!
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <div key={exercise.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 dark:text-white">{exercise.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${categoryColors[exercise.category]}`}>
                        {exercise.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                        exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>💪 {exercise.muscle_group}</span>
                      <span>⏱ {exercise.duration} min</span>
                      <span>🔥 {exercise.calories_burn} kcal</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      {exercise.instructions}
                    </div>
                    {exercise.equipment && exercise.equipment.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exercise.equipment.map((eq, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-[10px] text-gray-600 dark:text-gray-300">
                            {eq}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Meditation List */}
      {activeTab === 'meditations' && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {meditations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No meditations added. Add your first meditation session!
            </div>
          ) : (
            meditations.map((meditation) => (
              <div key={meditation.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 dark:text-white">{meditation.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 capitalize">
                        {meditation.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>⏱ {meditation.duration} min</span>
                      <span>🧘 Benefits: {meditation.benefits?.join(', ')}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      {meditation.instructions}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isMeditating && selectedMeditation?.id === meditation.id ? (
                      <button
                        onClick={stopMeditation}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <span>Stop {formatTime(meditationTimer)}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startMeditation(meditation)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                        disabled={isMeditating}
                      >
                        <Play size={14} /> Start
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMeditation(meditation.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {isMeditating && selectedMeditation && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border-2 border-indigo-400 text-center">
              <div className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">{formatTime(meditationTimer)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Currently: {selectedMeditation.name}</div>
              <button
                onClick={stopMeditation}
                className
