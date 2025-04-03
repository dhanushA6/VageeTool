import React, { useState, useEffect, useRef } from "react";
import tamilMapping from "../data/tamilMapping.json";
import "../styles/GamePage.css";
import helperKey from "../data/feedback.json";
import shiftMap from "../data/shiftMap";
import SpecialKey from "../data/SpecialKey";
import Keyboard from "../components/Keyboard";
import keyBoardLabel from "../data/keyBoardLabel";
import ResultsOverlay from "../components/Result";
import StatsBar from "../components/statusBar";
import AnalysisBar from "../components/AnalysisBar";
import levels from "../data/levels";
import LevelSelect from "../components/Level";

import CurrentTamilText from "../components/CurrentTamilText";
import TargetText from "../components/TargetText";
import KeystrokeHint from "../components/KeystokeHint";
// Create a reverse mapping for checking valid inputs
const reverseMapping = {};
Object.entries(tamilMapping).forEach(([english, tamil]) => {
  if (!reverseMapping[tamil]) {
    reverseMapping[tamil] = [];
  }
  reverseMapping[tamil].push(english);
});

const TamilTypingTool = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState("levelSelect");

  const [targetText, setTargetText] = useState("வணக்கம் உலகம்");
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [userBackspaces, setUserBackspaces] = useState(0);
  const [currentTamilText, setCurrentTamilText] = useState("");
  const [showKeystrokes, setShowKeystrokes] = useState(true);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Change to a countdown timer
  const INITIAL_TIME_SECONDS = 300; // 2 minutes by default
  const [remainingTime, setRemainingTime] = useState(INITIAL_TIME_SECONDS);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Character error and success tracking - reset when changing text
  const [charErrors, setCharErrors] = useState({});
  const [charSuccess, setCharSuccess] = useState({});

  const [iskeyBoardEnabled, setIskeyBoardEnabled] = useState(true);
  const [keystrokeSequence, setKeystrokeSequence] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [highlightedKey, setHighlightedKey] = useState("");
  const [shiftOn, setShiftOn] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState({ key: "", status: "" });
  const [currentKeystroke, setCurrentKeystroke] = useState("");

  console.log(gameState);
  // Timer ref for cleanup
  const timerRef = useRef(null);
  const keyFeedbackTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Sample Tamil paragraphs for practice
  const sampleTexts = [
    "வணக்கம் உலகம்",
    "தமிழ் மொழி மிகவும் பழமையான மொழி",
    "நான் தமிழில் எழுத கற்றுக்கொள்கிறேன்",
    "இந்தியாவில் பல மொழிகள் பேசப்படுகின்றன",
    "ஆ",
  ];
  // Initialize game with level
  const startGame = async (level) => {
    // Only reset states if we're actually starting a new game

    setCurrentLevel(level);
    setTargetText(level.text);
    setGameState("playing");

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
    setAccuracy(100);
    setCharErrors({});
    setCharSuccess({});

    setIskeyBoardEnabled(level.id <= 3);
  };

  const completeGame = () => {
    // First update all metrics
    updateMetrics();

    // Then stop the timer and set completion state
    clearInterval(timerRef.current);
    setIsCompleted(true);
    setGameState("completed");
  };
  // Handle retry
  const retryLevel = () => {
    startGame(currentLevel);
  };

  const getLevelById = (id) => {
    const level = levels.find((level) => level.id === id);
    if (!level) {
      throw new Error(`Level with ID ${id} not found`);
    }
    return level;
  };

  console.log(currentLevel?.id);
  // Handle next level
  const nextLevel = async () => {
    try {
      if (!currentLevel) {
        // If no current level, go to first level
        const firstLevel = getLevelById(1);
        startGame(firstLevel);
        return;
      }

      const nextLevelId = currentLevel.id + 1;
      const level = getLevelById(nextLevelId);
      startGame(level);
    } catch (error) {
      console.log("Completed all levels or error occurred:", error);
      // Go back to level select
      setGameState("levelSelect");
    }
  };

  // Function to parse Tamil text into characters
  const parseTamilText = (text) => {
    if (!text) return [];

    const result = [];
    let i = 0;

    while (i < text.length) {
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
    }

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
    // setWpm(0);
    // setCpm(0);
    // setAccuracy(100);
    // setCharErrors({});
    // setCharSuccess({});

    // Initialize feedback based on target text
    const tamilChars = parseTamilText(targetText);
    const initialFeedback = tamilChars.map((char) => ({
      char,
      status: "pending",
      keystrokes: getKeystrokesForTamil(char),
    }));
    setFeedback(initialFeedback);
    setTotalCount(tamilChars.length);
  }, [targetText, gameState]);

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
      currentItemIndex >= keystrokeSequence.length &&
      !isCompleted
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

  const tamilToKeystrokes = (tamilText) => {
    const tamilChars = parseTamilText(tamilText);
    let keystrokeSequence = [];
    console.log(tamilChars)
    for (let i = 0; i < tamilChars.length; i++) {
      const char = tamilChars[i];
      const vallinamLetters = ["க்", "ச்", "ட்", "த்", "ப்", "ற்", " "];
      const prevChar = i > 0 ? tamilChars[i - 1] : null;
      if (char === " ") {
        keystrokeSequence.push([" "]);
        continue;
      } 
      const taLetters = ["ட", "டா", "டி", "டீ", "டு", "டூ", "டெ", "டே", "டை", "டொ", "டோ", "டௌ"];
      const dhaLetters =["த", "தா", "தி", "தீ", "து", "தூ", "தெ", "தே", "தை", "தொ", "தோ", "தௌ"]; 
      const paLetters = [ "ப", "பா", "பி", "பீ", "பு", "பூ", "பெ", "பே", "பை", "பொ", "போ", "பௌ"] 
      const RaLetters = ["ற", "றா", "றி", "றீ", "று", "றூ", "றெ", "றே", "றை", "றொ", "றோ", "றௌ"] 
      const chaLetters = ["ச", "சா", "சி", "சீ", "சு", "சூ", "செ", "சே", "சை", "சொ", "சோ", "சௌ"]
      const mappings = helperKey[char];
      if (prevChar &&!( vallinamLetters.includes(prevChar)) && taLetters.includes(char)) { 
        console.log("l")
        keystrokeSequence.push(mappings[1].split(""));
        continue;
      }
      if (prevChar &&!(  vallinamLetters.includes(prevChar)) && dhaLetters.includes(char)) {
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
      if (prevChar && chaLetters.includes(char) && prevChar === "ஞ்"){
        const temp = mappings[0].split("")
        temp.shift(); 
        temp.shift(); 
        temp.unshift("j");
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
    console.log(keystrokeSequence);
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
    const hasFeedback = keyFeedback.key === displayKey;

    // Special case for shift key
    const isShiftHighlighted = shiftOn && key === "Shift";

    return (
      <button
        key={key}
        className={`key 
          ${isHighlighted || isShiftHighlighted ? "highlighted" : ""}
          ${hasFeedback ? keyFeedback.status + "-feedback" : ""}
          ${isSpecialKey ? "special-key" : ""}
        `}
        style={{
          width:
            key === "Tab"
              ? "80px"
              : key === "Caps"
              ? "90px"
              : key === "Shift"
              ? "110px"
              : key === "Enter"
              ? "120px"
              : key === "Backspace"
              ? "140px"
              : key === "Ctrl" ||
                key === "Alt" ||
                key === "AltGr" ||
                key === "Win"
              ? "60px"
              : key === " "
              ? "300px"
              : "auto",
        }}
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

  const handleKeyPress = (key) => {
    if (!iskeyBoardEnabled || isCompleted || isTimeUp) return;

    // Start timer on first keystroke
    if (!isTyping && !isCompleted && !isTimeUp) {
      setIsTyping(true);
    }

    // Prevent default behavior for space key to avoid toggling
    if (key === " ") {
      // Prevent the default space bar behavior which might affect toggles
      document.activeElement.blur();
    }

    // Get current sequence and expected key
    if (currentItemIndex >= keystrokeSequence.length) {
      return; // All characters have been typed
    }

    const currentSequence = keystrokeSequence[currentItemIndex];
    const expectedKey = currentSequence[currentKeyIndex];

    console.log(currentSequence, currentItemIndex);
    if (key === expectedKey) {
      // Correct key pressed
      showKeyFeedback(key, "correct");

      // Update feedback array to mark progress
      const newFeedback = [...feedback];

      // If this is the last key in the sequence for this Tamil character
      if (currentKeyIndex === currentSequence.length - 1) {
        // Mark the entire character as correct
        newFeedback[currentItemIndex].status = "correct";
        console.log("HI");
        setCorrectCount((prevCount) => prevCount + 1);

        // Update character success tracking
        const tamilChar = parseTamilText(targetText)[currentItemIndex];
        if (tamilChar !== " ") {
          setCharSuccess((prev) => ({
            ...prev,
            [tamilChar]: (prev[tamilChar] || 0) + 1,
          }));
        }

        // Move to the next Tamil character
        setCurrentItemIndex((prev) => prev + 1);
        setCurrentKeyIndex(0);

        // Update current character index for the display
        setCurrentCharIndex(currentItemIndex + 1);

        // Update the Tamil text being built
        const tamilChars = parseTamilText(targetText);
        setCurrentTamilText((prev) => prev + tamilChars[currentItemIndex]);
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
        setIsCompleted(true);
        updateMetrics();
        completeGame();
        clearInterval(timerRef.current);
      }
    } else {
      // Incorrect key pressed - show error feedback but don't change the state
      showKeyFeedback(key, "incorrect");
      // Update error tracking for the current Tamil character
      const tamilChar = parseTamilText(targetText)[currentItemIndex];
      if (tamilChar !== " ") {
        setCharErrors((prev) => ({
          ...prev,
          [tamilChar]: (prev[tamilChar] || 0) + 1,
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
      
      if (tokens.length > 0 && tokens[tokens.length - 1].tamil === "ஞ்") {
       
        let matched = false;
        // Try to match the longest possible sequence first
        for (let len = Math.min(4, input.length - i); len > 0; len--) {
          const chunk = input.substring(i+1, i + len);
          // Check if this is a valid combination after ஞ் 
          if (tamilMapping["s" + chunk]) {
            tokens.push({ english: "j" + chunk, tamil: tamilMapping["s" + chunk] });
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

      if (i + 1 < input.length && input[i] === "d" && input[i + 1] === "R") {
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
    if (isCompleted || isTimeUp) return;

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
    if (!iskeyBoardEnabled || isCompleted || isTimeUp) return;

    setUserBackspaces((prevCount) => prevCount + 1);

    // If we're in the middle of typing a multi-key sequence for a character
    if (currentKeyIndex > 0) {
      // Go back one key in the current sequence
      setCurrentKeyIndex((prev) => prev - 1);
    }
    // If we're at the start of a character sequence but not the first character
    else if (currentItemIndex > 0) {
      // Go back to the previous character
      setCurrentItemIndex((prev) => prev - 1);
      // And to the last key in its sequence
      const prevSequence = keystrokeSequence[currentItemIndex - 1];
      setCurrentKeyIndex(prevSequence.length - 1);

      // Update the feedback to mark the character as pending again
      const newFeedback = [...feedback];
      newFeedback[currentItemIndex - 1].status = "pending";
      setFeedback(newFeedback);

      // Update the Tamil text being built (remove last character)
      setCurrentTamilText((prev) => {
        const tamilChars = parseTamilText(prev);
        return tamilChars.slice(0, -1).join("");
      });

      // Update character index and correct count
      setCurrentCharIndex((prev) => prev - 1);
      setCorrectCount((prev) => prev - 1);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Shift") {
      setShiftOn(false);
    }
  };

  const updateMetrics = () => {
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

      // Calculate accuracy
      if (totalCount > 0) {
        const calculatedAccuracy = Math.round(
          ((correctCount + 1) / totalCount) * 100
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
    const possibleSequences = reverseMapping[targetChar] || [];

    // Check if current input could be start of any valid sequence
    return possibleSequences.some((seq) => seq.startsWith(currentInput));
  };

  // Main processing effect for non-keyboard mode
  useEffect(() => {
    if (iskeyBoardEnabled) return;

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

          if (tamilChars[i] !== " " && i == userTokens.length - 1) {
            newCharSuccess[tamilChars[i]] =
              (newCharSuccess[tamilChars[i]] || 0) + 1;
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

          if (tamilChars[i] !== " " && i == userTokens.length - 1) {
            newCharErrors[tamilChars[i]] =
              (newCharErrors[tamilChars[i]] || 0) + 1;
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
        setIsCompleted(true);
        clearInterval(timerRef.current);
        completeGame();
      }
    }
  }, [userInput, targetText, isTyping, iskeyBoardEnabled]);

  const handleInputChange = (e) => {
    if (iskeyBoardEnabled) return;

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

  // const changePracticeText = () => {
  //   const randomIndex = Math.floor(Math.random() * sampleTexts.length);
  //   setTargetText(sampleTexts[randomIndex]);
  // };

  const toggleInputMode = () => {
    setIskeyBoardEnabled(!iskeyBoardEnabled);
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
    setWpm(0);
    setCpm(0);
    setAccuracy(100);
    setCharErrors({});
    setCharSuccess({});
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

  console.log("Results:", {
    wpm,
    cpm,
    accuracy,
    timeTaken: INITIAL_TIME_SECONDS - remainingTime,
    backspaces: userBackspaces,
  });

  // Update the render section of TamilTypingTool.js
  return (
    <div className="tamil-typing-test" onClick={handleContainerClick}>
      {gameState === "levelSelect" && <LevelSelect onStart={startGame} />}

      {gameState === "playing" && (
        <div className="game-container">
          <StatsBar
            wpm={wpm}
            cpm={cpm}
            accuracy={accuracy}
            remainingTime={remainingTime}
            level={currentLevel?.id}
          />

          <div className="card">
            <TargetText
              targetTamilChars={targetTamilChars}
              currentItemIndex={currentItemIndex}
              currentCharIndex={currentCharIndex}
              level={currentLevel?.id}
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
              showForLevel={currentLevel?.id >= 4}
            />

            <KeystrokeHint
              showKeystrokes={showKeystrokes}
              currentTamilChar={currentTamilChar}
              currentKeystroke={currentKeystroke}
              iskeyBoardEnabled={iskeyBoardEnabled}
              currentKeystrokes={currentKeystrokes}
            />

            {iskeyBoardEnabled && (
              <Keyboard keys={keyBoardLabel} renderKey={renderKey} />
            )}
            <AnalysisBar
              topSuccessChars={getTopSuccessChars()}
              topErrorChars={getTopErrorChars()}
              level={currentLevel?.id}
            />
          </div>
        </div>
      )}

      {gameState === "completed" && (
        <ResultsOverlay
          results={{
            wpm,
            cpm,
            accuracy,
            timeTaken: INITIAL_TIME_SECONDS - remainingTime,
            backspaces: userBackspaces,
          }}
          onRetry={retryLevel}
          onNextLevel={nextLevel}
        />
      )}
    </div>
  );
};

export default TamilTypingTool;
