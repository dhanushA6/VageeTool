// src/components/AnalysisBar.js
import React from 'react';


const AnalysisBar = ({ topSuccessChars = [], topErrorChars = [], level }  ) => {
  return (
    <div className={`analysis-bar ${level >= 4 ? '' : 'small'}`}>
      <div className="analysis-section">
        <h4 className="analysis-title">வலிமை எழுத்துக்கள்</h4>
        {topSuccessChars.length > 0 ? (
          <div className="dice-container">
            {topSuccessChars.map((char, index) => (
              <div key={index} className="dice-row">
                <div className="dice-char correct" style={{ '--count': char.count }}>
                  {char.char}
                  {/* <div className="dice-count">{char.count} முறை</div> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">இல்லை</div>
        )}
      </div>

      <div className="analysis-section">
        <h4 className="analysis-title">நலிவு எழுத்துக்கள்</h4>
        {topErrorChars.length > 0 ? (
          <div className="dice-container">
            {topErrorChars.map((char, index) => (
              <div key={index} className="dice-row">
                <div className="dice-char error" style={{ '--count': char.count }}>
                  {char.char}
                  {/* <div className="dice-count">{char.count} முறை</div> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data"> இல்லை</div>
        )}
      </div>
    </div>
  );
};

export default AnalysisBar;