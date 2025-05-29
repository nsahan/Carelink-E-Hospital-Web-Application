import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Save, Book, PenTool } from 'lucide-react';

const MindfulnessJournal = ({ onComplete }) => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [mood, setMood] = useState('neutral');
  const [showPrompt, setShowPrompt] = useState(true);

  const prompts = [
    "What are three things you're grateful for today?",
    "Describe a moment that brought you peace today.",
    "What's one thing you're looking forward to?",
    "Write about a challenge you overcame recently.",
    "What made you smile today?"
  ];

  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('mindfulness-journal');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const saveEntry = () => {
    if (!currentEntry.trim()) return;

    const newEntry = {
      id: Date.now(),
      text: currentEntry,
      mood,
      prompt: showPrompt ? currentPrompt : null,
      date: new Date().toISOString()
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('mindfulness-journal', JSON.stringify(updatedEntries));
    setCurrentEntry('');
    setMood('neutral');
    onComplete && onComplete(20);
    
    // Rotate prompts
    const nextPrompt = prompts[(prompts.indexOf(currentPrompt) + 1) % prompts.length];
    setCurrentPrompt(nextPrompt);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Mindfulness Journal</h3>
        <p className="text-gray-600">Record your thoughts and feelings</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <PenTool className="w-5 h-5 text-indigo-600 mr-2" />
            <h4 className="font-medium">New Entry</h4>
          </div>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            {showPrompt ? 'Hide Prompt' : 'Show Prompt'}
          </button>
        </div>

        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-indigo-50 rounded-lg text-indigo-700"
          >
            {currentPrompt}
          </motion.div>
        )}

        <textarea
          value={currentEntry}
          onChange={(e) => setCurrentEntry(e.target.value)}
          placeholder="Write your thoughts here..."
          className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            {['happy', 'neutral', 'sad'].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`p-2 rounded-lg ${
                  mood === m ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'
                }`}
              >
                {m === 'happy' ? '😊' : m === 'neutral' ? '😐' : '😔'}
              </button>
            ))}
          </div>

          <button
            onClick={saveEntry}
            disabled={!currentEntry.trim()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Entry
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <Book className="w-5 h-5 text-indigo-600 mr-2" />
          <h4 className="font-medium">Previous Entries</h4>
        </div>

        <div className="space-y-4">
          {entries.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(entry.date).toLocaleDateString()}
                  <Clock className="w-4 h-4 ml-4 mr-1" />
                  {new Date(entry.date).toLocaleTimeString()}
                </div>
                <span className="text-xl">
                  {entry.mood === 'happy' ? '😊' : entry.mood === 'neutral' ? '😐' : '😔'}
                </span>
              </div>
              {entry.prompt && (
                <div className="text-sm text-indigo-600 mb-2">
                  Prompt: {entry.prompt}
                </div>
              )}
              <p className="text-gray-700">{entry.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MindfulnessJournal;
