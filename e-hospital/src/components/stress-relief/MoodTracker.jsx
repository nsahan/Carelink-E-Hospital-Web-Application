import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Stressed' },
  { emoji: '😴', label: 'Tired' },
];

const MoodTracker = ({ onMoodSelect }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);

  useEffect(() => {
    const savedMoods = localStorage.getItem('moodHistory');
    if (savedMoods) {
      setMoodHistory(JSON.parse(savedMoods));
    }
  }, []);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    const newMoodEntry = {
      mood: mood,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [...moodHistory, newMoodEntry];
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
    onMoodSelect && onMoodSelect(mood);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>
      
      <div className="grid grid-cols-5 gap-4 mb-8">
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMoodSelect(mood)}
            className={`p-4 rounded-lg ${
              selectedMood?.label === mood.label 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="text-3xl mb-2">{mood.emoji}</div>
            <div className="text-sm">{mood.label}</div>
          </motion.button>
        ))}
      </div>

      {moodHistory.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Mood History</h4>
          <div className="space-y-2">
            {moodHistory.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{entry.mood.emoji}</span>
                  <span className="text-gray-600">{entry.mood.label}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
