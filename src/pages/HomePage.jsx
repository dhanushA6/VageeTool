import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Navigate to game page
    navigate("/game", { state: { startGame: true } });
  };

  const handleHelp = () => {
    navigate("/help");
  };

  return (
    <div className="landing-container">
      {/* Background Image */}
      <div className="background-container">
        {/* Centered GIF */}
        <div className="start-gif1" onClick={handleStartGame}></div>
        {/* Question Mark Logo */}
        <div className="help-logo" onClick={handleHelp}></div>
      </div> 
       <div className="white-box-overlay">
          {/* <p>இது ஒரு தமிழ் வாக்கியம்.</p> Replace with your Tamil sentence */}
        </div>
    </div>
  );
};

export default HomePage;