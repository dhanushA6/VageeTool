import React , {useState} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import HelpOverlay from '../components/HelpOverlay';


const HomePage = () => {
  const navigate = useNavigate(); 
  const [showHelpOverlay, setShowHelpOverlay] = useState(false); // Move inside component


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
        {/* <div className="help-logo" onClick={handleHelp}></div>  */} 
        <div className="help-logo" onClick={() => setShowHelpOverlay(true)}></div>
      </div> 
       <div className="white-box-overlay">
          {/* <p>இது ஒரு தமிழ் வாக்கியம்.</p> Replace with your Tamil sentence */}
        </div> 
         {showHelpOverlay && (
        <HelpOverlay onClose={() => setShowHelpOverlay(false)} />
      )}
    </div>
  );
};

export default HomePage;