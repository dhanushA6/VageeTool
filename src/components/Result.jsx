// src/components/ResultsOverlay.js
import React from 'react';

const ResultsOverlay = ({ results, onRetry, onNextLevel }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="results-overlay">
      <div className="results-card">
      
        <div className="final-stats">
          <div className="stat-item">
            <span className="stat-label">வார்த்தைகள்/நிமிடம்:</span>
            <span className="stat-value">{results.wpm}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">எழுத்துகள்/நிமிடம்:</span>
            <span className="stat-value">{results.cpm}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">துல்லியம்:</span>
            <span className="stat-value">{results.accuracy}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">எடுத்த நேரம்:</span>
            <span className="stat-value">{formatTime(results.timeTaken)}</span>
          </div>
          {/* <div className="stat-item">
            <span className="stat-label">பின்வாங்கல்கள்:</span>
            <span className="stat-value">{results.backspaces}</span>
          </div> */}
        </div>
        
        <div className="results-actions">
          <button className="retry-button" onClick={onRetry}>
            மீண்டும் முயற்சிக்க
          </button>
          <button className="next-button" onClick={onNextLevel}>
            அடுத்த நிலை
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsOverlay;