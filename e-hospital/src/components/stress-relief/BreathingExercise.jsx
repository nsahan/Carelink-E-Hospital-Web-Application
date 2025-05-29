import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Settings } from 'lucide-react';

const BreathingExercise = ({ onComplete }) => {
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState({
    breathingPattern: '4-4-4-4', // inhale-hold-exhale-hold
    cycleCount: 5,
    soundEnabled: true,
    guidanceVolume: 0.5
  });
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);

  const guidanceAudio = {
    inhale: new Audio('/sounds/inhale.mp3'),
    hold: new Audio('/sounds/hold.mp3'),
    exhale: new Audio('/sounds/exhale.mp3')
  };

  const playSound = useCallback((type) => {
    if (settings.soundEnabled) {
      guidanceAudio[type].volume = settings.guidanceVolume;
      guidanceAudio[type].play();
    }
  }, [settings.soundEnabled, settings.guidanceVolume]);

  useEffect(() => {
    let timer;
    if (isActive) {
      const [inhaleTime, holdTime1, exhaleTime, holdTime2] = settings.breathingPattern
        .split('-')
        .map(Number);
      
      const totalCycleTime = (inhaleTime + holdTime1 + exhaleTime + holdTime2) * 1000;
      
      timer = setInterval(() => {
        setPhase(prev => {
          switch(prev) {
            case 'inhale':
              playSound('hold');
              return 'hold1';
            case 'hold1':
              playSound('exhale');
              return 'exhale';
            case 'exhale':
              playSound('hold');
              return 'hold2';
            default:
              setCount(c => c + 1);
              playSound('inhale');
              return 'inhale';
          }
        });
        
        setProgress(prev => (prev + 25) % 100);
      }, totalCycleTime / 4);
      
      // Initial sound
      playSound('inhale');
    }
    return () => clearInterval(timer);
  }, [isActive, settings.breathingPattern, playSound]);

  useEffect(() => {
    if (count >= 5) { // 5 complete cycles
      setIsActive(false);
      onComplete && onComplete(30);
    }
  }, [count]);

  const getInstructions = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
      default: return '';
    }
  };

  const breathingPatterns = {
    'Relaxation': '4-4-4-4',
    'Deep Breathing': '4-7-8-0',
    'Energy Boost': '6-0-2-0',
    'Calm': '7-4-8-4'
  };

  const renderProgressRing = () => (
    <svg className="w-64 h-64 transform -rotate-90">
      <circle
        className="text-gray-200"
        strokeWidth="8"
        stroke="currentColor"
        fill="transparent"
        r="120"
        cx="128"
        cy="128"
      />
      <circle
        className="text-blue-500 transition-all duration-300"
        strokeWidth="8"
        stroke="currentColor"
        fill="transparent"
        r="120"
        cx="128"
        cy="128"
        strokeDasharray={2 * Math.PI * 120}
        strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
      />
    </svg>
  );

  return (
    <div className="text-center p-6">
      <div className="relative">
        <div className="absolute top-0 right-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl p-4 z-10"
            >
              <h3 className="font-semibold mb-4">Breathing Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Breathing Pattern</label>
                  <select
                    value={settings.breathingPattern}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      breathingPattern: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    {Object.entries(breathingPatterns).map(([name, pattern]) => (
                      <option key={pattern} value={pattern}>{name} ({pattern})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sound Guidance
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        soundEnabled: !prev.soundEnabled
                      }))}
                      className="ml-2"
                    >
                      {settings.soundEnabled ? 
                        <Volume2 className="w-4 h-4" /> : 
                        <VolumeX className="w-4 h-4" />
                      }
                    </button>
                  </label>
                  {settings.soundEnabled && (
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.guidanceVolume}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        guidanceVolume: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex justify-center items-center">
          {renderProgressRing()}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : 1.2,
            }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            <span className="text-3xl font-medium text-blue-600">
              {getInstructions()}
            </span>
          </motion.div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
                isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors`}
            >
              {isActive ? 
                <><Pause className="w-5 h-5" /><span>Pause</span></> : 
                <><Play className="w-5 h-5" /><span>Start</span></>
              }
            </button>
            <button
              onClick={() => {
                setIsActive(false);
                setCount(0);
                setPhase('inhale');
                setProgress(0);
              }}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Completed cycles: <span className="font-medium">{count}/{settings.cycleCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
