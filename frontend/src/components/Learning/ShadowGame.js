import React, { useState, useEffect, useContext } from "react";
import * as XLSX from "xlsx";
import "./ShadowGame.css";
import { useNavigate } from "react-router-dom";
import { DataContext } from "layouts/Learning";
import { timeToFirstGaze, countTimesOutsideArea } from "./webgazerFunctions";

import correctSound from "../../components/Cognitive/correctselect.mp3";
import wrongSound from "../../components/Cognitive/wrongselect.mp3";
// Updated patterns with correct file paths
const patterns = [
  {
    original: "/images/original1.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 0, // Change to the correct shadow index for original1
  },
  {
    original: "/images/original2.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 1, // Change to the correct shadow index for original2
  },
  {
    original: "/images/original3.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 2, // Change to the correct shadow index for original3
  },
  {
    original: "/images/original4.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 3, // Change to the correct shadow index for original3
  },
  {
    original: "/images/original5.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 4, // Change to the correct shadow index for original3
  },
  {
    original: "/images/original6.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 5, // Change to the correct shadow index for original3
  },
  {
    original: "/images/original7.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 6, // Change to the correct shadow index for original3
  },
  {
    original: "/images/original8.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 7, // Change to the correct shadow index for original3
  },
  {
    original: "/images/original9.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 8, // Change to the correct shadow index for original3
  },
  {
    original: "/images/original3.png",
    shadows: [
      "/images/shadow1.png",
      "/images/shadow2.png",
      "/images/shadow3.png",
      "/images/shadow4.png",
      "/images/shadow5.png",
      "/images/shadow6.png",
      "/images/shadow7.png",
      "/images/shadow8.png",
      "/images/shadow9.png",
    ],
    correctIndex: 2, // Change to the correct shadow index for original3
  },
];

const ShadowGame = () => {
  // 2. webgazer intialized in window
  const webgazer = window.webgazer;
  const {
    shadowScore,
    setShadowScore,
    timeElapsed,
    setTimeElapsed,
    completedPatterns,
    setCompletedPatterns,
    gazeShiftsCount,
    setGazeShiftsCount,
    fixationDuration,
    setFixationDuration,
    gazeDataCollection,
    setGazeDataCollection,
  } = useContext(DataContext);
  const navigate = useNavigate();
  const [currentPattern, setCurrentPattern] = useState(0);
  const [feed, setFeed] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  // 3. Collect gaze data continuously while the game is running (Collect Gaze Data During the Game)
  useEffect(() => {
    const listener = (data, elapsedTime) => {
      if (data) {
        setGazeDataCollection((prev) => [
          ...prev,
          { x: data.x, y: data.y, time: elapsedTime / 1000 },
        ]);
      }
    };

    webgazer
      .setGazeListener(listener)
      .setRegression("ridge") // 'weightedRidge' 'threadedRidge'
      .showVideo(false);

    webgazer
      .showPredictionPoints(true)
      .begin()
      .then(() => console.log("WebGazer initialized"));

    return () => {
      webgazer.clearGazeListener();
    };
    setGazeDataCollection([]);
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = (index) => {
    setIsDisabled(true);
    const isCorrect = index === patterns[currentPattern].correctIndex;
    setFeed(isCorrect ? "You are correct!" : "You are wrong!");

    const audio = new Audio(isCorrect ? correctSound : wrongSound);
    audio.play();

    if (!isCorrect) setShadowScore((prevScore) => prevScore - 10);

    setTimeout(() => {
      setFeed("");
      setIsDisabled(false);
      setCompletedPatterns((prev) => [...prev, currentPattern + 1]);
      if (currentPattern < patterns.length - 1) {
        setCurrentPattern((prev) => prev + 1);
      } else {
        // End game after answering 10 questions
        endGame();
      }
    }, 1500);
  };

  const endGame = () => {
    alert(`Game over! Final Score: ${shadowScore}`);

    // 4.Analyze Gaze Data at the End of the Game
    setGazeShiftsCount(countTimesOutsideArea(gazeDataCollection));
    setFixationDuration((timeToFirstGaze(gazeDataCollection) / 1000).toFixed(2)); // Convert ms to seconds
  };

  const handleSubmit = () => {
    webgazer.pause(); // // 5. Stop gaze tracking

    const data = [
      {
        Attention_Score: shadowScore,
        "Time Elapsed (seconds)": timeElapsed,
        "Patterns Completed": completedPatterns.length,
        Gaze_Shifts_Count: gazeShiftsCount,
        "Fixation_Duration (s)": parseFloat(fixationDuration).toFixed(2), // Ensure it's in 2 decimal points (Already converted to seconds)
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shadow Game Results");
    XLSX.writeFile(workbook, "Shadow_Game_Results.xlsx");
  };

  const { original, shadows } = patterns[currentPattern];

  return (
    <div className="shadow-game">
      <div className="header">
        <h1>Shadow Matching Game</h1>
      </div>
      <div className="ab">
        <div>Score: {shadowScore}</div>
        <div>Time Elapsed: {timeElapsed} seconds</div>
      </div>

      {feed && <div className="feed">{feed}</div>}

      {/* Display Original Image Above the Grid */}
      <div className="original-container">
        <img src={original} alt="Original Object" className="original-image" />
      </div>
      <div className="game-container">
        <div className="game-area">
          <div className="shadow-grid">
            {shadows.map((shadow, index) => (
              <button
                key={index}
                className="shadow-button"
                onClick={() => handleClick(index)}
                disabled={isDisabled}
              >
                <img src={shadow} alt={`Shadow ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="progress-container">
          <div className="progress">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="progress-item">
                <span>{i + 1}</span>
                {completedPatterns.includes(i + 1) && <span> - Done </span>}
              </div>
            ))}
          </div>
          <button className="submit-button" onClick={handleSubmit}>
            Submit and Download Results
          </button>
        </div>
      </div>

      {feed && <div className="feed">{feed}</div>}
    </div>
  );
};

export default ShadowGame;
