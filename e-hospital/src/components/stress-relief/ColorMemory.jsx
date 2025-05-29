import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ColorMemory = ({ onComplete }) => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [level, setLevel] = useState(1);

  const colors = [
    { name: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600' },
    { name: 'blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { name: 'green', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
    { name: 'yellow', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' }
  ];

  const startGame = () => {
    setIsPlaying(true);
    setLevel(1);
    generateSequence(1);
  };

  const generateSequence = (currentLevel) => {
    const newSequence = Array(currentLevel).fill(0).map(() => 
      colors[Math.floor(Math.random() * colors.length)].name
    );
    setSequence(newSequence);
    showSequence(newSequence);
  };

  const showSequence = async (seq) => {
    setIsShowingSequence(true);
    setPlayerSequence([]);
    
    for (let color of seq) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const element = document.querySelector(`[data-color="${color}"]`);
      element.classList.add('ring-4', 'ring-white', 'scale-110');
      await new Promise(resolve => setTimeout(resolve, 500));
      element.classList.remove('ring-4', 'ring-white', 'scale-110');
    }
    
    setIsShowingSequence(false);
  };

  const handleColorClick = (color) => {
    if (isShowingSequence || !isPlaying) return;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setIsPlaying(false);
      onComplete && onComplete(Math.max(0, (level - 1) * 10));
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      if (level === 5) {
        setIsPlaying(false);
        onComplete && onComplete(50);
        return;
      }

      setTimeout(() => {
        setLevel(level + 1);
        generateSequence(level + 1);
      }, 1000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Color Memory</h3>
        <p className="text-gray-600">Remember the sequence and repeat it</p>
        <div className="text-sm text-gray-500 mt-2">Level: {level}/5</div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
        {colors.map((color) => (
          <motion.button
            key={color.name}
            data-color={color.name}
            whileHover={{ scale: isShowingSequence ? 1 : 1.05 }}
            whileTap={{ scale: isShowingSequence ? 1 : 0.95 }}
            onClick={() => handleColorClick(color.name)}
            className={`h-24 rounded-lg transition-all duration-300 ${color.bg} ${color.hover}`}
            disabled={isShowingSequence}
          />
        ))}
      </div>

      {!isPlaying && (
        <button
          onClick={startGame}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default ColorMemory;
