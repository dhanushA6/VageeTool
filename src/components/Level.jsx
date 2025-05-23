// src/components/LevelSelect.js
import React, { useState, useEffect } from 'react';
import levelsData from '../data/levels'; // Import the levels data

const LevelSelect = ({ onStart, onLevelChange }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(false); // Changed to false since we're using local data

  useEffect(() => {
    // Since we're using local data, no need for async loading
    if (levelsData && levelsData.length > 0) {
      setSelectedLevel(levelsData[0]); // Default to first level
    }
  }, []);

  const handleLevelChange = (e) => {
    const levelId = parseInt(e.target.value);
    const level = levelsData.find(l => l.id === levelId);
    setSelectedLevel(level);
    if (onLevelChange) onLevelChange(level);
  };

  const handleStart = () => {
    if (selectedLevel && onStart) {
      onStart(selectedLevel);
    }
  };

  
  if (loading) {
    return <div className="loading">Loading levels...</div>;
  }

  return (
    <div className="level-select-overlay">
      <div className="level-select-card">
 
        <div className="level-dropdown">
          <label htmlFor="level-select">Choose Level:</label>
          <select 
            id="level-select"
            value={selectedLevel?.id || ''}
            onChange={handleLevelChange}
          >
            {levelsData.map(level => (
              <option key={level.id} value={level.id}>
                {level.id}. {level.title}
              </option>
            ))}
          </select>
        </div>
        
        {selectedLevel && (
          <div className="level-info">
            <h3>{selectedLevel.title}</h3>
            <p>{selectedLevel.description}</p>
          </div>
        )}
        
        <button 
          className="start-button"
          onClick={handleStart}
        >
          Start Typing
        </button>
      </div>
    </div>
  );
};

export default LevelSelect;