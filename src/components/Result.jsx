// src/components/ResultsOverlay.js
import React from 'react';
import '../styles/Result.css';
import performance from '../images/performance.png'

const ResultsOverlay = ({ results, onRetry, onNextTask, isLastTask, onShowPerformance, taskType, accuracy }) => {
  // const shouldShowRetry = taskType === "Test" && accuracy < 75;
  const shouldShowRetry = accuracy < 75;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="results-overlay">
      <div className="results-card">
        <div className="results-header">
          <h2>முடிவுகள்</h2>
          <button 
            className="performance-button"
            onClick={onShowPerformance}
            title="View Letter Performance"
          >
            <img src={performance} alt="Performance" />
          </button>
        </div>
       
        <div className="final-stats">
          <div className="stat-item">
            <span className="stat-label">சொல்/நிமிடம்</span>
            <span className="stat-value">{results.wpm}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">எழுத்து/நிமிடம்</span>
            <span className="stat-value">{results.cpm}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">துல்லியம்</span>
            <span className="stat-value">{results.accuracy}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">நேரம்</span>
            <span className="stat-value">{formatTime(results.timeTaken)}</span>
          </div>
        </div>
        
        <div className="results-actions">
          {shouldShowRetry && (
            <button className="retry-button" onClick={onRetry}>
              மீண்டும் முயற்சிக்க
            </button>
          )}
          {(!isLastTask  && !shouldShowRetry) && (
            <button className="next-button" onClick={onNextTask}>
              அடுத்த பயிற்சி
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsOverlay;