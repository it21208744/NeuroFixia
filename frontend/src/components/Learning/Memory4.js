import React, { useState, useEffect } from "react";
import correctSound from "../../components/Cognitive/correctselect.mp3";
import wrongSound from "../../components/Cognitive/wrongselect.mp3";

const generateGrid = (round) => {
  const grid = Array(9).fill(null);
  let indexes = new Set();
  while (indexes.size < 4) {
    indexes.add(Math.floor(Math.random() * 9));
  }
  const color = getRoundColor(round);
  indexes.forEach((index) => (grid[index] = color));
  return grid;
};

const getRoundColor = (round) => {
  const colors = [
    "rgba(175, 18, 23, 0.78)",
    "rgba(41, 71, 128, 0.81)",
    "rgba(20, 150, 8, 0.82)",
    "rgba(213, 207, 15, 0.77)",
    "rgba(150, 8, 93, 0.77)",
    "rgba(237, 118, 28, 0.77)",
    "rgba(121, 31, 185, 0.77)",
    "rgba(5, 195, 106, 0.77)",
    "rgba(70, 73, 27, 0.77)",
    "rgba(169, 23, 23, 0.65)",
  ];
  return colors[(round - 1) % colors.length];
};

const Memory4 = () => {
  const [grid, setGrid] = useState(Array(9).fill(null));
  const [showColors, setShowColors] = useState(true);
  const [userGrid, setUserGrid] = useState(Array(9).fill(null));
  const [originalGrid, setOriginalGrid] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (round <= 10) {
      const newGrid = generateGrid(round);
      setOriginalGrid(newGrid);
      setGrid(newGrid);
      setShowColors(true);
      setTimeout(() => {
        setShowColors(false);
        setGrid(Array(9).fill(null));
      }, 2000);
    }
  }, [round]);

  const handleClick = (index) => {
    if (!showColors && userGrid[index] === null) {
      let newUserGrid = [...userGrid];
      newUserGrid[index] = "selected";
      setUserGrid(newUserGrid);

      if (originalGrid[index] !== null) {
        new Audio(correctSound).play();
      } else {
        new Audio(wrongSound).play();
      }
    }
  };

  const checkAnswer = () => {
    let correct = 0;
    userGrid.forEach((val, index) => {
      if (val === "selected" && originalGrid[index] !== null) {
        correct++;
      }
    });
    setScore(score + correct);
    setUserGrid(Array(9).fill(null));
    if (round < 10) setRound(round + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
        height: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#16244d" }}>
        Memory Game - Round {round}
      </h1>
      <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#16244d" }}>Score: {score}</p>{" "}
      <br />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 150px)",
          gridTemplateRows: "repeat(3, 150px)",
          gap: "15px",
          backgroundColor: "#dde1e5",
          padding: "20px",
          borderRadius: "20px",
          boxShadow: "0 4px 10px rgba(10, 12, 51, 0.2)",
        }}
      >
        {grid.map((color, index) => (
          <div
            key={index}
            onClick={() => handleClick(index)}
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "15px",
              border: "3px solid #000",
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              backgroundColor: showColors ? color : userGrid[index] ? "gray" : "white",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          ></div>
        ))}
      </div>
      {!showColors && (
        <button
          style={{
            backgroundColor: "#16244d",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            fontSize: "20px",
            cursor: "pointer",
            border: "none",
            margin: "20px 10px",
            width: 150,
            height: 100,
          }}
          onClick={checkAnswer}
        >
          Submit
        </button>
      )}
    </div>
  );
};

export default Memory4;
