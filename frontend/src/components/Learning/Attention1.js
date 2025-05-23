import React, { useState, useEffect } from "react";
import correctSound from "../../components/Cognitive/correct.mp3";
import incorrectSound from "../../components/Cognitive/incorrect.mp3";
import "./Attention1.css";
import flowers1 from "../../components/Cognitive/flowers1.png";
import flowers2 from "../../components/Cognitive/flowers2.png";
import g1 from "../../components/Cognitive/g1.png";
import g2 from "../../components/Cognitive/g2.png";
import boy1 from "../../components/Cognitive/boy1.png";
import boy2 from "../../components/Cognitive/boy2.png";
import cat1 from "../../components/Cognitive/cat1.png";
import cat2 from "../../components/Cognitive/cat2.png";
import panda1 from "../../components/Cognitive/panda1.png";
import panda2 from "../../components/Cognitive/panda2.png";

const patterns = [
  { correct: flowers1, wrong: flowers2 },
  { correct: g1, wrong: g2 },
  { correct: boy1, wrong: boy2 },
  { correct: cat1, wrong: cat2 },
  { correct: panda1, wrong: panda2 },
];

export default function Attention1() {
  const [score, setScore] = useState(0);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [grid, setGrid] = useState([]);
  const [wrongIndex, setWrongIndex] = useState(null);

  useEffect(() => {
    generateGrid();
  }, [currentPattern]);

  const generateGrid = () => {
    const pattern = patterns[currentPattern];
    const tempGrid = new Array(9).fill(pattern.correct);
    const randomIndex = Math.floor(Math.random() * 9);
    tempGrid[randomIndex] = pattern.wrong;
    setGrid(tempGrid);
    setWrongIndex(randomIndex);
  };

  const handleSelect = (index) => {
    const audio = new Audio(index === wrongIndex ? correctSound : incorrectSound);
    audio.play();
    let newScore = score;
    if (index === wrongIndex) {
      newScore += 10;
    } else {
      newScore = Math.max(0, newScore - 0);
    }
    setScore(newScore);
    if (currentPattern < patterns.length - 1) {
      setCurrentPattern(currentPattern + 1);
    } else {
      alert(`Game Over! Your final score is ${newScore}`);
      setScore(0);
      setCurrentPattern(0);
    }
  };

  return (
    <div className="A2-game-container">
      <h1 className="A2-title">Find the Different One!</h1>
      <p className="A2-score">Score: {score}</p>
      <div className="A2-grid-container">
        {grid.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="game card"
            className="A2-grid-item"
            onClick={() => handleSelect(index)}
          />
        ))}
      </div>
    </div>
  );
}
