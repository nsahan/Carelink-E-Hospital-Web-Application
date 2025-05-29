import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const sounds = [
  {
    name: 'Rain',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-ambient-sound-2394.mp3',
    icon: '🌧️'
  },
  {
    name: 'Ocean',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-beach-waves-loop-1196.mp3',
    icon: '🌊'
  },
  {
    name: 'Forest',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-loop-1237.mp3',
    icon: '🌳'
  },
  {
    name: 'White Noise',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-white-noise-ambience-loop-1236.mp3',
    icon: '⚪'
  }
];

const AmbientSounds = ({ onComplete }) => {
  const [activeSound, setActiveSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = volume;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
  }, [volume]);

  const handleSoundSelect = (sound) => {
    const audio = audioRef.current;
    
    if (activeSound === sound.name) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      if (isPlaying) {
        audio.pause();
      }
      audio.src = sound.url;
      audio.play();
      setActiveSound(sound.name);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.5);
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => {
        onComplete && onComplete(20);
      }, 300000); // 5 minutes of listening
    }
    return () => clearTimeout(timer);
  }, [isPlaying]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h3 className="text-xl font-semibold mb-6">Ambient Sounds</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {sounds.map((sound) => (
          <button
            key={sound.name}
            onClick={() => handleSoundSelect(sound)}
            className={`p-4 rounded-lg transition-all duration-300 flex flex-col items-center justify-center space-y-2
              ${activeSound === sound.name && isPlaying 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}`}
          >
            <span className="text-3xl">{sound.icon}</span>
            <span className="font-medium">{sound.name}</span>
            {activeSound === sound.name && (
              <div className="flex justify-center">
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-blue-600" />
                ) : (
                  <Play className="w-5 h-5 text-blue-600" />
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {activeSound && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <button onClick={toggleMute}>
              {volume > 0 ? (
                <Volume2 className="w-6 h-6 text-gray-600" />
              ) : (
                <VolumeX className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="text-sm text-gray-600">
            Playing: {activeSound}
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">
        Listen for at least 5 minutes to get relaxation points
      </p>
    </div>
  );
};

export default AmbientSounds;
