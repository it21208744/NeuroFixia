import React, { useState } from "react";
import birdImage from "../../components/Cognitive/bird.png";
import nestImage from "../../components/Cognitive/nest1.jpeg";
import dogImage from "../../components/Cognitive/dog.png";
import doghouseImage from "../../components/Cognitive/doghouse.png";
import sonImage from "../../components/Cognitive/son.png";
import homeImage from "../../components/Cognitive/home.png";
import beeImage from "../../components/Cognitive/bee.png";
import beepotImage from "../../components/Cognitive/beepot.png";
import catImage from "../../components/Cognitive/cat.png";
import kittenImage from "../../components/Cognitive/kitten.png";
import chirpSound from "../../components/Cognitive/quickclick.wav";
import winSound from "../../components/Cognitive/correctselect.mp3";
// import backgroundImage from "../../components/Cognitive/background.webp"; // ✅ your .webp file

const rounds = [
  {
    name: "Bird to Nest",
    player: birdImage,
    goal: nestImage,
    maze: [
      [0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 2],
    ],
  },
  {
    name: "Dog to Doghouse",
    player: dogImage,
    goal: doghouseImage,
    maze: [
      [0, 0, 1, 0, 0],
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 1],
      [0, 1, 1, 0, 1],
      [0, 0, 0, 0, 2],
    ],
  },
  {
    name: "Son to Home",
    player: sonImage,
    goal: homeImage,
    maze: [
      [0, 1, 1, 0, 0],
      [0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1],
      [0, 0, 0, 0, 2],
    ],
  },
  {
    name: "Bee to Beepot",
    player: beeImage,
    goal: beepotImage,
    maze: [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0],
      [0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 1, 1, 1, 2],
    ],
  },
  {
    name: "Cat to Kitten",
    player: catImage,
    goal: kittenImage,
    maze: [
      [0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 2],
    ],
  },
];

const Logic4 = () => {
  const [round, setRound] = useState(0);
  const [position, setPosition] = useState({ row: 0, col: 0 });
  const [won, setWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const chirp = new Audio(chirpSound);
  const win = new Audio(winSound);

  const mazeLayout = rounds[round].maze;
  const numRows = mazeLayout.length;
  const numCols = mazeLayout[0].length;

  const isWall = (row, col) => mazeLayout[row][col] === 1;
  const isGoal = (row, col) => mazeLayout[row][col] === 2;

  const handleMove = (direction) => {
    if (won) return;
    setPosition((prev) => {
      let newRow = prev.row;
      let newCol = prev.col;
      if (direction === "up" && newRow > 0) newRow--;
      if (direction === "down" && newRow < numRows - 1) newRow++;
      if (direction === "left" && newCol > 0) newCol--;
      if (direction === "right" && newCol < numCols - 1) newCol++;

      if (isWall(newRow, newCol)) return prev;

      chirp.play();
      setMoveCount((c) => c + 1);

      if (isGoal(newRow, newCol)) {
        setWon(true);
        win.play();
      }

      return { row: newRow, col: newCol };
    });
  };

  const resetGame = () => {
    setPosition({ row: 0, col: 0 });
    setWon(false);
    setMoveCount(0);
  };

  const goToNextRound = () => {
    if (round < rounds.length - 1) {
      setRound(round + 1);
      resetGame();
    }
  };

  const renderCell = (row, col) => {
    const isPlayer = row === position.row && col === position.col;
    const cellType = mazeLayout[row][col];

    let content = null;
    if (isPlayer) {
      content = <img src={rounds[round].player} alt="Player" width="60" />;
    } else if (cellType === 2) {
      content = <img src={rounds[round].goal} alt="Goal" width="60" />;
    }

    return (
      <div
        key={`${row}-${col}`}
        style={{
          width: "95px",
          height: "95px",
          backgroundColor: cellType === 1 ? "#333" : "#e0ffe0",
          border: "3px solid #11243d",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {content}
      </div>
    );
  };

  return (
    <div
      className="p-4"
      style={{
        // backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        width: "1500px",
      }}
    >
      <h1 className="text-xl font-bold mb-2 text-green-800">{rounds[round].name}</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 95px)`,
          gridGap: "4px",
          marginBottom: "16px",
          marginLeft: "360px",
        }}
      >
        {mazeLayout.map((rowArr, row) => rowArr.map((_, col) => renderCell(row, col)))}
      </div>

      <div className="flex flex-row justify-center items-center gap-10 mb-4">
        <button
          onClick={() => handleMove("up")}
          className="p-2 rounded bg-yellow-200"
          style={{ fontSize: "40px", marginRight: "20px", marginLeft: "470px" }}
        >
          ⬆️
        </button>
        <button
          onClick={() => handleMove("left")}
          className="p-2 rounded bg-yellow-200"
          style={{ fontSize: "40px", marginRight: "20px" }}
        >
          ⬅️
        </button>
        <button
          onClick={() => handleMove("down")}
          className="p-2 rounded bg-yellow-200"
          style={{ fontSize: "40px", marginRight: "20px" }}
        >
          ⬇️
        </button>
        <button
          onClick={() => handleMove("right")}
          className="p-2 rounded bg-yellow-200"
          style={{ fontSize: "40px" }}
        >
          ➡️
        </button>
      </div>

      <p className="mb-2 text-blue-700 font-semibold" style={{ marginLeft: "580px" }}>
        Moves: {moveCount}
      </p>

      {won && (
        <>
          <div
            style={{
              color: "green",
              fontWeight: "bold",
              fontSize: "18px",
              marginBottom: "8px",
              marginLeft: "520px",
            }}
          >
            🎉 Round Completed!
          </div>
          {round < rounds.length - 1 ? (
            <button
              onClick={goToNextRound}
              style={{
                backgroundColor: "#11243d",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: "6px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                marginRight: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
                border: "none",
                marginLeft: "450px",
              }}
            >
              👉 Next Round
            </button>
          ) : (
            <div
              style={{
                color: "#2f855a",
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "8px",
                marginLeft: "650px",
              }}
            >
              ✅ All rounds completed!
            </div>
          )}
        </>
      )}

      <button
        onClick={resetGame}
        style={{
          backgroundColor: "#11243d",
          color: "#fff",
          padding: "6px 16px",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
          marginRight: "8px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "16px",
          border: "none",
        }}
      >
        🔄 Reset Round
      </button>
    </div>
  );
};

export default Logic4;
