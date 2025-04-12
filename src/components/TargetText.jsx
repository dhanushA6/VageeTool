import React, { useEffect, useRef } from "react";

const TargetText = ({ targetTamilChars, currentItemIndex, currentCharIndex, feedback, iskeyBoardEnabled, level }) => {
  const targetTextRef = useRef(null);
  const currentCharRef = useRef(null);
  
  const activeIndex = !iskeyBoardEnabled ? currentCharIndex : currentItemIndex;

  useEffect(() => {
    if (currentCharRef.current && targetTextRef.current) {
      const container = targetTextRef.current;
      const element = currentCharRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (
        elementRect.top < containerRect.top ||
        elementRect.bottom > containerRect.bottom
      ) {
        const scrollPosition = element.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;
        
        container.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex, targetTamilChars]);

  return (
    <div className="target-text-outer-container">
      {/* Level indicator circle - moved outside the scrollable area */}
      <div className="level-indicator">
        {level}
      </div>
      
      <div className={`target-area ${!iskeyBoardEnabled ? '' : 'small'}`}>
        <div 
          className={`target-text ${!iskeyBoardEnabled ? '' : 'small'}`} 
          ref={targetTextRef}
        >
          {feedback.map((item, index) => (
            <span 
              ref={index === activeIndex ? currentCharRef : null}
              key={index} 
              className={item.status}
            >
              {item.char === " " ? "\u00A0" : item.char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TargetText;