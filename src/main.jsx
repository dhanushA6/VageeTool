import React, { useEffect, useState } from "react";
import bgMusicFile from "./sounds/bg.wav";
import cheersSoundFile from "./sounds/cheers.mp3";
import endImg from "./images/end.png";
import helperGif from "./images/helper.gif";
import helperImg from "./images/helper.png";
import muteOnImg from "./images/on.png";
import muteOffImg from "./images/off.png";
import correctSoundFile from "./sounds/match.mp3";
import wrongSoundFile from "./sounds/oops.mp3";
import "./main.css";

const bgMusic = new Audio(bgMusicFile);
const cheersSound = new Audio(cheersSoundFile);
const correctSound = new Audio(correctSoundFile);
const wrongSound = new Audio(wrongSoundFile);

bgMusic.loop = true;

const PeyarSeyaliGame = ({ peyarseyaliData, level }) => {
  const [showSecondImage, setShowSecondImage] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [gameState, setGameState] = useState("initializing"); // ✅ FIXED: Define gameState
  const [score, setScore] = useState(0); // ✅ FIXED: Define score state
  const [timer, setTimer] = useState(0); // ✅ FIXED: Define timer state


  // Initialize background music and autoplay
  useEffect(() => {
    bgMusic.play();
    setAudioStarted(true);
    if (isMuted) {
      bgMusic.pause();
    }

    return () => {
      bgMusic.pause();
    };
  }, []);

  // Timer effect to count time while playing
  useEffect(() => {
    let interval;
    if (gameState === "playing") {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1); // Increment time by 1 every second
      }, 1000);
    } else {
      clearInterval(interval); // Clear interval when the game is not playing
    }

    return () => clearInterval(interval); // Clean up interval on unmount or state change
  }, [gameState]);

  // Initialize game data
  useEffect(() => {
    if (!peyarseyaliData || peyarseyaliData.length === 0) {
      setGameState("initializing");
      return;
    }

    const initializeGame = async () => {
      try {
        await initializeSentenceData(0);
        setGameState("playing");
      } catch (error) {
        console.error("Error initializing game:", error);
        setGameState("initializing");
      }
    };

    initializeGame();
  }, [peyarseyaliData]);


  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      bgMusic.play();
    } else {
      bgMusic.pause();
    }
  };

  // Add this useEffect to log the data when the game is over
  useEffect(() => {
    if (gameState === "gameOver") {
      console.log("Game Over");
      console.log("Final Score: ", score);
      console.log("Level: ", level);
      console.log("Time Taken: ", timer);

      const gameResult = {
        type: "levelComplete",
        data: {
          level: level,
          points: score,
          timeTaken: timer / 10,
        },
      };
      window.parent.postMessage(gameResult, "*");
    }
  }, [gameState, score, level, timer]);

  if (gameState === "initializing") {
    return (
      <div className="loading-container">
        <p>Loading game...</p>
      </div>
    );
  }

  if (gameState === "gameOver") {
    return (
      <div className="final-score-container">
        <p className="final-score">{score}</p>
        <img src={endImg} alt="Game Over" className="final-score-image" />
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="score-left-corner">{score}</div>
      <img
        src={helperGif}
        alt="Additional Control"
        className="top-left-gif"
        onClick={() => setShowSecondImage(true)}
      />
      {showSecondImage && (
        <div className="second-image-container">
          <button
            className="close-button"
            onClick={() => setShowSecondImage(false)}
          >
            ✖
          </button>
          <img src={helperImg} alt="Second Image" className="second-image" />
        </div>
      )}
      <div className="mute-button">
        <img
          src={isMuted ? muteOffImg : muteOnImg}
          alt="Mute Toggle"
          onClick={handleMuteToggle}
        />
      </div>
    </div>
  );
};

export default PeyarSeyaliGame;
