import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MindfulnessPuzzle = ({ onComplete }) => {
  const [tiles, setTiles] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const size = 3; // 3x3 puzzle

  useEffect(() => {
    initializePuzzle();
  }, []);

  const initializePuzzle = () => {
    const newTiles = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    newTiles.push(null); // Empty tile
    shuffleTiles(newTiles);
    setTiles(newTiles);
  };

  const shuffleTiles = (tiles) => {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  };

  const handleTileClick = (index) => {
    if (completed) return;

    const emptyIndex = tiles.indexOf(null);
    if (isAdjacent(index, emptyIndex)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(moves + 1);

      if (isPuzzleComplete(newTiles)) {
        setCompleted(true);
        onComplete && onComplete(50);
      }
    }
  };

  const isAdjacent = (index1, index2) => {
    const row1 = Math.floor(index1 / size);
    const col1 = index1 % size;
    const row2 = Math.floor(index2 / size);
    const col2 = index2 % size;
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  };

  const isPuzzleComplete = (currentTiles) => {
    return currentTiles.every((tile, index) => 
      tile === null ? index === currentTiles.length - 1 : tile === index + 1
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-semibold mb-2">Mindfulness Puzzle</h3>
        <p className="text-gray-600">Arrange the tiles in numerical order</p>
        <div className="text-sm text-gray-500 mt-2">Moves: {moves}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-6">
        {tiles.map((tile, index) => (
          <motion.div
            key={tile || 'empty'}
            whileHover={{ scale: tile ? 1.05 : 1 }}
            whileTap={{ scale: tile ? 0.95 : 1 }}
            onClick={() => handleTileClick(index)}
            className={`aspect-square flex items-center justify-center rounded-lg text-2xl font-bold cursor-pointer
              ${tile ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-gray-100'}
              transition-colors duration-300`}
          >
            {tile}
          </motion.div>
        ))}
      </div>

      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-green-600 font-medium"
        >
          Puzzle Completed! 🎉
        </motion.div>
      )}

      <button
        onClick={initializePuzzle}
        className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reset Puzzle
      </button>
    </div>
  );
};

export default MindfulnessPuzzle;
