import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CalmnessGame = ({ onComplete }) => {
  const [circles, setCircles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (circles.length < 5) {
          addCircle();
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
      onComplete && onComplete(score);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const addCircle = () => {
    const newCircle = {
      id: Date.now(),
      x: Math.random() * (window.innerWidth - 100),
      y: Math.random() * (window.innerHeight - 100),
      size: Math.random() * 30 + 20,
    };
    setCircles(prev => [...prev, newCircle]);
  };

  const handleCircleClick = (id) => {
    setCircles(prev => prev.filter(circle => circle.id !== id));
    setScore(prev => prev + 10);
  };

  return (
    <div className="relative h-[400px] bg-gray-50 rounded-lg overflow-hidden">
      <div className="absolute top-4 right-4 space-y-2 text-right">
        <div className="text-2xl font-bold text-blue-600">Score: {score}</div>
        <div className="text-gray-600">Time: {timeLeft}s</div>
      </div>

      {!gameActive && timeLeft === 60 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <button
            onClick={() => setGameActive(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {circles.map(circle => (
        <motion.div
          key={circle.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          style={{
            position: 'absolute',
            left: circle.x,
            top: circle.y,
            width: circle.size,
            height: circle.size,
            borderRadius: '50%',
            backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
            cursor: 'pointer',
          }}
          onClick={() => handleCircleClick(circle.id)}
          whileHover={{ scale: 1.1 }}
        />
      ))}
    </div>
  );
};

export default CalmnessGame;
