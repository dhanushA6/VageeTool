// components/KeystrokeHint.js
import React from "react";
import hintBG from '../images/hint.png'

const KeystrokeHint = ({ showKeystrokes, currentTamilChar, currentKeystroke, iskeyBoardEnabled, currentKeystrokes }) => {
  if (!showKeystrokes || !currentTamilChar || !iskeyBoardEnabled) return null;

  return (
    <div className="current-keystroke-hint">
      <div className="hint-content" style={{ backgroundImage: `url(${hintBG})` }}>
        <div className="hint-inner">
          <span className="tamil-char">
            {currentTamilChar === " " ? "Press Space" : currentTamilChar}
          </span>
          {currentTamilChar === " " ? <></>: <span className="arrow">→</span>}
          <span className="english-keys">
            {iskeyBoardEnabled ? currentKeystroke : currentKeystrokes != "Space" ? currentKeystrokes:"" }
          </span>
        </div>
      </div>
    </div>
  );
};

export default KeystrokeHint;