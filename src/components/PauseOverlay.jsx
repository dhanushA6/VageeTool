// src/components/PauseOverlay.js
import React from "react";

const PauseOverlay = ({ onResume, onRestart }) => {
  return (
    <div className="pause-overlay">
      <div className="pause-content">
        <h2>இடைநிறுத்தப்பட்டது</h2>
        <div className="pause-buttons">
          <button className="resume-button" onClick={onResume}>
            தொடரவும்
          </button>
          <button className="restart-button" onClick={onRestart}>
            மீண்டும் தொடங்கு
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseOverlay;