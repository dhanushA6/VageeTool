import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import { useState, useEffect, useRef } from "react";
import HomePage from "./pages/HomePage";
import ReactDOM from "react-dom/client";
import Vaegee from './pages/Vaegee';
import HelpPage from "./pages/HelpPage"; 

const App = () => {
  const [gameData, setGameData] = useState(null); 
  const [userID, setUserID] = useState("");
  const [levelValue, setLevelValue] = useState(9)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialize = useRef(false);  
  const [mode, setMode] = useState('freeplay'); 

// To prevent multiple API calls


  useEffect(() => {   
    // Simulate userID initialization
    const initializeGame = () => {
      const simulatedUserID = 21; // Must be numeric for backend
      setUserID(simulatedUserID);
      console.log(
        "Initialized with userID:",
        simulatedUserID,
        "levelValue:",
        levelValue
      );
    };
    initializeGame();
  }, []);


  useEffect(() => {
    if (!initialize.current && userID && levelValue&&mode) {
      initialize.current = true;
      fetchGameData(levelValue, userID, mode);
    }
  }, [userID, levelValue, mode]); 





  const fetchGameData = async (level, uid) => {
      try { 
        const payload = {
          mode: mode,
          userid: uid,
          level: level,
        };
        
        const queryString = new URLSearchParams(payload).toString();
        const response = await fetch(`https://academy.karky.in:6128/thamba/game/vaegee/play?${queryString}`);
        const data = await response.json();
        
        // Parse the letters data if it exists
        if (data.letters) {
          try {
            data.letters = JSON.parse(data.letters);
          } catch (error) {
            console.error('Error parsing letters data:', error);
            data.letters = {};
          }
        } else {
          data.letters = {};
        }
        
        setGameData(data);
        setLoading(false);
     
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };



  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Router
      basename={process.env.PUBLIC_URL}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route
          path="/game"
          element={
            <Vaegee 
              gameData={gameData} 
              userID={userID}
              mode={mode}
              level={levelValue}
            />
          }
        />
      </Routes>
    </Router>
  );
};

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

export default App;
