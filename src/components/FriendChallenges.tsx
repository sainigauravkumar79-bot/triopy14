import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';
import { Users, Send, Check, X, Trophy, MessageSquare, Share2, UserPlus } from 'lucide-react';

interface FriendRequest {
  id: string;
  sender_email: string;
  receiver_email: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Room {
  id: string;
  name: string;
  creator_id: string;
  members: string[];
  progress: Record<string, number>;
  chat: { sender: string; message: string; timestamp: Date }[];
}

export const FriendChallenges: React.FC = () => {
  const { user } = useAuth();
  const [friendEmail, setFriendEmail] = useState('');
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    if (!user || !user.email) return;

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('receiver_email', user.email || '');
        if (!error && data) setRequests(data as FriendRequest[]);
    };
    fetchRequests();

    const fetchRooms = async () => {
        const { data, error } = await supabase
            .from('challenge_rooms')
            .select('*')
            .contains('members', [user.email]);
        if (!error && data) setRooms(data as Room[]);
    };
    fetchRooms();
  }, [user]);

  const sendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email || !friendEmail) return;

    if (friendEmail.trim().toLowerCase() === user.email.toLowerCase()) {
      alert("You cannot add yourself!");
      return;
    }

    try {
      await supabase.from('friend_requests').insert({
        sender_email: user.email,
        receiver_email: friendEmail.trim().toLowerCase(),
        status: 'pending'
      });
      alert(`Friend request sent to ${friendEmail}!`);
      setFriendEmail('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestAction = async (id: string, action: 'accepted' | 'rejected') => {
    try {
      await supabase.from('friend_requests').update({ status: action }).eq('id', id);
      alert(`Request ${action}!`);
    } catch (error) {
      console.error(error);
    }
  };

  const createChallengeRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email || !roomName) return;

    try {
      await supabase.from('challenge_rooms').insert({
        name: roomName,
        creator_id: user.id,
        members: [user.email],
        progress: { [user.email]: 0 },
        chat: [
          {
            sender: 'Triopy System',
            message: `Welcome! challenge room "${roomName}" has been established. Log your daily progress to compete!`,
            timestamp: new Date()
          }
        ]
      });
      setRoomName('');
      setIsCreatingRoom(false);
      alert('Challenge room established!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProgress = async (roomId: string, currentProgress: Record<string, number>) => {
    if (!user || !user.email) return;
    const currentScore = currentProgress[user.email] || 0;
    const newScore = currentScore + 10;
    
    try {
      await supabase.from('challenge_rooms').update({
        [`progress->>${user.email}`]: newScore
      }).eq('id', roomId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInviteToRoom = async (roomId: string, inviteeEmail: string) => {
    try {
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;
        const newMembers = [...room.members, inviteeEmail];
        const newProgress = { ...room.progress, [inviteeEmail]: 0 };

      await supabase.from('challenge_rooms').update({
        members: newMembers,
        progress: newProgress
      }).eq('id', roomId);
      alert(`Invited ${inviteeEmail} to room!`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendChat = async (roomId: string) => {
    if (!user || !user.email || !chatMsg) return;
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const updatedChat = [
      ...room.chat,
      { sender: user.email, message: chatMsg, timestamp: new Date() }
    ];

    try {
      await supabase.from('challenge_rooms').update({ chat: updatedChat }).eq('id', roomId);
      setChatMsg('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleShareResults = (room: Room) => {
    const text = `🏆 TRIOPY Friend Challenge: "${room.name}"\nRankings:\n` + 
      Object.entries(room.progress)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .map(([email, score], index) => `${index + 1}. ${email.split('@')[0]}: ${score} points`)
        .join('\n') + `\nJoin me on Triopy!`;
    
    navigator.clipboard.writeText(text);
    alert('Challenge results copied to clipboard! You can share them anywhere.');
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <div id="friend-challenges-module" className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Friend Challenges</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Compete with your peers, share stats, and rank in real-time.</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreatingRoom(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
        >
          Establish New Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/40">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
              <UserPlus size={16} /> Invite Peers
            </h3>
            <form onSubmit={sendFriendRequest} className="flex gap-2">
              <input
                type="email"
                required
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="Enter friend's email"
                className="flex-1 p-2.5 rounded-xl border text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button type="submit" className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">
                Invite
              </button>
            </form>
          </div>

          {requests.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
              <h3 className="text-xs font-bold text-yellow-800 dark:text-yellow-400 mb-3 uppercase tracking-wider">
                Pending Friend Requests ({requests.length})
              </h3>
              <div className="space-y-3">
                {requests.map((r) => r.status === 'pending' && (
                  <div key={r.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800/40">
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold truncate max-w-[120px]">{r.sender_email}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleRequestAction(r.id, 'accepted')} className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
                        <Check size={12} />
                      </button>
                      <button onClick={() => handleRequestAction(r.id, 'rejected')} className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  activeRoomId === room.id
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 dark:text-white text-sm">{room.name}</h4>
                  <Trophy className="text-yellow-500" size={16} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Live Rankings</div>
                  {Object.entries(room.progress)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 3)
                    .map(([email, score], index) => (
                      <div key={email} className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[130px]">
                          {index + 1}. {email === user?.email ? 'You' : email.split('@')[0]}
                        </span>
                        <span className="text-gray-900 dark:text-white">{score} XP</span>
                      </div>
                    ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateProgress(room.id, room.progress);
                    }}
                    className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    +10 Score
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const email = prompt("Enter friend's email to invite:");
                      if (email) handleInviteToRoom(room.id, email);
                    }}
                    className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold"
                  >
                    Invite
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareResults(room);
                    }}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded-xl"
                    title="Share results"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeRoom && (
            <div className="p-5 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 animate-fade-in flex flex-col justify-between h-80">
              <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-indigo-500" size={16} />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Room Chat: "{activeRoom.name}"</span>
                </div>
                <button onClick={() => setActiveRoomId(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 my-3 overflow-y-auto space-y-2.5 pr-1">
                {activeRoom.chat.map((m, index) => {
                  const isMe = m.sender === user?.email;
                  return (
                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-gray-400 mb-0.5">{m.sender.split('@')[0]}</span>
                      <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                      }`}>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  placeholder="Send motivation message..."
                  className="flex-1 p-2 rounded-xl border text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(activeRoom.id); }}
                />
                <button
                  onClick={() => handleSendChat(activeRoom.id)}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreatingRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-sm border border-gray-100 dark:border-gray-700 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Establish Challenge Room</h3>
            <form onSubmit={createChallengeRoom} className="space-y-4">
              <input
                type="text"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. 10k Steps Squad / Code Wizards"
                className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingRoom(false)}
                  className="flex-1 p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
