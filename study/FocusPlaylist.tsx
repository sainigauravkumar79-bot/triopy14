import React, { useState, useRef } from 'react';
import { Play, Pause, SkipForward, Music } from 'lucide-react';

const TRACKS = [
  { title: 'Chill Lo-fi Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'Study Waves', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'Focus Flow', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export const FocusPlaylist: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Music className="text-pink-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Focus Playlist</h3>
      </div>

      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-4">
        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{TRACKS[currentTrackIndex].title}</p>
        <div className="flex gap-2">
          <button onClick={togglePlay} className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            {isPlaying ? <Pause size={20} className="text-pink-600" /> : <Play size={20} className="text-pink-600" />}
          </button>
          <button onClick={nextTrack} className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            <SkipForward size={20} className="text-pink-600" />
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={TRACKS[currentTrackIndex].url} onEnded={nextTrack} />
    </div>
  );
};
