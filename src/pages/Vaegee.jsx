import React, { useState, useEffect, useRef } from "react";
import tamilMapping from "../data/tamilMapping.json";
import "../styles/GamePage.css";
import helperKey from "../data/feedback.json";
import shiftMap from "../data/shiftMap";
import SpecialKey from "../data/SpecialKey";
import Keyboard from "../components/Keyboard";
import keyBoardLabel from "../data/keyBoardLabel";
import ResultsOverlay from "../components/Result";
import StatsBar from "../components/StatusBar";
import levels from "../data/levels";
import CurrentTamilText from "../components/CurrentTamilText";
import TargetText from "../components/TargetText";
import KeystrokeHint from "../components/KeystokeHint"; 
import PerformanceOverlay from '../components/PerformanceOverlay';
import speed from "../images/speed.png" 
import tool from "../images/toolLogo.png" 
import timer from "../images/timer.png" 
import acc from "../images/accuracy.png"
import pauseIcon from "../images/pause.png";
import backgroundImage from "../images/WaykeyBG.png";
import hintBG from "../images/hint.png";
import landingPageBackground from "../images/LandingPage.jpg";
import gameControlGif from "../images/game-control.gif";
import helperGif from "../images/helper.gif";
import helpPageBackground from "../images/Help_Page.jpg"; 
import HelpOverlay from "../components/HelpOverlay";
// Create a reverse mapping for checking valid inputs

const reverseMapping = {};
Object.entries(tamilMapping).forEach(([english, tamil]) => {
  if (!reverseMapping[tamil]) {
    reverseMapping[tamil] = [];
  }
  reverseMapping[tamil].push(english);
});

