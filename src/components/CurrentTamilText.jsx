// components/CurrentTamilText.js
import React, { useRef, useEffect } from "react";

const CurrentTamilText = ({ currentTamilText, showForLevel, currentCharIndex }) => {
  const textContainerRef = useRef(null);
  
  // Auto-scroll effect when text changes or current character index changes
  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [currentTamilText, currentCharIndex]);

  if (!showForLevel) return null;

  // Prepare text with cursor
  const renderTextWithCursor = () => {
    if (!currentTamilText) {
      return (
        <span className="empty-text">(Start Typing...)
          <span className="typing-cursor"></span>
        </span>
      );
    }

    // Split text to insert cursor at current position
    const beforeCursor = currentTamilText.substring(0, currentCharIndex);
    // const afterCursor = currentTamilText.substring(currentCharIndex);

    return (
      <>
        {beforeCursor}
        <span className="typing-cursor"></span>
        {/* {afterCursor} */}
      </>
    );
  };

  return (
    <div className="current-tamil-container">

      <div 
        className="current-tamil-text" 
        ref={textContainerRef}
      >
        {renderTextWithCursor()}
      </div>
    </div>
  );
};

export default CurrentTamilText;