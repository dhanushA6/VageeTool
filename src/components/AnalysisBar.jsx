// src/components/AnalysisBar.js
import React from 'react';


const AnalysisBar = ({ topSuccessChars = [], topErrorChars = [], iskeyBoardEnabled }  ) => {
  return (
    <div className={`analysis-bar ${!iskeyBoardEnabled ? '' : 'small'}`}>
      <div className={`analysis-section1 ${!iskeyBoardEnabled ? '' : 'small'}`}>
        {/* <h4 className="analysis-title">வலிமை எழுத்துக்கள்</h4> */}
        {topSuccessChars.length > 0 ? (
          <div className={`dice-container1 ${!iskeyBoardEnabled ? '' : 'small'}`}>
            {topSuccessChars.map((char, index) => (
              <div key={index} className={`dice-row ${!iskeyBoardEnabled ? '' : 'small'}`}>
                <div className="dice-char correct" style={{ '--count': char.count }}>
                  {char.char}
                  {/* <div className="dice-count">{char.count} முறை</div> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data"></div>
        )}
      </div>

      <div className={`analysis-section2 ${!iskeyBoardEnabled ? '' : 'small'}`}>
        {/* <h4 className="analysis-title">நலிவு எழுத்துக்கள்</h4> */}
        {topErrorChars.length > 0 ? (
            <div className={`dice-container2 ${!iskeyBoardEnabled ? '' : 'small'}`}>
            {topErrorChars.map((char, index) => (
              <div key={index} className={`dice-row ${!iskeyBoardEnabled ? '' : 'small'}`}>
                <div className="dice-char error" style={{ '--count': char.count }}>
                  {char.char}
                  {/* <div className="dice-count">{char.count} முறை</div> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data"> </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisBar;