    import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward } from 'lucide-react';

const bodyParts = [
  { name: 'Hands & Arms', duration: 30, instructions: 'Clench your fists and tighten your arms...' },
  { name: 'Face & Neck', duration: 30, instructions: 'Scrunch your facial muscles...' },
  { name: 'Shoulders', duration: 30, instructions: 'Raise and tense your shoulders...' },
  { name: 'Chest & Back', duration: 30, instructions: 'Take a deep breath and arch your back...' },
  { name: 'Abdomen', duration: 30, instructions: 'Tighten your stomach muscles...' },
  { name: 'Legs & Feet', duration: 30, instructions: 'Curl your toes and tense your legs...' }
];

const MuscleRelaxation = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(bodyParts[0].duration);

  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (currentStep < bodyParts.length - 1) {
        setCurrentStep(prev => prev + 1);
        setTimeLeft(bodyParts[currentStep + 1].duration);
      } else {
        setIsActive(false);
        onComplete && onComplete(50);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg className="transform -rotate-90 w-48 h-48">
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
              className="stroke-current text-blue-500"
              strokeWidth="12"
              fill="none"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - timeLeft / bodyParts[currentStep].duration)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-600">{timeLeft}s</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">{bodyParts[currentStep].name}</h3>
        <p className="text-gray-600">{bodyParts[currentStep].instructions}</p>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={() => {
            if (currentStep < bodyParts.length - 1) {
              setCurrentStep(prev => prev + 1);
              setTimeLeft(bodyParts[currentStep + 1].duration);
            }
          }}
          disabled={currentStep === bodyParts.length - 1}
          className="px-6 py-2 rounded-lg flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward className="w-5 h-5" />
          <span>Skip</span>
        </button>
      </div>

      <div className="mt-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm text-gray-600">
            {currentStep + 1}/{bodyParts.length}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / bodyParts.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default MuscleRelaxation;
