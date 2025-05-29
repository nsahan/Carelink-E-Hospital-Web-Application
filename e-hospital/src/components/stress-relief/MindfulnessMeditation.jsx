import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward, RefreshCw } from 'lucide-react';

const MindfulnessMeditation = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(new Audio('/meditation-bell.mp3'));
  const backgroundSoundRef = useRef(new Audio('/ambient-nature.mp3'));

  const meditationSessions = [
    {
      title: "Body Scan Meditation",
      duration: 300, // 5 minutes
      instructions: [
        "Find a comfortable position",
        "Close your eyes and take deep breaths",
        "Focus on different parts of your body",
        "Notice any sensations without judgment",
        "Gradually move your attention upward"
      ]
    },
    {
      title: "Breath Awareness",
      duration: 420, // 7 minutes
      instructions: [
        "Sit in a relaxed position",
        "Focus on your natural breath",
        "Notice the rhythm of your breathing",
        "Let thoughts pass like clouds",
        "Return focus to breath when distracted"
      ]
    },
    {
      title: "Loving-Kindness Meditation",
      duration: 600, // 10 minutes
      instructions: [
        "Begin with self-compassion",
        "Extend well-wishes to loved ones",
        "Include neutral people",
        "Embrace all beings with kindness",
        "Feel the warmth of universal love"
      ]
    }
  ];

  useEffect(() => {
    const audio = audioRef.current;
    const bgSound = backgroundSoundRef.current;
    
    bgSound.loop = true;
    bgSound.volume = volume;
    
    if (isPlaying) {
      bgSound.play();
      setTimeLeft(meditationSessions[currentSession].duration);
    } else {
      bgSound.pause();
    }
    
    return () => {
      audio.pause();
      bgSound.pause();
    };
  }, [isPlaying]);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            audioRef.current.play();
            setIsPlaying(false);
            if (currentSession === meditationSessions.length - 1) {
              onComplete && onComplete(50);
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    const bgSound = backgroundSoundRef.current;
    bgSound.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextSession = () => {
    if (currentSession < meditationSessions.length - 1) {
      setCurrentSession(prev => prev + 1);
      setTimeLeft(meditationSessions[currentSession + 1].duration);
      setIsPlaying(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {meditationSessions[currentSession].title}
        </h3>
        <p className="text-gray-600">
          Session {currentSession + 1} of {meditationSessions.length}
        </p>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-current text-gray-200"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-current text-indigo-500"
              strokeWidth="12"
              fill="none"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - timeLeft / meditationSessions[currentSession].duration)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-indigo-600">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center space-x-6 mb-8">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-4 rounded-full ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
            } text-white transition-colors duration-200`}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleNextSession}
            disabled={currentSession === meditationSessions.length - 1}
            className={`p-4 rounded-full ${
              currentSession === meditationSessions.length - 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
            } transition-colors duration-200`}
          >
            <SkipForward size={24} />
          </button>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="font-semibold mb-4">Meditation Instructions</h4>
        <ol className="space-y-3">
          {meditationSessions[currentSession].instructions.map((instruction, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-start space-x-3"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">
                {index + 1}
              </span>
              <span className="text-gray-700">{instruction}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default MindfulnessMeditation;
