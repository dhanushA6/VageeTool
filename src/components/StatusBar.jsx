// src/components/StatsBar.js
import React from "react"; 
import speed from "../images/speed.png" 
import tool from "../images/toolLogo.png" 
import timer from "../images/timer.png" 
import acc from "../images/accuracy.png"
import pauseIcon from "../images/pause.png"; // You'll need to add a pause icon
import '../styles/StatsBar.css';

const StatsBar = ({ wpm, cpm, accuracy, remainingTime, iskeyBoardEnabled, onPause, onShowPerformance }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
  
  return (
    <div className="stats-bar">
      <div className="logo-container">
        <img
          src={tool}
          alt="Logo"
          className="stats-bar-logo"
        />
      </div>

      <div className="stats-container"> 
        <div className="stats-bar__item">
          <img src={timer} alt="Time" className="stats-bar__icon" />
          <span className="stats-bar__label"></span>
          <span
            className={`stats-bar__value ${
              remainingTime < 30 ? "stats-bar__value--critical" : ""
            }`}
          >
            {formatTime(remainingTime)}
          </span>
        </div>
        {(iskeyBoardEnabled == false)? (
          <div className="stats-bar__item">
            <img src={speed} alt="Speed" className="stats-bar__icon" />
            <span className="stats-bar__label"> </span>
            <span className="stats-bar__value">{wpm}</span>
          </div>
        ) : (
          <div className="stats-bar__item">
            <img src={speed} alt="Speed" className="stats-bar__icon" />
            <span className="stats-bar__label"></span>
            <span className="stats-bar__value">{cpm}</span>
          </div>
        )}

        {!iskeyBoardEnabled && (
          <div className="stats-bar__item">
            <img src={acc} alt="Accuracy" className="stats-bar__icon" />
            <span className="stats-bar__label"></span>
            <span className="stats-bar__value">{accuracy}%</span>
          </div>
        )}
      </div>
      
      <div className="stats-bar__controls">
        <button 
          className="stats-bar__button performance-button"
          onClick={onShowPerformance}
          title="View Letter Performance"
        >
          📊
        </button>
        <button 
          className="stats-bar__button pause-button"
          onClick={onPause}
          title="Pause"
        >
          <img src={pauseIcon} alt="Pause" className="pause-icon" />
        </button>
      </div>
    </div>
  );
};

export default StatsBar; 