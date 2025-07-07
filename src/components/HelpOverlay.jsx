import React from 'react';
import '../styles/HelpOverlay.css';
import helpVideo from "../images/help.mp4"; 

const HelpOverlay = ({ onClose }) => {
  // Video dimensions
  const videoWidth = 900;
  const videoHeight = 550;

  // SVG viewBox dimensions
  const viewBoxWidth = 1095.322;
  const viewBoxHeight = 594.01;
  const viewBoxX = -1.261;
  const viewBoxY = -121.766;

  // Centered position with margin
  const margin = 30;
  const x = (viewBoxWidth - videoWidth) / 2 + viewBoxX;
  const y = (viewBoxHeight - videoHeight) / 2 + viewBoxY;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
        background: "#000"
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Centered Video with margin */}
      <foreignObject
        x={x}
        y={y}
        width={videoWidth - margin}
        height={videoHeight - margin}
      >
        <video
          xmlns="http://www.w3.org/1999/xhtml"
          autoPlay
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "10px",
            backgroundColor: "#000"
          }}
        >
          <source src={helpVideo} type="video/mp4" />
        </video>
      </foreignObject>

      {/* Close Button */}
      <g
        onClick={onClose}
        style={{ cursor: "pointer" }}
        className="close-button-group"
      >
        <circle
          cx="25"
          cy="-90"
          r="20"
          fill="rgba(0, 0, 0, 0.5)"
          stroke="white"
          strokeWidth="1.5"
        />
        <line
          x1="15"
          y1="-100"
          x2="35"
          y2="-80"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="35"
          y1="-100"
          x2="15"
          y2="-80"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default HelpOverlay;
