import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { supabase } from '../../lib/supabase';
import {
  Stethoscope, AlertTriangle, CheckCircle, Clock,
  Heart, Brain, Lungs, Activity, Search, Send,
  Loader2, User, Calendar, Home, Phone, Video,
  X, AlertCircle
} from 'lucide-react';

interface SymptomAnalysis {
  id: string;
  user_id: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  possible_conditions: string[];
  home_remedies: string[];
  doctor_advice: string;
  emergency: boolean;
  created_at: string;
}

export const HealthSymptomAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SymptomAnalysis | null>(null);
  const [history, setHistory] = useState<SymptomAnalysis[]>([]);

  // Form states
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userGender, setUserGender] = useState('male');
  const [userWeight, setUserWeight] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const analyzeSymptoms = async () => {
    if (!user || symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prompt = `As a health assistant, analyze the following symptoms:
      Symptoms: ${symptoms.join(', ')}
      Severity: ${severity}
      Duration: ${duration || 'Not specified'}
      Age: ${userAge || 'Not specified'}
      Gender: ${userGender || 'Not specified'}
      Weight: ${userWeight || 'Not specified'}
      Medical History: ${medicalHistory || 'None'}

      Provide a detailed analysis with:
      1. Possible conditions (3-5 most likely)
      2. Home remedies (5-7 practical tips)
      3. Doctor advice (when to see a doctor)
      4. Emergency warning signs (if any)

      Format your response as a JSON object with this exact structure:
      {
        "possible_conditions": ["condition1", "condition2", ...],
        "home_remedies": ["remedy1", "remedy2", ...],
        "doctor_advice": "Detailed advice text",
        "emergency": true/false
      }
      `;

      const response = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      const analysis: SymptomAnalysis = {
        id: Date.now().toString(),
        user_id: user.id,
        symptoms: symptoms,
        severity: severity,
        duration: duration || 'Not specified',
        possible_conditions: data.possible_conditions || ['General fatigue', 'Stress related', 'Need medical consultation'],
        home_remedies: data.home_remedies || ['Rest properly', 'Stay hydrated', 'Maintain healthy diet', 'Monitor symptoms'],
        doctor_advice: data.doctor_advice || 'Please consult a healthcare professional for proper diagnosis and treatment.',
        emergency: data.emergency || false,
        created_at: new Date().toISOString()
      };

      setResult(analysis);
      setHistory([analysis, ...history]);

      // Save to database
      await supabase
        .from('symptom_analyses')
        .insert({
          user_id: user.id,
          symptoms: analysis.symptoms,
          severity: analysis.severity,
          duration: analysis.duration,
          possible_conditions: analysis.possible_conditions,
          home_remedies: analysis.home_remedies,
          doctor_advice: analysis.doctor_advice,
          emergency: analysis.emergency,
          created_at: analysis.created_at
        });

    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSymptoms([]);
    setSymptomInput('');
    setSeverity('mild');
    setDuration('');
    setResult(null);
    setError(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400';
      case 'severe': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Stethoscope className="text-rose-600 dark:text-rose-400" size={24} />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Health Symptom Analyzer</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered symptom analysis with home remedies & doctor advice</p>
        </div>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* User Info */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Age</label>
          <input
            type="number"
            value={userAge}
            onChange={(e) => setUserAge(e.target.value)}
            placeholder="e.g., 25"
            className="w-full p-2 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Gender</label>
          <select
            value={userGender}
            onChange={(e) => setUserGender(e.target.value)}
            className="w-full p-2 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Weight (kg)</label>
          <input
            type="number"
            value={userWeight}
            onChange={(e) => setUserWeight(e.target.value)}
            placeholder="e.g., 70"
            className="w-full p-2 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Symptoms Input */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Symptoms</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder="e.g., Headache, Fever, Fatigue"
            className="flex-1 p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSymptom(); } }}
          />
          <button
            type="button"
            onClick={addSymptom}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {symptoms.map((symptom, i) => (
            <span key={i} className="px-3 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-full text-xs flex items-center gap-1">
              {symptom}
              <button type="button" onClick={() => removeSymptom(symptom)} className="hover:text-red-600">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as any)}
            className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Duration</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 2 days"
            className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Medical History (Optional)</label>
        <input
          type="text"
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
          placeholder="e.g., Asthma, Diabetes, Allergies"
          className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <button
        onClick={analyzeSymptoms}
        disabled={loading || symptoms.length === 0}
        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyzing Symptoms...
          </>
        ) : (
          <>
            <Search size={18} />
            Analyze Symptoms
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded-xl border ${result.emergency ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-rose-200 dark:border-rose-900/30'}`}>
            <div className="flex items-center gap-2 mb-3">
              {result.emergency ? (
                <AlertTriangle className="text-red-600" size={20} />
              ) : (
                <CheckCircle className="text-green-600" size={20} />
              )}
              <h3 className="font-bold text-gray-900 dark:text-white">
                {result.emergency ? '⚠️ Emergency Warning!' : '✅ Analysis Complete'}
              </h3>
            </div>

            {result.emergency && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                <strong>Please seek immediate medical attention!</strong> Your symptoms may require urgent care.
                <div className="flex gap-3 mt-2">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                    <Phone size={14} /> Call 108 (Ambulance)
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                    <Video size={14} /> Emergency Telehealth
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">🩺 Possible Conditions</h4>
                <ul className="space-y-1">
                  {result.possible_conditions.map((condition, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                      <span className="text-rose-500">•</span> {condition}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">🏠 Home Remedies</h4>
                <ul className="space-y-1">
                  {result.home_remedies.map((remedy, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                      <span className="text-green-500">•</span> {remedy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
              <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-1">👨‍⚕️ Doctor Advice</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{result.doctor_advice}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                  <Phone size={12} /> Find Doctor Near Me
                </button>
                <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                  <Video size={12} /> Book Online Consult
                </button>
              </div>
            </div>

            <div className="mt-3 flex justify-between text-xs text-gray-400">
              <span>Severity: <span className={`px-2 py-0.5 rounded-full ${getSeverityColor(result.severity)}`}>{result.severity}</span></span>
              <span>Duration: {result.duration}</span>
              <button
                onClick={resetForm}
                className="text-rose-600 hover:underline"
              >
                New Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Recent Analysis</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {history.slice(0, 5).map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.symptoms.join(', ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityColor(item.severity)}`}>
                      {item.severity}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => setResult(item)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
