// src/components/StatsBar.js
import React from 'react';


const StatsBar = ({ wpm, cpm, accuracy, remainingTime }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stats-bar">
      <div className="logo-container">
        <img src="../images/tool_logo.png" alt="Logo" className="stats-bar-logo" />
      </div>
      
      <div className="stats-container">
        <div className="stats-bar__item">
          <span className="stats-bar__label"> வார்த்தைகள்/நிமிட:</span>
          <span className="stats-bar__value">{wpm}</span>
        </div>
        <div className="stats-bar__item">
          <span className="stats-bar__label"> எழுத்துகள்/நிமிட:</span>
          <span className="stats-bar__value">{cpm}</span>
        </div>
        <div className="stats-bar__item">
          <span className="stats-bar__label">துல்லியம்:</span>
          <span className="stats-bar__value">{accuracy}%</span>
        </div>
        <div className="stats-bar__item">
          <span className="stats-bar__label">நேரம்:</span>
          <span className={`stats-bar__value ${remainingTime < 30 ? 'stats-bar__value--critical' : ''}`}>
            {formatTime(remainingTime)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;