import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate("/game"); // Redirect to the game page
  };

  return (
    <div className="landing-container">
      {/* Background Image */}
      <div className="background-container">
        {/* Centered GIF */}
        <div className="start-gif1" onClick={handleStartGame}></div>
      </div>
    </div>
  );
};

export default LandingPage;
