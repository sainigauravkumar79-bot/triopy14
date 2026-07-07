import React, { useState, useEffect } from 'react';
import { Users, Trophy, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

interface Room {
  id: string;
  name: string;
  creator_id: string;
  members: string[];
}

export const ChallengeRoom: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchRooms = async () => {
        const { data, error } = await supabase
            .from('challenge_rooms')
            .select('*')
            .contains('members', [user.email]);
        if (!error && data) setRooms(data);
    };
    fetchRooms();
  }, [user]);

  const createRoom = async () => {
    if (!user || !roomName) return;
    const { error } = await supabase.from('challenge_rooms').insert({
        name: roomName,
        creator_id: user.id,
        members: [user.email]
    });
    if (!error) {
        setRoomName('');
        setIsCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Challenge Rooms</h3>
        </div>
        <button onClick={() => setIsCreating(true)} className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
          <Plus size={20} />
        </button>
      </div>
      
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-sm">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create Room</h4>
            <input 
              value={roomName} 
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room Name" 
              className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setIsCreating(false)} className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl">Cancel</button>
              <button onClick={createRoom} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rooms.map(room => (
          <div key={room.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center">
            <span className="font-medium text-gray-800 dark:text-white">{room.name}</span>
            <Trophy size={18} className="text-indigo-500" />
          </div>
        ))}
      </div>
    </div>
  );
};
