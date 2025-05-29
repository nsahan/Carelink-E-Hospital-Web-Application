import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ZenGarden = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pattern, setPattern] = useState('waves');
  const [progress, setProgress] = useState(0);

  const patterns = {
    waves: (ctx, x, y) => {
      ctx.beginPath();
      ctx.moveTo(x - 20, y);
      ctx.quadraticCurveTo(x, y - 20, x + 20, y);
      ctx.strokeStyle = '#4F46E5';
      ctx.stroke();
    },
    circles: (ctx, x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#4F46E5';
      ctx.stroke();
    },
    lines: (ctx, x, y) => {
      ctx.beginPath();
      ctx.moveTo(x - 15, y - 15);
      ctx.lineTo(x + 15, y + 15);
      ctx.strokeStyle = '#4F46E5';
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    patterns[pattern](canvas.getContext('2d'), x, y);
    updateProgress();
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    patterns[pattern](canvas.getContext('2d'), x, y);
    updateProgress();
  };

  const updateProgress = () => {
    setProgress(prev => {
      const newProgress = Math.min(prev + 1, 100);
      if (newProgress === 100) {
        onComplete && onComplete(50);
      }
      return newProgress;
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setProgress(0);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Zen Garden</h3>
        <p className="text-gray-600 mb-4">Create peaceful patterns to calm your mind</p>
        
        <div className="flex space-x-4 mb-6">
          {Object.keys(patterns).map(p => (
            <button
              key={p}
              onClick={() => setPattern(p)}
              className={`px-4 py-2 rounded-lg ${
                pattern === p 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          className="border rounded-lg cursor-crosshair w-full"
        />
        
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2">
          <div className="text-sm text-gray-600">Progress: {progress}%</div>
          <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={clearCanvas}
        className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
        Clear Canvas
      </button>
    </div>
  );
};

export default ZenGarden;
