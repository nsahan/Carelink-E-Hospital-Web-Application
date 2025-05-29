import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Wind, Music, Coffee, Gamepad, Palette, ClipboardCheck, Activity, BookOpen } from 'lucide-react';
import MeditationTimer from '../components/stress-relief/MeditationTimer';
import BreathingExercise from '../components/stress-relief/BreathingExercise';
import CalmnessGame from '../components/stress-relief/CalmnessGame';

import MindfulnessPuzzle from '../components/stress-relief/MindfulnessPuzzle';
import MindfulnessJournal from '../components/stress-relief/MindfulnessJournal';
import ZenGarden from '../components/stress-relief/ZenGarden';
import StressAssessment from '../components/stress-relief/StressAssessment';
import MuscleRelaxation from '../components/stress-relief/MuscleRelaxation';
import TherapyJournal from '../components/stress-relief/TherapyJournal';
import MindfulnessMeditation from '../components/stress-relief/MindfulnessMeditation';

const StressRelief = () => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);
  const [points, setPoints] = useState(0);

  const handleActivityComplete = (activityPoints) => {
    const newPoints = points + activityPoints;
    setPoints(newPoints);
    
    // Update streak
    const today = new Date().toDateString();
    if (lastVisit !== today) {
      setStreakCount(prev => prev + 1);
      setLastVisit(today);
    }
    
    // Save progress
    localStorage.setItem('stressReliefProgress', JSON.stringify({
      lastVisit: today,
      streakCount,
      points: newPoints
    }));
  };

  const activities = [
    {
      id: 'assessment',
      title: 'Stress Assessment',
      description: 'Take a professional stress evaluation',
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: 'bg-indigo-100 text-indigo-600',
      component: <StressAssessment onComplete={handleActivityComplete} />
    },
    {
      id: 'muscle-relaxation',
      title: 'Progressive Muscle Relaxation',
      description: 'Systematic relaxation technique',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-600',
      component: <MuscleRelaxation onComplete={handleActivityComplete} />
    },
    {
      id: 'meditation',
      title: 'Guided Meditation',
      description: 'Follow guided meditation sessions',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
      component: <MeditationTimer onComplete={handleActivityComplete} />
    },
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      description: 'Practice calming breathing techniques',
      icon: <Wind className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600',
      component: <BreathingExercise onComplete={handleActivityComplete} />
    },
    {
      id: 'game',
      title: 'Calmness Games',
      description: 'Play relaxing mini-games',
      icon: <Gamepad className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
      component: <CalmnessGame onComplete={handleActivityComplete} />
    },
    {
      id: 'mindfulness-puzzle',
      title: 'Mindfulness Puzzle',
      description: 'Train focus and concentration',
      icon: <Gamepad className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
      component: <MindfulnessPuzzle onComplete={handleActivityComplete} />
    },
   
     {
      id: 'color-memory',
      title: 'Mindfulness Journal',
      description: 'Reflect on your day and emotions',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
      component: <MindfulnessJournal onComplete={handleActivityComplete} />
    },
     {
      id: 'Zengarden',
      title: 'Painting Zen Garden',
      description: 'Create peaceful patterns to calm your mind',
      icon: <Palette className="w-6 h-6" />,
      color: 'bg-pink-100 text-pink-600',
      component: <ZenGarden onComplete={handleActivityComplete} />
    },
    {
      id: 'therapy-journal',
      title: 'Therapeutic Journaling',
      description: 'Guided reflection and emotional processing',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-emerald-100 text-emerald-600',
      component: <TherapyJournal onComplete={handleActivityComplete} />
    },
    {
      id: 'mindfulness-meditation',
      title: 'Mindfulness Meditation',
      description: 'Present-moment awareness practices',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
      component: <MindfulnessMeditation onComplete={handleActivityComplete} />
    }
  ];

  useEffect(() => {
    // Load user progress from localStorage
    const savedProgress = localStorage.getItem('stressReliefProgress');
    if (savedProgress) {
      const { lastVisit, streakCount, points } = JSON.parse(savedProgress);
      setLastVisit(lastVisit);
      setStreakCount(streakCount);
      setPoints(points);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Stress Relief Zone
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a moment to relax and recharge with our scientifically-proven stress relief activities.
          </p>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Your Progress</h3>
                <p className="text-sm text-gray-500">Keep the streak going!</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{streakCount}</p>
                <p className="text-sm text-gray-500">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{points}</p>
                <p className="text-sm text-gray-500">Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
              onClick={() => setSelectedActivity(activity)}
            >
              <div className="p-6">
                <div className={`w-12 h-12 rounded-full ${activity.color} flex items-center justify-center mb-4`}>
                  {activity.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Modal */}
        <AnimatePresence>
          {selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-xl w-full max-w-2xl mx-4 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">{selectedActivity.title}</h2>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {selectedActivity.component}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StressRelief;
