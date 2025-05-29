import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Smile, Frown, Meh, Save, Calendar, Filter, Tag, AlertCircle } from 'lucide-react';

const TherapyJournal = ({ onComplete }) => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    text: '',
    mood: 'neutral',
    tags: [],
    prompt: ''
  });

  const therapeuticPrompts = [
    "What's the most challenging emotion you're experiencing today?",
    "Describe a situation that triggered stress and how you handled it.",
    "What are three things you're grateful for right now?",
    "Write about a recent accomplishment, no matter how small.",
    "What would you tell your younger self about handling stress?",
    "Describe your ideal peaceful moment.",
    "What are your current coping strategies, and how effective are they?"
  ];

  const moodEmojis = {
    happy: { icon: <Smile className="w-6 h-6" />, color: 'text-green-500' },
    neutral: { icon: <Meh className="w-6 h-6" />, color: 'text-yellow-500' },
    sad: { icon: <Frown className="w-6 h-6" />, color: 'text-blue-500' }
  };

  const suggestionTags = [
    'Anxiety', 'Work Stress', 'Relationships', 'Self-Care',
    'Personal Growth', 'Health', 'Family', 'Goals'
  ];

  useEffect(() => {
    const savedEntries = localStorage.getItem('therapyJournalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
    setCurrentEntry(prev => ({
      ...prev,
      prompt: therapeuticPrompts[Math.floor(Math.random() * therapeuticPrompts.length)]
    }));
  }, []);

  const handleSave = () => {
    if (!currentEntry.text.trim()) return;

    const newEntry = {
      ...currentEntry,
      id: Date.now(),
      date: new Date().toISOString(),
      insights: generateInsights(currentEntry.text)
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('therapyJournalEntries', JSON.stringify(updatedEntries));
    
    setCurrentEntry({
      text: '',
      mood: 'neutral',
      tags: [],
      prompt: therapeuticPrompts[Math.floor(Math.random() * therapeuticPrompts.length)]
    });

    onComplete && onComplete(25); // Award points for completing an entry
  };

  const generateInsights = (text) => {
    // Simple sentiment analysis
    const positiveWords = ['happy', 'grateful', 'joy', 'peace', 'accomplished'];
    const negativeWords = ['stressed', 'anxious', 'worried', 'overwhelmed', 'fear'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;

    const insights = [];
    if (positiveCount > negativeCount) {
      insights.push('Your entry shows a positive mindset. Keep nurturing these good feelings!');
    } else if (negativeCount > positiveCount) {
      insights.push('Consider practicing some stress relief activities to help balance your emotions.');
    }

    if (text.length > 200) {
      insights.push('Great job on writing a detailed entry! Expression through writing is therapeutic.');
    }

    return insights;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
          Therapeutic Journal Entry
        </h3>

        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg border border-blue-100 mb-4">
            <div className="flex items-center text-sm text-blue-600 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              Prompt for Reflection
            </div>
            <p className="text-gray-700 italic">{currentEntry.prompt}</p>
          </div>

          <textarea
            value={currentEntry.text}
            onChange={(e) => setCurrentEntry({ ...currentEntry, text: e.target.value })}
            placeholder="Begin your therapeutic writing here..."
            className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
            <div className="flex space-x-4">
              {Object.entries(moodEmojis).map(([mood, { icon, color }]) => (
                <button
                  key={mood}
                  onClick={() => setCurrentEntry({ ...currentEntry, mood })}
                  className={`p-2 rounded-lg transition-all ${
                    currentEntry.mood === mood 
                      ? 'bg-blue-100 ring-2 ring-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={color}>{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {suggestionTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setCurrentEntry({
                    ...currentEntry,
                    tags: currentEntry.tags.includes(tag)
                      ? currentEntry.tags.filter(t => t !== tag)
                      : [...currentEntry.tags, tag]
                  })}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    currentEntry.tags.includes(tag)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!currentEntry.text.trim()}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Entry
        </button>
      </div>

      {entries.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Previous Entries
          </h4>
          
          {entries.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <span className="mx-2">•</span>
                  <span className={moodEmojis[entry.mood].color}>
                    {moodEmojis[entry.mood].icon}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{entry.text}</p>
              
              {entry.insights.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium mb-1">Therapeutic Insights</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {entry.insights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapyJournal;
