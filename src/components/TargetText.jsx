// import React, { useEffect, useRef } from "react";

// const TargetText = ({ targetTamilChars, currentItemIndex, currentCharIndex, level, feedback, iskeyBoardEnabled }) => {
//   // Create a ref for the target text container for scrolling
//   const targetTextRef = useRef(null);
//   // Create a ref for the current character element to scroll to
//   const currentCharRef = useRef(null);
  
//   // Determine which index to use based on level
//   const activeIndex = level >= 4 ? currentCharIndex : currentItemIndex;
//    console.log("Hey", activeIndex)
//   // Effect to handle auto-scrolling

//   useEffect(() => {
//     if (currentCharRef.current && targetTextRef.current) {
//       // Get positions
//       const container = targetTextRef.current;
//       const element = currentCharRef.current;
//       const containerRect = container.getBoundingClientRect();
//       const elementRect = element.getBoundingClientRect();

//       // Check if the element is outside the visible area
//       if (
//         elementRect.top < containerRect.top ||
//         elementRect.bottom > containerRect.bottom
//       ) {
//         // Calculate scroll position to center the element
//         const scrollPosition = element.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;
        
//         // Smooth scroll to the position
//         container.scrollTo({
//           top: scrollPosition,
//           behavior: "smooth",
//         });
//       }
//     }
//   }, [activeIndex, targetTamilChars]);

//   return (
//     <div className="target-area">
//       <div 
//         className="target-text" 
//         ref={targetTextRef}
//         style={{
//           position: "relative",
//           overflowY: "auto",
//           maxHeight: "150px",
//           whiteSpace: "pre-wrap",
//           textAlign: "left",
//           scrollBehavior: "smooth"
//         }}
//       > 
//         {(
//         //   targetTamilChars.map((char, index) => (
//         //     <React.Fragment key={index}>
//         //       {/* Insert cursor before the current character */}
//         //       {index === activeIndex && (
//         //         <span 
//         //           className="text-cursor" 
//         //           style={{
//         //             display: "inline-block",
//         //             width: "2px",
//         //             height: "1.5em",
//         //             backgroundColor: "#ebef0e",
//         //             marginRight: "1px",
//         //             verticalAlign: "middle",
//         //             animation: "blink 1s infinite"
//         //           }}
//         //         />
//         //       )}
//         //       <span
//         //         ref={index === activeIndex ? currentCharRef : null}
//         //         className={
//         //           index < activeIndex
//         //             ? "correct"
//         //             : index === activeIndex
//         //             ? feedback[index]?.status || "pending"
//         //             : "pending"
//         //         }
//         //         style={{
//         //           display: "inline-block",
//         //           color: index < activeIndex ? "#1dd047" : "white",
//         //           fontWeight: index === activeIndex ? "bold" : "normal",
//         //           backgroundColor: index === activeIndex ? "rgba(235, 239, 14, 0.3)" : "transparent",
//         //           borderRadius: "3px",
//         //           padding: "0 2px"
//         //         }}
//         //       >
//         //         {char === " " ? "\u00A0" : char}
//         //       </span>
//         //     </React.Fragment>
//         //   ))
//         // ) : (
//           feedback.map((item, index) => (
//             <span 
//               ref={index === activeIndex ? currentCharRef : null}
//               key={index} 
//               className={item.status}
//               style={{
//                 color: item.status === "correct" ? "#1dd047" : 
//                        item.status === "incorrect" ? "#e12e3d" : "white"
//               }}
//             >
//               {item.char === " " ? "\u00A0" : item.char}
//             </span>
//           ))
//         )}
        
//         {/* Add blinking cursor animation */}
//         <style jsx>{`
//           @keyframes blink {
//             0%, 100% { opacity: 1; }
//             50% { opacity: 0; }
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// };

// export default TargetText;


import React, { useEffect, useRef } from "react";

const TargetText = ({ targetTamilChars, currentItemIndex, currentCharIndex, level, feedback, iskeyBoardEnabled }) => {
  const targetTextRef = useRef(null);
  const currentCharRef = useRef(null);
  
  const activeIndex = level >= 4 ? currentCharIndex : currentItemIndex;

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
    <div className={`target-area ${level >= 4 ? '' : 'small'}`}>
      <div 
        className="target-text" 
        ref={targetTextRef}
        style={{
          overflowX: 'hidden', // Disable horizontal scrolling
          whiteSpace: 'pre-wrap', // Keep word wrapping
          wordWrap: 'break-word', // Ensure long words break
          width: '100%' // Take full width of container
        }}
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
  );
};

export default TargetText;