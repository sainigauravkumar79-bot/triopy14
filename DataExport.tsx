import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

export const DataExport: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const exportData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const tables = ['journal_entries', 'study_sessions', 'quests', 'goals', 'habits', 'hydration'];
      const data: any = {};

      for (const tableName of tables) {
        const { data: tableData } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id);
        data[tableName] = tableData;
      }

      const { data: statsData } = await supabase
        .from('stats')
        .select('*')
        .eq('user_id', user.id);
      data['stats'] = statsData;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `triopy_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (e) {
      console.error(e);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={exportData}
      disabled={loading}
      className="flex items-center gap-2 p-3 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-gray-800 dark:hover:bg-indigo-700 disabled:opacity-50 transition-colors"
    >
      <Download size={18} />
      {loading ? 'Exporting...' : 'Export Progress Data (JSON)'}
    </button>
  );
};
