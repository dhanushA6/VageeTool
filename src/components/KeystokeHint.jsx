// components/KeystrokeHint.js
import React from "react";

const KeystrokeHint = ({ showKeystrokes, currentTamilChar, currentKeystroke, iskeyBoardEnabled, currentKeystrokes }) => {
  if (!showKeystrokes || !currentTamilChar) return null;

  return (
    <div className="current-keystroke-hint">
      
      <div className="hint-content">
        <span className="tamil-char">
          {currentTamilChar === " " ? "Press Space" : currentTamilChar}
        </span>
        {currentTamilChar === " " ? <></>: <span className="arrow">→</span>}
        <span className="english-keys">
          {iskeyBoardEnabled ? currentKeystroke : currentKeystrokes != "Space" ? currentKeystrokes:"" }
        </span>
      </div>
    </div>
  );
};

export default KeystrokeHint;