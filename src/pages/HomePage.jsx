import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import HelpOverlay from '../components/HelpOverlay';
import gameControlIcon from "../images/game-control.gif";
import helperGif from "../images/helper.gif";


const HomePage = () => {
  const navigate = useNavigate();
  const [showHelpOverlay, setShowHelpOverlay] = useState(false); // Move inside component

  const handleStartGame = () => {
    navigate("/game");
  };
  return (
    <div className="landing-container">
      {/* Pure SVG implementation */}
      <svg
        className="landing-svg"
        viewBox="-377.743 -253.855 1283.39 722.908"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Start button - large ellipse */}
        <ellipse
          className="ellipse-large start-button-ellipse"
          cx="264"
          cy="50"
          rx="100"
          ry="85"
          onClick={handleStartGame}
        />

        {/* Game control icon in large ellipse */}
        <image
          className="game-control-icon-large"
          x="170"
          y="44"
          width="200"
          height="170"
          href={gameControlIcon}
          onClick={handleStartGame}
        />

        {/* Helper trigger as SVG ellipse in top-left area */}
        <ellipse
          className="helper-ellipse"
          cx="-320"
          cy="-200"
          rx="50"
          ry="45"
          onClick={() => setShowHelpOverlay(true)}
        />

        {/* Helper gif image in ellipse */}
        <image
          className="helper-gif-icon"
          x="-382"
          y="-245"
          width="100"
          height="90"
          href={helperGif}
          onClick={() => setShowHelpOverlay(true)}
        />
      </svg>

      {showHelpOverlay && (
        <HelpOverlay onClose={() => setShowHelpOverlay(false)} />
      )}
    </div>
  );
};

export default HomePage;
