import React, { useState, useEffect, useContext, useRef } from "react";
import * as XLSX from "xlsx";
import "./ShadowGame.css";
import { DataContext } from "layouts/Learning";
import { timeToFirstGaze, countGazeShifts } from "./gazeMetrics";
import { startGaze, stopGaze } from "utils/webgazer";
import { cameraErrorMessage } from "utils/media";
import Calibration from "components/Behavioral/Calibration";

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
  const {
    shadowScore,
    setShadowScore,
    completedPatterns,
    setCompletedPatterns,
    setGazeShiftsCount,
    setFixationDuration,
    markDone,
  } = useContext(DataContext);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [feed, setFeed] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [phase, setPhase] = useState("intro"); // intro | calibrate | playing | done
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gazeError, setGazeError] = useState("");
  const samples = useRef([]);
  const roundStart = useRef(0);
  const firstGazeTimes = useRef([]);
  const shifts = useRef(0);
  const targetRef = useRef(null);

  // stop eye tracking when leaving the game
  useEffect(() => () => stopGaze(), []);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const startEyeTracking = async () => {
    setGazeError("");
    try {
      await startGaze(
        (data) => {
          if (data) samples.current.push({ x: data.x, y: data.y, t: performance.now() });
        },
        { showVideo: true }
      );
      setPhase("calibrate");
    } catch (e) {
      setGazeError(`${cameraErrorMessage(e)} You can still play without eye tracking.`);
    }
  };

  const beginGame = () => {
    window.webgazer?.showVideoPreview(false).showPredictionPoints(false);
    setShadowScore(100);
    setCompletedPatterns([]);
    setCurrentPattern(0);
    setTimeElapsed(0);
    samples.current = [];
    firstGazeTimes.current = [];
    shifts.current = 0;
    roundStart.current = performance.now();
    setPhase("playing");
  };

  const closeRoundGaze = () => {
    const rect = targetRef.current?.getBoundingClientRect();
    if (rect && samples.current.length) {
      const ttf = timeToFirstGaze(samples.current, rect, roundStart.current);
      if (ttf !== null) firstGazeTimes.current.push(ttf);
      shifts.current += countGazeShifts(samples.current, rect);
    }
    samples.current = [];
    roundStart.current = performance.now();
  };

  const endGame = () => {
    stopGaze();
    const avgFirst = firstGazeTimes.current.length
      ? firstGazeTimes.current.reduce((a, b) => a + b, 0) / firstGazeTimes.current.length
      : 0;
    setGazeShiftsCount(shifts.current);
    setFixationDuration(Number(avgFirst.toFixed(2)));
    markDone("attention");
    setPhase("done");
  };

  const handleClick = (index) => {
    if (isDisabled) return;
    setIsDisabled(true);
    closeRoundGaze();
    const isCorrect = index === patterns[currentPattern].correctIndex;
    setFeed(isCorrect ? "You are correct!" : "Oops, try the next one!");
    new Audio(isCorrect ? correctSound : wrongSound).play().catch(() => {});
    if (!isCorrect) setShadowScore((prevScore) => Math.max(0, prevScore - 10));

    setTimeout(() => {
      setFeed("");
      setIsDisabled(false);
      setCompletedPatterns((prev) => [...prev, currentPattern + 1]);
      if (currentPattern < patterns.length - 1) {
        setCurrentPattern((prev) => prev + 1);
        roundStart.current = performance.now();
      } else {
        endGame();
      }
    }, 1200);
  };

  const exportResults = () => {
    const data = [
      {
        Attention_Score: shadowScore,
        "Time Elapsed (seconds)": timeElapsed,
        "Patterns Completed": completedPatterns.length,
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shadow Game Results");
    XLSX.writeFile(workbook, "Shadow_Game_Results.xlsx");
  };

  if (phase === "intro")
    return (
      <div className="shadow-game" style={{ textAlign: "center", padding: 24 }}>
        <h1>Shadow Matching Game</h1>
        <p style={{ maxWidth: 560, margin: "12px auto" }}>
          Your child finds the shadow that matches the picture. The webcam follows where they look
          to measure attention - first a quick 9-dot calibration.
        </p>
        {gazeError && <p style={{ color: "#c62828" }}>{gazeError}</p>}
        <button className="submit-button" onClick={startEyeTracking}>
          Start with eye tracking
        </button>{" "}
        <button className="submit-button" style={{ background: "#64748b" }} onClick={beginGame}>
          Play without eye tracking
        </button>
      </div>
    );

  if (phase === "calibrate") return <Calibration onDone={beginGame} />;

  if (phase === "done")
    return (
      <div className="shadow-game" style={{ textAlign: "center", padding: 24 }}>
        <h1>🎉 Well done!</h1>
        <h3>
          Attention score: {shadowScore} / 100 · {timeElapsed} seconds
        </h3>
        <button className="submit-button" onClick={exportResults}>
          Download results
        </button>{" "}
        <button className="submit-button" onClick={() => setPhase("intro")}>
          Play again
        </button>
      </div>
    );

  const { original, shadows } = patterns[currentPattern];

  return (
    <div className="shadow-game">
      <div className="header">
        <h1>Shadow Matching Game</h1>
      </div>
      <div className="ab">
        <div>Score: {shadowScore}</div>
        <div>Time: {timeElapsed}s</div>
      </div>

      {feed && <div className="feed">{feed}</div>}

      {/* Display Original Image Above the Grid */}
      <div className="original-container">
        <img ref={targetRef} src={original} alt="Original Object" className="original-image" />
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
        </div>
      </div>

      {feed && <div className="feed">{feed}</div>}
    </div>
  );
};

export default ShadowGame;
