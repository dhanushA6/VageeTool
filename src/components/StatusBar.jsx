// src/components/StatsBar.js
import React from "react"; 
import speed from "../images/speed.png" 
import tool from "../images/toolLogo.png" 
import timer from "../images/timer.png" 
import acc from "../images/accuracy.png"
import pauseIcon from "../images/pause.png"; // You'll need to add a pause icon
import '../styles/StatsBar.css';
import keyBoard from '../images/keyboard.png';
import performace from '../images/performance.png'
import keyBoardOff from '../images/keyBoardOff.png';

const StatsBar = ({ wpm, cpm, accuracy, remainingTime, iskeyBoardEnabled, onShowPerformance, onToggleKeyboard }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
  
  return (
    <div className="stats-bar">
      {/* <div className="logo-container">
        <img
          src={tool}
          alt="Logo"
          className="stats-bar-logo"
        />
      </div> */}

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

        {/* {!iskeyBoardEnabled && (
          <div className="stats-bar__item">
            <img src={acc} alt="Accuracy" className="stats-bar__icon" />
            <span className="stats-bar__label"></span>
            <span className="stats-bar__value">{accuracy}%</span>
          </div>
        )} */}
      </div>
      
      <div className="stats-bar__controls">
        <button 
          className={`stats-bar__button keyboard-button ${iskeyBoardEnabled ? 'active' : ''}`}
          onClick={onToggleKeyboard}
          title="Toggle Keyboard Mode"
        >
          { iskeyBoardEnabled ? <img src={keyBoard} alt="help" />:<img src={keyBoardOff} alt="help" />}
        </button>
       <button
           className={`stats-bar__button keyboard-button ${iskeyBoardEnabled ? 'active' : ''}`}
          onClick={onShowPerformance}
          title="View Letter Performance"
        
        >    {<img src={performace} alt="Performace" />}
        </button>
        {/* <button 
          className="stats-bar__button pause-button"
          onClick={onPause}
          title="Pause"
        >
          <img src={pauseIcon} alt="Pause" className="pause-icon" />
        </button> */}
      </div>
    </div>
  );
};

export default StatsBar; 