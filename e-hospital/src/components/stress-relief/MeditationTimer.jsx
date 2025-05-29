import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const MeditationTimer = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTime, setSelectedTime] = useState(600);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete && onComplete(50); // Award 50 points for completing meditation
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setTimeLeft(selectedTime);
    setIsRunning(false);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <select 
          value={selectedTime}
          onChange={(e) => {
            setSelectedTime(Number(e.target.value));
            setTimeLeft(Number(e.target.value));
            setIsRunning(false);
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
        >
          <option value={300}>5 minutes</option>
          <option value={600}>10 minutes</option>
          <option value={900}>15 minutes</option>
          <option value={1200}>20 minutes</option>
        </select>
      </div>

      <div className="bg-blue-50 w-48 h-48 rounded-full mx-auto mb-6 flex items-center justify-center">
        <span className="text-4xl font-bold text-blue-600">{formatTime(timeLeft)}</span>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-gray-300 transition-colors"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
};

export default MeditationTimer;