const Vaegee = ({ gameData, userID, mode, level, onGameDataUpdate }) => {
  const [gameState, setGameState] = useState("playing");
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [targetText, setTargetText] = useState("vanakkam");
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [userBackspaces, setUserBackspaces] = useState(0);
  const [currentTamilText, setCurrentTamilText] = useState("");
  const [showKeystrokes, setShowKeystrokes] = useState(true);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);  

  const [isPaused, setIsPaused] = useState(false);
  const [isHelpEnabled, setIsHelpEnabled] = useState(true);

  // Change to a countdown timer
  const INITIAL_TIME_SECONDS = 120; // 10 minutes by default
  const [remainingTime, setRemainingTime] = useState(INITIAL_TIME_SECONDS);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0); 
  const [timeTaken, setTimeTaken] = useState(0);

  // Character error and success tracking - reset when changing text
  const [charErrors, setCharErrors] = useState({});
  const [charSuccess, setCharSuccess] = useState({});
  const [visitedPositions, setVisitedPositions] = useState(new Set());

  // Initialize keyboard mode as true by default
  const [iskeyBoardEnabled, setIskeyBoardEnabled] = useState(true);

  const [keystrokeSequence, setKeystrokeSequence] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [highlightedKey, setHighlightedKey] = useState("");
  const [shiftOn, setShiftOn] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState({ key: "", status: "" });
  const [currentKeystroke, setCurrentKeystroke] = useState("");

 
  // Timer ref for cleanup
  const timerRef = useRef(null);
  const keyFeedbackTimerRef = useRef(null);
  const inputRef = useRef(null);
  const [showPerformanceOverlay, setShowPerformanceOverlay] = useState(false);
  const [currentLevelMistakes, setCurrentLevelMistakes] = useState({});
  const [currentLevelCorrect, setCurrentLevelCorrect] = useState({});

  const [letters, setLetters] = useState(gameData?.letters || {});
  const [completedTasks, setCompletedTasks] = useState([]); 

  const [showHelpOverlay, setShowHelpOverlay] = useState(false);

  
  // Update letters when gameData changes
  useEffect(() => {
    if (gameData?.letters) {
      setLetters(gameData.letters);
    }
  }, [gameData]);

  // Initialize game
  const startGame = () => {
    setGameState("playing");
    setIsPaused(false);

    // Set keyboard mode based on current task type
    if (gameData?.contents?.[currentTaskIndex]?.type === "Test") {
      setIskeyBoardEnabled(false);
    } else {
      setIskeyBoardEnabled(true);
    }

    // Reset all typing-related states
    setUserInput("");
    setFeedback([]);
    setCorrectCount(0);
    setTotalCount(0);
    setUserBackspaces(0);
    setCurrentTamilText("");
    setCurrentCharIndex(0);
    setCurrentItemIndex(0);
    setCurrentKeyIndex(0);
    setIsCompleted(false);
    setIsTyping(false);
    setRemainingTime(INITIAL_TIME_SECONDS);
    setWpm(0);
    setCpm(0);
    setTimeTaken(0);
    setAccuracy(0);
    setCharErrors({});
    setCharSuccess({});
    setVisitedPositions(new Set());
    setCurrentLevelMistakes({});
    setCurrentLevelCorrect({});

    const tamilChars = parseTamilText(targetText) || [];
    const initialFeedback = tamilChars.map((char) => ({
      char: char || '',
      status: "pending",
      keystrokes: getKeystrokesForTamil(char) || "N/A",
    }));
    setFeedback(initialFeedback);
    setTotalCount(tamilChars.length); 
  };

  const retryLevel = () => {
    startGame();
  };

  const completeGame = () => { 
    // First update all metrics 
    if (currentTaskIndex == gameData.contents.length-1 && accuracy >=75 && timeTaken !=0) {  
      console.log("Hi m this complete game");
      storeTaskCompletion();
      setGameState("completed");
        
      // Only send completion message to parent if not in freeplay mode
      if (mode !== "freeplay") {
        // Calculate average accuracy for all completed tasks
        const avgAccuracy = completedTasks.length
          ? Math.round(completedTasks.reduce((sum, t) => sum + Number(t.accuracy), 0) / completedTasks.length)
          : accuracy;
        console.log(avgAccuracy)
        const gameResult = {
          type: "levelComplete",
          data: {
            level: level,
            timeTaken: timeTaken,
            points: avgAccuracy, // Using average accuracy as points
          },
        };
        
        window.parent.postMessage(gameResult, "*");
      }
    }
    updateMetrics();
    // Then stop the timer and set completion state
    clearInterval(timerRef.current);
    setIsCompleted(true);
    setGameState("completed");
  };

  const getLevelById = (id) => {
    const level = levels.find((level) => level.id === id);
    if (!level) {
      throw new Error(`Level with ID ${id} not found`);
    }
    return level;
  };


  const parseTamilText = (text) => {
  if (!text) return [];

  const result = [];
  let i = 0;

  // Include both "க்ஷ" and "க்ஷ்" to catch both cases
  const specialClusters = ["க்ஷௌ", "க்ஷோ", "க்ஷொ", "க்ஷை", "க்ஷே", "க்ஷெ", "க்ஷூ", "க்ஷு", "க்ஷீ", "க்ஷி", "க்ஷா", "ஸ்ரீ", "க்ஷ்", "க்ஷ"]

  while (i < text.length) {
    try {
      let matched = false;

      for (const cluster of specialClusters) {
        if (text.slice(i, i + cluster.length) === cluster) {
          result.push(cluster);
          i += cluster.length;
          matched = true;
          break;
        }
      }

      if (matched) continue;

      if (text[i] === " ") {
        result.push(" ");
        i += 1;
      } else if (
        i + 1 < text.length &&
        /[\u0bbe-\u0bcd\u0bd7]/.test(text[i + 1])
      ) {
        result.push(text[i] + text[i + 1]);
        i += 2;
      } else {
        result.push(text[i]);
        i += 1;
      }
    } catch (error) {
      console.error("Error parsing Tamil text:", error);
      i += 1;
    }
  }
  // console.log("R", result)
  return result;
};

  

  // Function to get possible English keystrokes for a Tamil character
  const getKeystrokesForTamil = (tamilChar) => {
    if (tamilChar === " ") return "space";
    const keystrokes = helperKey[tamilChar] || [];
    return keystrokes.length > 0 ? keystrokes[0] : "N/A";
  };

  // Initialize keystroke sequence and highlight first key
  useEffect(() => {
    const sequence = tamilToKeystrokes(targetText);
    setKeystrokeSequence(sequence);
    setCurrentItemIndex(0);
    setCurrentKeyIndex(0);

    // Reset other states when target text changes
    setUserInput("");
    setFeedback([]);
    setCorrectCount(0);
    setUserBackspaces(0);
    setCurrentTamilText("");
    setCurrentCharIndex(0);
    setIsTyping(false);
    setIsCompleted(false);
    setIsTimeUp(false);
    setRemainingTime(INITIAL_TIME_SECONDS);

    // Initialize feedback based on target text
    const tamilChars = parseTamilText(targetText) || [];
    const initialFeedback = tamilChars.map((char) => ({
      char: char || '',
      status: "pending",
      keystrokes: getKeystrokesForTamil(char) || "N/A",
    }));
    setFeedback(initialFeedback);
    setTotalCount(tamilChars.length);
  }, [targetText, gameState]); 


  useEffect(()=>{
      if (gameState === "playing"){
        updateMetrics();
        setIsCompleted(true);
        clearInterval(timerRef.current);
        completeGame(); 
      }
       
  }, [isTimeUp])

  // Auto-focus input when not in keyboard mode
  useEffect(() => {
    if (!iskeyBoardEnabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [iskeyBoardEnabled, isCompleted, isTimeUp]);

  // Update highlighted key when sequence or position changes
  useEffect(() => {
    if (
      keystrokeSequence.length > 0 &&
      currentItemIndex < keystrokeSequence.length
    ) {
      const currentSequence = keystrokeSequence[currentItemIndex];
      if (currentKeyIndex < currentSequence.length) {
        const keyToHighlight = currentSequence[currentKeyIndex];

        const isUpperCase =
          /[A-Z!@#$%^&*()_+]/.test(keyToHighlight) && keyToHighlight !== " ";
        setShiftOn(isUpperCase);
        setHighlightedKey(keyToHighlight);

        // Update the current keystroke hint
        setCurrentKeystroke(currentSequence);
      }
    } else if (
      gameState === "playing" &&
      (currentItemIndex >= keystrokeSequence.length &&
      !isCompleted || isTimeUp)
    ) {
     
      // All keys have been typed correctly
      updateMetrics();
      setIsCompleted(true);
      clearInterval(timerRef.current);
      completeGame();
    }
  }, [
    keystrokeSequence,
    currentItemIndex,
    currentKeyIndex,
    isCompleted,
    keyFeedback,
    shiftOn,
  ]); 

  // const handlePause = () => {
  //   setIsPaused(true);
  //   clearInterval(timerRef.current);
  // };

  // const handleResume = () => {
  //   setIsPaused(false);
  //   if (isTyping && !isCompleted && !isTimeUp) {
  //     timerRef.current = setInterval(() => {
  //       setRemainingTime((prev) => {
  //         if (prev <= 1) {
  //           clearInterval(timerRef.current);
  //           setIsTimeUp(true);
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);
  //   }
  // };
   

  // const handleRestart = () => {
  //   setIsPaused(false);
  //   retryLevel();
  // };

  const tamilToKeystrokes = (tamilText) => {
    const tamilChars = parseTamilText(tamilText);
    let keystrokeSequence = [];
    for (let i = 0; i < tamilChars.length; i++) {
      const char = tamilChars[i];
      const vallinamLetters = ["க்", "ச்", "ட்", "த்", "ப்", "ற்", " "];
      const prevChar = i > 0 ? tamilChars[i - 1] : null;
      const nexChar = i <tamilChars.length-1? tamilChars[i +1] : null;
      if (char === " ") {
        keystrokeSequence.push([" "]);
        continue;
      } 
      const taLetters = ["ட", "டா", "டி", "டீ", "டு", "டூ", "டெ", "டே", "டை", "டொ", "டோ", "டௌ"];
      const dhaLetters =["த", "தா", "தி", "தீ", "து", "தூ", "தெ", "தே", "தை", "தொ", "தோ", "தௌ"]; 
      const paLetters = [ "ப", "பா", "பி", "பீ", "பு", "பூ", "பெ", "பே", "பை", "பொ", "போ", "பௌ"]; 
      const RaLetters = ["ற", "றா", "றி", "றீ", "று", "றூ", "றெ", "றே", "றை", "றொ", "றோ", "றௌ"];
      const chaLetters = ["ச", "சா", "சி", "சீ", "சு", "சூ", "செ", "சே", "சை", "சொ", "சோ", "சௌ"];
      const kaLetters =  ['க', 'கா', 'கி', 'கீ', 'கு', 'கூ', 'கெ', 'கே', 'கை', 'கொ', 'கோ', 'கௌ'];
      const naLetters = ['ந', 'நா', 'நி', 'நீ', 'நு', 'நூ', 'நெ', 'நே', 'நை', 'நொ', 'நோ', 'நௌ'];
      const nyaSeries = [
        "ஞ", "ஞா", "ஞி", "ஞீ",
        "ஞு", "ஞூ", "ஞெ", "ஞே", "ஞை",
        "ஞொ", "ஞோ", "ஞௌ"
        ];

      const mappings = helperKey[char];
      if (prevChar &&!( vallinamLetters.includes(prevChar)) && kaLetters.includes(char)) { 
        keystrokeSequence.push(mappings[1].split(""));
        continue;
      }
       if (prevChar && prevChar =='ஞ்' && nyaSeries.includes(char)) { 
        keystrokeSequence.push(mappings[1].split(""));
        continue;
      }
      if (prevChar &&!( vallinamLetters.includes(prevChar)) && taLetters.includes(char)) { 
        keystrokeSequence.push(mappings[1].split(""));
        continue;
      }
      if (prevChar &&!(  vallinamLetters.includes(prevChar)) && dhaLetters.includes(char)) {
        keystrokeSequence.push(mappings[1].split(""));
        continue;
      }  

      if (prevChar && chaLetters.includes(char) && prevChar === "ஞ்"){
     
        const temp = mappings[0].split("")
        temp.shift(); 
        temp.shift(); 
        // temp.unshift("j");
        keystrokeSequence.push(temp);
         continue;
     } 

      if (prevChar &&!(  vallinamLetters.includes(prevChar)) && chaLetters.includes(char)) {
        keystrokeSequence.push(mappings[1].split(""));
        continue;
      } 
    
      if (prevChar&&!(vallinamLetters.includes(prevChar)) && paLetters.includes(char)) {
        keystrokeSequence.push(mappings[1].split(""));
        continue;
      }   

      if (prevChar && RaLetters.includes(char) && prevChar === "ன்"){
         const temp = mappings[0].split("")
         temp.unshift("d");
          keystrokeSequence.push(temp);
          continue;
      } 
   

     if (nexChar && (RaLetters.includes(nexChar) &&char == "ற்")){
        keystrokeSequence.push(["t"]); 
        continue;
     } 

    if (
        (i === 0 || prevChar === " ") && (naLetters.includes(char)) && (nexChar !=" " &&i !=tamilChars.length-1)
      ){ 
        const temp = mappings[0].split("")
        temp.shift(); 
        temp.unshift('n');
        keystrokeSequence.push(temp); 
        continue;
      }

 


      // Get the first recommended mapping from feedback.json

      if (mappings && mappings.length > 0) {
        keystrokeSequence.push(mappings[0].split("")); // Split into individual keys
      } else {
        // Fallback - try to find in reverse mapping
        const reverseMaps = reverseMapping[char];
        if (reverseMaps && reverseMaps.length > 0) {
          keystrokeSequence.push(reverseMaps[0].split(""));
        } else {
          keystrokeSequence.push(["?"]); // Unknown character
        }
      }
    }
  
    return keystrokeSequence;
  };


  const showKeyFeedback = (key, status) => {
    setKeyFeedback({ key, status });
    clearTimeout(keyFeedbackTimerRef.current);

    // Extended feedback duration for better visibility
    const feedbackDuration = status === "incorrect" ? 500 : 300;

    keyFeedbackTimerRef.current = setTimeout(
      () => setKeyFeedback({ key: "", status: "" }),
      feedbackDuration
    );
  };

  const renderKey = (key) => {
    const isSpecialKey = SpecialKey.includes(key);
    const displayKey = shiftOn ? shiftMap[key] || key.toUpperCase() : key;

    // Only highlight the current expected key
    const isHighlighted = displayKey === highlightedKey;

    // If this key has feedback (correct/incorrect), show that status
    const hasFeedback = keyFeedback.key === displayKey || keyFeedback.key === key;

    // Special case for shift key
    const isShiftHighlighted = shiftOn && key === "Shift"; 
    const isSpace = key === " "; 

    return (
      <button
        key={key}
        className={`key 
          ${isHighlighted || isShiftHighlighted ? "highlighted" : ""}
          ${hasFeedback ? keyFeedback.status + "-feedback" : ""}
          ${isSpecialKey ? "special-key" : ""}
          ${isSpace ? "space-key" : ""}
        `}
        tabIndex={-1}
      >
        {!isSpecialKey && (
          <>
            <div className="main-char">{displayKey}</div>
            <div className="shifted-char">{shiftMap[key] || ""}</div>
          </>
        )}
        {isSpecialKey && key}
      </button>
    );
  };
  
  // Handle key press for keyboard mode 
  const handleKeyPress = (key) => {
    // Early return checks
    if (!iskeyBoardEnabled || isCompleted || isTimeUp || gameState !== "playing" || showPerformanceOverlay ) {
      return;
    }
  
    // Start timer on first keystroke
    if (!isTyping && !isCompleted && !isTimeUp) {
      setIsTyping(true);
    }
  
    // Prevent default behavior for space key
    if (key === " ") {
      document.activeElement.blur();
    }
  
    // Safety checks for arrays and indices
    if (
      !Array.isArray(keystrokeSequence) ||
      !Array.isArray(feedback) ||
      currentItemIndex >= keystrokeSequence.length ||
      currentItemIndex >= feedback.length
    ) {
      console.warn("Invalid state in handleKeyPress");
      return;
    }
  
    const currentSequence = keystrokeSequence[currentItemIndex];
    if (!Array.isArray(currentSequence)) {
      console.warn("Invalid sequence at currentItemIndex");
      return;
    } 
  
    // Check if we've exceeded current sequence bounds
    if (currentKeyIndex >= currentSequence.length) {
      console.warn("Current key index out of bounds");
      return;
    }
  
    const expectedKey = currentSequence[currentKeyIndex];
    const tamilChars = parseTamilText(targetText) || [];
    const currentTamilChar = tamilChars[currentItemIndex];

    // Get the actual key to compare, considering shift state
    // const actualKey = shiftOn ? key.toUpperCase() : key;
    const actualKey =  key;
    // const expectedKeyWithShift = shiftOn ? expectedKey.toUpperCase() : expectedKey;
    const expectedKeyWithShift = shiftOn ? expectedKey.toUpperCase() : expectedKey;

    // Check if shift is required for this key
    const requiresShift = /[A-Z!@#$%^&*()_+]/.test(expectedKey) && expectedKey !== " ";
    const isShiftCorrect = requiresShift ? shiftOn : true;
  
    if (actualKey === expectedKeyWithShift && isShiftCorrect) {
      // Correct key pressed
      showKeyFeedback(key, "correct");
  
      // Create new feedback array with immutability
      const newFeedback = feedback.map((item, index) => {
        if (index === currentItemIndex) {
          return {
            ...item,
            status: currentKeyIndex === currentSequence.length - 1 ? "correct" : item.status
          };
        }
        return item;
      });
  
      // If this is the last key in the sequence for this Tamil character
      if (currentKeyIndex === currentSequence.length - 1) {
        // Update character success tracking only if not visited before
        if (currentTamilChar && currentTamilChar !== " "  && currentTamilChar != '.'&& !visitedPositions.has(currentItemIndex)) {
          updatePerformanceData(currentTamilChar, true);
          setCharSuccess((prev) => ({
            ...prev,
            [currentTamilChar]: (prev[currentTamilChar] || 0) + 1,
          }));
          setVisitedPositions(prev => new Set([...prev, currentItemIndex]));

          // Update current level correct letters
          setCurrentLevelCorrect(prev => ({
            ...prev,
            [currentTamilChar]: (prev[currentTamilChar] || 0) + 1
          }));
        }
  
        // Move to the next Tamil character
        setCurrentItemIndex((prev) => prev + 1);
        setCurrentKeyIndex(0);
  
        // Update current character index for display
        setCurrentCharIndex((prev) => prev + 1);
  
        // Update the Tamil text being built
        setCurrentTamilText((prev) => {
          const newText = prev + (currentTamilChar || '');
          return newText;
        });

        // Update userInput with the current sequence
        setUserInput(prev => {
          const currentSequenceStr = currentSequence.join('');
          return prev + currentSequenceStr;
        });
  
        // Update correct count if we completed a character
        setCorrectCount((prev) => prev + 1);
      } else {
        // Move to next key in the same sequence
        setCurrentKeyIndex((prev) => prev + 1);
      }
  
      setFeedback(newFeedback);
  
      // Check if completed
      if (
        currentItemIndex >= keystrokeSequence.length - 1 &&
        currentKeyIndex === currentSequence.length - 1
      ) {
        updateMetrics();
        setIsCompleted(true);
        completeGame();
        clearInterval(timerRef.current);
      }
    } else {
      // Incorrect key pressed
      showKeyFeedback(key, "incorrect");
      
      // Update error tracking only if not visited before
      if (currentTamilChar && currentTamilChar !== " " && currentTamilChar != '.' && !visitedPositions.has(currentItemIndex)) {
        updatePerformanceData(currentTamilChar, false);
        setCharErrors((prev) => ({
          ...prev,
          [currentTamilChar]: (prev[currentTamilChar] || 0) + 1,
        }));
        setVisitedPositions(prev => new Set([...prev, currentItemIndex]));

        // Update current level mistakes
        setCurrentLevelMistakes(prev => ({
          ...prev,
          [currentTamilChar]: (prev[currentTamilChar] || 0) + 1
        }));
      }
    }
  
    // Update metrics after each keystroke
    updateMetrics();
  
    // Handle Shift release
    if (shiftOn && key !== "Shift") {
      setShiftOn(false);
    }
  };

  const tokenizeInput = (input) => {
    let tokens = [];
    let i = 0;
    while (i < input.length) {
      if (input[i] === " ") {
        tokens.push({ english: " ", tamil: " " });
        i++;
        continue;
      }

      if (i + 1 < input.length && input[i] === "t" && input[i + 1] === "R") {
        tokens.push({ english: "t", tamil: "ற்" });
        i++;
        continue;
      }

      if ( i != 0 && i> +1 < input.length && input[i] == "n" && input[i+1] == "j" && i-1>0 && input[i-1] != " ") {  
        
        let matched = false;
        // Try to match the longest possible sequence first
        for (let len = Math.min(4, input.length - i); len > 0; len--) {
          const chunk = input.substring(i+2, i + len);
          // Check if this is a valid combination after ஞ்  
          if (chunk && tamilMapping["c" + chunk]) {
            // tokens.push({ english: "nj"+chunk, tamil: "ஞ்"+ tamilMapping["c" + chunk] });
            tokens.push({ english: "nj", tamil: "ஞ்" });
            tokens.push({ english: chunk, tamil: tamilMapping["c" + chunk] });
            i += len;
            matched = true;
            break;
          }
        }
        if (matched) continue;
      }
      
      
    if (
        (i === 0 || input[i - 1] === " ") &&
        input[i] === "n" &&
        i + 1 < input.length
      ) {
        const nextChar = input.substring(i + 1, i + 2);
        const possibleNLetter = "n" + nextChar;
        if (
          [
            "na",
            "naa",
            "nA",
            "ni",
            "nii",
            "nI",
            "nu",
            "nuu",
            "nU",
            "ne",
            "nee",
            "nE",
            'nae',
            "nai",
            "no",
            "noo",
            "nO",
            "nau",
          ].includes(possibleNLetter)
        ) {
          const lookahead = Math.min(4, input.length - i);
          let found = false;

          for (let len = lookahead; len > 0; len--) {
            const chunk = input.substring(i, i + len);
            const nDashChunk = "n-" + chunk.substring(1);

            if (tamilMapping[nDashChunk]) {
              tokens.push({ english: chunk, tamil: tamilMapping[nDashChunk] });
              i += len;
              found = true;
              break;
            }
          }

          if (found) continue;
        }
      }

      if (
        (i === 0 || input[i - 1] === " ") &&
        input[i] === "n" &&
        i + 1 < input.length
      ) { 
     
        const nextChar = input.substring(i + 1, i + 2);
        const possibleNLetter = "n" + nextChar;
        if (
          [" nj","ny",
            "nya", "nja",
            "nyaa", "njaa", "nyA", "njA",
            "nyi", "nji",
            "nyii", "njii", "nyI", "njI",
            "nyu", "nju",
            "nyuu", "njuu", "nyU", "njU",
            "nye", "nje",
            "nyee", "njee", "nyE", "njE",
            "nyai", "njai",
            "nyo", "njo",
            "nyoo", "njoo", "nyO", "njO",
            "nyau", "njau"].includes(possibleNLetter)
        ) { 
    
          const lookahead = Math.min(4, input.length - i);
          let found = false;

          for (let len = lookahead; len > 0; len--) {
            const chunk = input.substring(i, i + len);
            const nDashChunk = "nj" + chunk.substring(2);

            if (tamilMapping[nDashChunk]) {
              tokens.push({ english: chunk, tamil: tamilMapping[nDashChunk] });
              i += len;
              found = true;
              break;
            }
          }

          if (found) continue;
        }
      }

      if (i + 1 < input.length && input[i] === "d" && input[i + 1] === "R" &&i-1>=0 && input[i-1] === "n") {
        const lookahead = Math.min(4, input.length - i);
        let found = false;

        for (let len = lookahead; len > 0; len--) {
          const chunk = input.substring(i, i + len);
          const rChunk = "R" + chunk.substring(2);

          if (tamilMapping[rChunk]) {
            tokens.push({ english: chunk, tamil: tamilMapping[rChunk] });
            i += len;
            found = true;
            break;
          }
        }

        if (found) continue;
      }
      
      let matched = false;
      for (let len = Math.min(5, input.length - i); len > 0; len--) {
        const chunk = input.substring(i, i + len);
        if (tamilMapping[chunk]) {
          tokens.push({ english: chunk, tamil: tamilMapping[chunk] });
          i += len;
          matched = true;
          break;
        }
      }

      if (!matched) {
        tokens.push({ english: input[i], tamil: input[i] });
        i++;
      }
    } 

    return tokens;
  };

  const handleKeyDown = (e) => {
    if (isCompleted || isTimeUp || isPaused ||showPerformanceOverlay || !iskeyBoardEnabled) return;
   
     
      // Ignore arrow keys completely
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || 
          e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          return;
      }
    // Handle backspace in both modes
    if (e.key === "Backspace") {
      if (iskeyBoardEnabled) {
        e.preventDefault();
      }
      handleBackspace();
      return;
    }

    // Handle shift key
    if (e.key === "Shift") {
      setShiftOn(true);
      return;
    }

    // Prevent default for all other keys in keyboard mode
    if (iskeyBoardEnabled) {
      e.preventDefault();
      
      e.stopPropagation();
      handleKeyPress(e.key);
      
    }
    // In non-keyboard mode, let the input handle it naturally
  };

  const handleBackspace = () => {
    if (iskeyBoardEnabled || isCompleted || isTimeUp) return;
  
    setUserBackspaces((prevCount) => prevCount + 1);
  
    if (currentKeyIndex > 0) {
      setCurrentKeyIndex((prev) => prev - 1);
    }
    else if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1);
      const prevSequence = keystrokeSequence[currentItemIndex - 1] || [];
      setCurrentKeyIndex(prevSequence.length - 1);
  
      const newFeedback = [...feedback];
      if (newFeedback[currentItemIndex - 1]) {
        newFeedback[currentItemIndex - 1] = {
          ...newFeedback[currentItemIndex - 1],
          status: "pending"
        };
      }
      setFeedback(newFeedback);
  
      setCurrentTamilText((prev) => {
        const tamilChars = parseTamilText(prev) || [];
        return tamilChars.slice(0, -1).join("");
      });
  
      setCurrentCharIndex((prev) => prev - 1);
      setCorrectCount((prev) => Math.max(0, prev - 1));

      // Update userInput by removing the last sequence
      if (iskeyBoardEnabled) {
        const prevSequence = keystrokeSequence[currentItemIndex - 1] || [];
        setUserInput(prev => prev.slice(0, -prevSequence.length));
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Shift") {
      setShiftOn(false);
    }
  };

  const updateMetrics = () => { 
    if (gameState != "playing") return;
    // Calculate current metrics
    const elapsedTimeInSeconds = INITIAL_TIME_SECONDS - remainingTime;
    const timeTakenInMinutes = elapsedTimeInSeconds / 60;
  
    if (timeTakenInMinutes > 0) {
      // Calculate current progress
      const buildTamilChars = parseTamilText(currentTamilText);
      const currentProgress = buildTamilChars.length;

      // Calculate WPM (assuming average 5 chars per word)
      const calculatedWpm = Math.round(
        currentProgress / 5 / timeTakenInMinutes
      );
      setWpm(calculatedWpm);
      
      // Calculate CPM (Characters Per Minute)
      const calculatedCpm = Math.round(currentProgress / timeTakenInMinutes);
      setCpm(calculatedCpm); 
      setTimeTaken(elapsedTimeInSeconds);


      // Calculate accuracy 

      if (currentProgress > 0) {
        const calculatedAccuracy = Math.round(
          ((correctCount) / currentProgress) * 100
        );
        setAccuracy(calculatedAccuracy);
      }
    }
  };

  // Timer effect - changed to countdown
  useEffect(() => {
    if (isTyping && !isCompleted && !isTimeUp) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTyping, isCompleted, isTimeUp]); // Add dependencies here

  // Metrics update effect
  useEffect(() => {
    if (isTyping) {
      updateMetrics();
    }
  }, [remainingTime, correctCount, currentTamilText, isTyping]); // Add relevant dependencies

  // Set up and clean up event listeners
  useEffect(() => {
    const handler = (e) => handleKeyDown(e);
    window.addEventListener("keydown", handler, { capture: true }); // Use capture phase

    return () => {
      window.removeEventListener("keydown", handler, { capture: true });
    };
  }, [handleKeyDown]); // Make sure handleKeyDown is memoized

  const checkPartialMatch = (currentInput, targetChar) => {
    if (!targetChar) return false;
    
    // Get all possible English sequences for the target Tamil character
    const possibleSequences = reverseMapping[targetChar] ? [...reverseMapping[targetChar]] : [];  
    // Special case for 'ந' series
    if (['ந', 'நா', 'நி', 'நீ', 'நு', 'நூ', 'நெ', 'நே', 'நை', 'நொ', 'நோ', 'நௌ'].includes(targetChar)) {
      possibleSequences.push("n");
  
      // For each sequence that starts with 'w', add a version starting with 'n'
      const additionalSequences = possibleSequences
        .filter(seq => seq.startsWith("w"))
        .map(seq => "n" + seq.slice(1));
  
      possibleSequences.push(...additionalSequences);
    } 

    // Check if current input could be start of any valid sequence
    return possibleSequences.some((seq) => seq.startsWith(currentInput));
  };
  
  // handle key press for non-keyboard mode
  useEffect(() => {
    if (iskeyBoardEnabled || gameState != "playing" || showPerformanceOverlay) return;

    const tamilChars = parseTamilText(targetText);
    const userTokens = tokenizeInput(userInput);
    let newFeedback = [];
    let correctChars = 0;
    let totalChars = tamilChars.length;
    let builtTamilText = ""; 
    for (const token of userTokens) {
      builtTamilText += token.tamil;
    }

    setCurrentTamilText(builtTamilText);

    const builtTamilChars = parseTamilText(builtTamilText); 

    // Update current character index based on progress
    const newCharIndex = Math.min(builtTamilChars.length, tamilChars.length);
    setCurrentCharIndex(newCharIndex);

    // Temporary error tracking
    const newCharErrors = { ...charErrors };
    const newCharSuccess = { ...charSuccess };

    for (
      let i = 0;
      i < Math.max(tamilChars.length, builtTamilChars.length);
      i++
    ) {
      if (i >= tamilChars.length) {
        updateMetrics();
        newFeedback.push({
          char: builtTamilChars[i],
          status: "extra",
          keystrokes: getKeystrokesForTamil(builtTamilChars[i]),
        });
      } else if (i >= builtTamilChars.length) {
        newFeedback.push({
          char: tamilChars[i],
          status: "pending",
          keystrokes: getKeystrokesForTamil(tamilChars[i]),
        });
      } else {
        const currentInput = userInput.slice(0, builtTamilText.length);
        const remainingInput = userInput.slice(builtTamilText.length);
        const targetChar = tamilChars[i];

        const isCorrect = builtTamilChars[i] === tamilChars[i];

        const isPartialMatch = checkPartialMatch(
          userTokens[i]?.english,
          tamilChars[i]
        );

        if (isCorrect) {
          newFeedback.push({
            char: tamilChars[i],
            status: "correct",
            keystrokes: getKeystrokesForTamil(tamilChars[i]),
          }); 
         
          correctChars++;

          // Update performance data only if not visited before
          if (tamilChars[i] !== " " && tamilChars[i] !== '.' && i == userTokens.length - 1 && !visitedPositions.has(i)) {
            updatePerformanceData(tamilChars[i], true);
            setCurrentLevelCorrect(prev => ({
              ...prev,
              [tamilChars[i]]: (prev[tamilChars[i]] || 0) + 1
            }));
            newCharSuccess[tamilChars[i]] = (newCharSuccess[tamilChars[i]] || 0) + 1;
            setVisitedPositions(prev => new Set([...prev, i]));
          }
        } else if (isPartialMatch && i === userTokens.length - 1) {
          newFeedback.push({
            char: tamilChars[i],
            status: "pending",
            keystrokes: getKeystrokesForTamil(tamilChars[i]),
          });
        } else {
          newFeedback.push({
            char: tamilChars[i],
            actual: builtTamilChars[i],
            status: "incorrect",
            keystrokes: getKeystrokesForTamil(tamilChars[i]),
          });

          // Update performance data only if not visited before
          if (tamilChars[i] !== " " && tamilChars[i] !== '.' && i == userTokens.length - 1 && !visitedPositions.has(i)) {
            updatePerformanceData(tamilChars[i], false);
            setCurrentLevelMistakes(prev => ({
              ...prev,
              [tamilChars[i]]: (prev[tamilChars[i]] || 0) + 1
            }));
            newCharErrors[tamilChars[i]] = (newCharErrors[tamilChars[i]] || 0) + 1;
            setVisitedPositions(prev => new Set([...prev, i]));
          }
        }
      }
    }
    
    setFeedback(newFeedback);
    setCorrectCount(correctChars);
    setTotalCount(totalChars);

    // Update character stats
    setCharErrors(newCharErrors);
    setCharSuccess(newCharSuccess);

    updateMetrics();

    // Check if completed
    if (
      (builtTamilChars.length >= tamilChars.length &&
        newFeedback[newFeedback.length - 1]?.status != "pending") ||
      isTimeUp
    ) {
      if (isTyping) {
        updateMetrics();
        setIsCompleted(true);
        clearInterval(timerRef.current);
        completeGame();
      }
    }
  }, [userInput, targetText, isTyping, iskeyBoardEnabled]);

  const handleInputChange = (e) => {
    if (iskeyBoardEnabled || isPaused) return;

    // Start the timer when user starts typing
    if (!isTyping && !isCompleted && !isTimeUp) {
      setIsTyping(true);
    }

    const newValue = e.target.value;
    if (newValue.length < userInput.length) {
      setUserBackspaces((prevCount) => prevCount + 1);
    }
    setUserInput(newValue);
  };

  const handleContainerClick = () => {
    if (!iskeyBoardEnabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Get the most frequent error characters (for current session only)
  const getTopErrorChars = () => {
    const errorChars = [];

    Object.entries(charErrors).forEach(([char, errorCount]) => {
      const successCount = charSuccess[char] || 0;
      if (errorCount >= successCount) {
        errorChars.push({ char, count: errorCount });
      }
    });

    return errorChars.sort((a, b) => b.count - a.count).slice(0, 3);
  };

  // Get the most successful characters (for current session only)
  const getTopSuccessChars = () => {
    const successChars = [];

    Object.entries(charSuccess).forEach(([char, successCount]) => {
      const errorCount = charErrors[char] || 0;
      if (successCount > errorCount) {
        successChars.push({ char, count: successCount });
      }
    });

    return successChars.sort((a, b) => b.count - a.count).slice(0, 3);
  };

  // Get the target Tamil characters
  const targetTamilChars = parseTamilText(targetText);
  const currentTamilChar = targetTamilChars[currentCharIndex];
  const currentKeystrokes = currentTamilChar
    ? getKeystrokesForTamil(currentTamilChar)
    : "";

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Add this function to update performance data
  const updatePerformanceData = async (char, isCorrect) => {
    const updatedLetters = { ...letters };
    
    if (!updatedLetters[char]) {
      updatedLetters[char] = { attempts: 0, correct: 0 };
    }
    
    updatedLetters[char].attempts += 1;
    if (isCorrect) {
      updatedLetters[char].correct += 1;
    }
    
    setLetters(updatedLetters);
  };

  const handleToggleHelp = () => {
    setIsHelpEnabled(prev => !prev);
  };

  const handleToggleKeyboard = () => {
    setIskeyBoardEnabled(prev => !prev);
  };

  // Update keyboard mode when task changes
  useEffect(() => { 
    if (gameData?.contents?.[currentTaskIndex]?.type === "Test") {
      setIskeyBoardEnabled(false);
    } else {
      setIskeyBoardEnabled(true);
    }
  }, [currentTaskIndex, gameData]);

  // Handle keyboard mode changes
  useEffect(() => {
    if (iskeyBoardEnabled) {
      const tamilChars = parseTamilText(targetText);
      const userTokens = tokenizeInput(userInput); 
      const lastFeedback = feedback[userTokens.length-1];
      
      if (lastFeedback && lastFeedback.status === "pending") {
        const incompleteInput = userTokens[userTokens.length-1]?.english || '';
        const newFeedback = feedback.slice(0, -1);
        const newItemIndex = userTokens.length - 1;
        
        setFeedback(newFeedback);
        setUserInput(prev => prev.slice(0, -incompleteInput.length));
        setCurrentTamilText(prev => prev.slice(0, -1));
        setCurrentItemIndex(newItemIndex);
        setCurrentCharIndex(newItemIndex);
      } else {
        const newItemIndex = userTokens.length;
        setCurrentItemIndex(newItemIndex);
        setCurrentCharIndex(newItemIndex);
      }
    } else {
      setCurrentItemIndex(currentCharIndex);
    }
    setCurrentKeyIndex(0);
  }, [iskeyBoardEnabled]);

  // Function to preload images
  const preloadImages = () => {
    const images = [
      speed,
      tool,
      timer,
      acc,
      pauseIcon,
      backgroundImage,
      hintBG,
      landingPageBackground,
      gameControlGif,
      helperGif,
      helpPageBackground
    ];

    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  };

  // Preload images when component mounts
  useEffect(() => {
    preloadImages();
  }, []);

  const nextTask = async () => {
    if (gameData?.contents) {
      const nextIndex = currentTaskIndex + 1;
      if (nextIndex < gameData.contents.length) {
        storeTaskCompletion();
        setCurrentTaskIndex(nextIndex);
        setTargetText(gameData.contents[nextIndex].task);
        startGame();
      } else {
        // All tasks completed
        console.log("Hi m this complete game");
        storeTaskCompletion();
        setGameState("completed");
        
        // Only send completion message to parent if not in freeplay mode
        if (mode !== "freeplay") {
          // Calculate average accuracy for all completed tasks
          const avgAccuracy = completedTasks.length
            ? Math.round(completedTasks.reduce((sum, t) => sum + Number(t.accuracy), 0) / completedTasks.length)
            : accuracy;
          const gameResult = {
            type: "levelComplete",
            data: {
              level: level,
              timeTaken: timeTaken,
              points: avgAccuracy, // Using average accuracy as points
            },
          };
          
          window.parent.postMessage(gameResult, "*");
        } else {
          // For freeplay mode, first send current data to server
          try {
            // First send the current task data
            const formData = new URLSearchParams();
            formData.append('mode', mode);
            formData.append('userid', userID);
            formData.append('level', level);
            formData.append('contents', JSON.stringify(completedTasks));
            formData.append('letters', JSON.stringify(letters));

            console.log('Sending current data before fetching new content:', {
              mode,
              userid: userID,
              level,
              contents: completedTasks,
              letters: JSON.stringify(letters)
            });

            const updateResponse = await fetch('https://academy.karky.in:6128/thamba/game/vaegee/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData
            });

            if (!updateResponse.ok) {
              console.error('Failed to update current game data');
            }

            // Then fetch new content
            const payload = {
              mode: mode,
              userid: userID,
              level: level,
            };
            
            const queryString = new URLSearchParams(payload).toString();
            const response = await fetch(`https://academy.karky.in:6128/thamba/game/vaegee/play?${queryString}`);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const newGameData = await response.json();
            // Parse the letters data if it exists
            if (newGameData.letters) {
              try {
                newGameData.letters = JSON.parse(newGameData.letters);
              } catch (error) {
                console.error('Error parsing letters data:', error);
                newGameData.letters = {};
              }
            } else {
              newGameData.letters = {};
            }
            
            // Update game data through the prop
            if (onGameDataUpdate) {
              onGameDataUpdate(newGameData);
            }
            
            // Reset game state with new data
            setCurrentTaskIndex(0);
            setTargetText(newGameData.contents[0].task);
            startGame();
          } catch (error) {
            console.error('Error in freeplay mode:', error);
            alert('Unable to load new content. Please try again later.');
            retryLevel();
          }
        }
      }
    }
  };

  // Initialize with first task from API and start game
  useEffect(() => {
    if (gameData?.contents?.length > 0) {
      setTargetText(gameData.contents[0].task);
      // setTargetText("மஞ்சள்");
      // setTargetText("தலைவி தோழியை நோக்கிக் கூறுகிறாள்: தோழி! என் தலைவர் நிலைத்து நிற்கும் வாய்மைச் சொல்லுடையவர்; பழகப்பழக நீடிக்கும் இனிமையுடையவர்; ஒரு நாளும் என் தோள்களைப் பிரிந்தறியாதவர். அவரைப் போன்ற மேலானவர்களுடைய நட்பு தாமரைத் தாதையும் சந்தனத் தாதையும் ஊதி எடுத்துச் சந்தன மரத்தில் அமைத்த தேன் இறால் போன்ற மேன்மையுடையது. நீரில்லா உலகம் வாழ முடியாததுபோல, அவரில்லாமல் நான் வாழமாட்டேன் என்பதை அவர் அறிவார். பிரிவினால் ஏற்படும் என் நெற்றிப் பசலைக்கே அஞ்சுபவர் என்னைப் பிரிதலாகிய சிறுமைச் செயல் செய்வாரா? சொல்!");
      startGame(); // Start the game immediately when target text is set
    }
  }, [gameData]);

  // Set initial keyboard state when gameData loads
  useEffect(() => {
    if (gameData?.contents?.[0]?.type === "Test") {
      setIskeyBoardEnabled(false);
    } else {
      setIskeyBoardEnabled(true);
    }
  }, [gameData]);

  const storeTaskCompletion = () => {
    const currentTask = gameData.contents[currentTaskIndex];
    const updatedTasks = [...completedTasks];
    
    updatedTasks.push({
      task: currentTask.task,
      type: currentTask.type,
      taskid: currentTask.taskid,
      accuracy: accuracy.toString(),
      wpm: wpm.toString(),
      cpm: cpm.toString(),
      timeTaken: timeTaken.toString(),
      found: "true"
    });
    
    setCompletedTasks(updatedTasks);

    // Check if all tasks are completed
    if (updatedTasks.length === gameData.contents.length) {
      sendFinalUpdate(updatedTasks);
    }
  };

  const sendFinalUpdate = async (tasks) => {
    try {
      const formData = new URLSearchParams();
      formData.append('mode', mode);
      formData.append('userid', userID);
      formData.append('level', level);
      formData.append('contents', JSON.stringify(tasks));
      formData.append('letters', JSON.stringify(letters));

      // Log the post data (excluding letters)
      console.log('Post Data:', {
        mode,
        userid: userID,
        level,
        contents: tasks, 
        letters: JSON.stringify(letters)
      });

      const response = await fetch('https://academy.karky.in:6128/thamba/game/vaegee/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        console.error('Failed to update game data');
      }
    } catch (error) {
      console.error('Error updating game data:', error);
    }
  };


  // Update the render section of TamilTypingTool.js
  return (
    <div className={`tamil-typing-test ${!iskeyBoardEnabled ? '' : 'small'}`} onClick={handleContainerClick}>
      {/* Temporary testing overlay */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        fontSize: '14px'
      }}>
        <div>UserID: {userID}</div>
        <div>Level: {level}</div>
        <div>Mode: {mode}</div>
      </div>

      {gameState === "playing" && (
        <div className="game-container">
          <StatsBar
            wpm={wpm}
            cpm={cpm}
            accuracy={accuracy}
            remainingTime={remainingTime}
            iskeyBoardEnabled={iskeyBoardEnabled}
            onShowPerformance={() => setShowPerformanceOverlay(true)}
            onToggleKeyboard={handleToggleKeyboard}
            onToggleHelp={handleToggleHelp}
            isHelpEnabled={isHelpEnabled} 
            setShowHelpOverlay = {setShowHelpOverlay}
          />

          <div className="card">
            <TargetText
              targetTamilChars={parseTamilText(targetText)}
              currentItemIndex={currentItemIndex}
              currentCharIndex={currentCharIndex}
              feedback={feedback}
              iskeyBoardEnabled={iskeyBoardEnabled}
            />

            <div className="input-area" style={{ position: "relative" }}>
              <input
                ref={inputRef}
                style={{
                  position: "absolute",
                  opacity: 0,
                  height: 0,
                  width: 0,
                  pointerEvents: "none",
                }}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={gameState !== "playing"}
                autoFocus
              />
            </div>

            <CurrentTamilText
              currentTamilText={currentTamilText}
              showForLevel={!iskeyBoardEnabled}
            />

            <KeystrokeHint
              showKeystrokes={showKeystrokes}
              currentTamilChar={parseTamilText(targetText)[currentCharIndex]}
              currentKeystroke={currentKeystroke}
              iskeyBoardEnabled={iskeyBoardEnabled}
              currentKeystrokes={getKeystrokesForTamil(parseTamilText(targetText)[currentCharIndex])}
            />

            {iskeyBoardEnabled && (
              <Keyboard keys={keyBoardLabel} renderKey={renderKey} />
            )}
          </div>
        </div>
      )}

      {gameState === "completed" && (
        <ResultsOverlay
          results={{
            wpm,
            cpm,
            accuracy,
            timeTaken: timeTaken,
            backspaces: userBackspaces,
          }}
          onRetry={retryLevel}
          onNextTask={nextTask}
          isLastTask={currentTaskIndex >= (gameData?.contents?.length - 1)}
          onShowPerformance={() => setShowPerformanceOverlay(true)}
          taskType={gameData?.contents?.[currentTaskIndex]?.type}
          accuracy={accuracy}
          mode={mode}
        />
      )} 

      {showPerformanceOverlay && (
        <PerformanceOverlay 
          onClose={() => setShowPerformanceOverlay(false)}
          currentLevelMistakes={currentLevelMistakes}
          currentLevelCorrect={currentLevelCorrect}
          performanceData={letters}
        />
      )} 
      {showHelpOverlay && (
        <HelpOverlay onClose={() => setShowHelpOverlay(false)} />
      )}
    </div>
  );
};

export default Vaegee;
