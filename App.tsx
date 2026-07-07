import React, { useState } from 'react';
import { useAuth } from './components/AuthProvider';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionManager } from './components/SubscriptionManager';
import { supabase } from './lib/supabase';

// ============================================================
//  AUTH PAGE – directly embedded, no import from auth folder
// ============================================================
const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [modal, setModal] = useState<'terms' | 'privacy' | null>(null);

  // ----- Login component -----
  const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleLogin} className="space-y-4">
        <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400">TRIOPY</h1>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">Welcome Back</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl dark:bg-gray-800 dark:text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="text-center">
          <button type="button" onClick={() => setIsLogin(false)} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Create Account
          </button>
        </div>
      </form>
    );
  };

  // ----- SignUp component -----
  const SignUpForm: React.FC = () => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, age: parseInt(age) } }
        });
        if (error) throw error;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSignUp} className="space-y-4">
        <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400">TRIOPY</h1>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Create Account</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl dark:bg-gray-800 dark:text-white"
        />
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          required
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl dark:bg-gray-800 dark:text-white"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl dark:bg-gray-800 dark:text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 chars)"
          required
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="text-center">
          <button type="button" onClick={() => setIsLogin(true)} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Back to Login
          </button>
        </div>
      </form>
    );
  };

  // ----- Main auth page UI -----
  return (
    <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      {isLogin ? <LoginForm /> : <SignUpForm />}
      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <button onClick={() => setModal('terms')} className="hover:underline mr-2">Terms of Service</button>
        <button onClick={() => setModal('privacy')} className="hover:underline">Privacy Policy</button>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {modal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {modal === 'terms'
                ? 'By using Triopy, you agree to our terms and conditions. All data is handled with care and respect.'
                : 'We value your privacy. Your data is encrypted and never shared with third parties without your consent.'}
            </p>
            <button onClick={() => setModal(null)} className="w-full p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
//  MAIN APP COMPONENT
// ============================================================
export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <AuthPage />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SubscriptionManager>
        <Dashboard />
      </SubscriptionManager>
    </ThemeProvider>
  );
      }
