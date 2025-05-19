import React, { useEffect, useState } from "react";
import cogni from "../../components/Cognitive/group.png";
import logicGame from "../../components/Cognitive/logicgame.PNG";
import memoryGame from "../../components/Cognitive/memory.PNG";
import attentionGame from "../../components/Cognitive/sa.PNG";
import "./Calibrator.css";

const Calibrator = () => {
  const webgazer = window.webgazer;

  useEffect(() => {
    webgazer
      .setRegression("ridge") // Options: "weightedRidge", "threadedRidge"
      .showVideo(false)
      .begin()
      .then(() => console.log("WebGazer initialized"));

    return () => {
      webgazer.clearGazeListener();
    };
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <div className="calibrator-container">
      {/* Navigation Bar */}
      <div className="top-navbar">
        <ul className="top-nav-menu">
          <li className="top-nav-item">Memory Activity</li>
          <li className="top-nav-item">Attention Training</li>
          <li className="top-nav-item">Logical Thinking Activity</li>
          <li className="top-nav-item">Result Tab</li>
          <li className="top-nav-item dropdown-parent" onClick={toggleDropdown}>
            Improvement Activity
            <span className="arrow">▼</span>
            <ul className={`top-dropdown-menu ${dropdownOpen ? "show" : ""}`}>
              <li className="top-dropdown-item">Memory</li>
              <li className="top-dropdown-item">Attention</li>
              <li className="top-dropdown-item">Logic</li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Header Section */}
      <div className="image-container">
        <img src={cogni} alt="Calibrator Logo" className="calibrator-image" />
        <div className="student-overlay">Cognitive Skills Empowerment for Autism</div>
      </div>

      <h1 className="calibrator-title"></h1>

      {/* Game Section */}
      <div className="game-row">
        {/* Logic Game */}
        <div className="game-card">
          <img src={logicGame} alt="Logic Game" className="game-image" />
          <div className="game-title">Logic Game</div>
          <button className="game-button">Start Game</button>
        </div>

        {/* Memory Game */}
        <div className="game-card">
          <img src={memoryGame} alt="Memory Game" className="game-image" />
          <div className="game-title">Memory Game</div>
          <button className="game-button">Start Game</button>
        </div>

        {/* Attention Game */}
        <div className="game-card">
          <img src={attentionGame} alt="Attention Game" className="game-image" />
          <div className="game-title">Attention Game</div>
          <button className="game-button">Start Game</button>
        </div>
      </div>
    </div>
  );
};

export default Calibrator;
