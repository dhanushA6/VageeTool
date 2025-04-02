import React from "react";

const Keyboard = ({ keys, renderKey }) => {
  return (
    <div className="keyboard reference-keyboard">
      {keys.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key) => renderKey(key))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;