import React, { useState, useEffect } from "react";
import "./LogicGame.css";

class Box {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  getTopBox() {
    return this.y === 0 ? null : new Box(this.x, this.y - 1);
  }
  getRightBox() {
    return this.x === 3 ? null : new Box(this.x + 1, this.y);
  }
  getBottomBox() {
    return this.y === 3 ? null : new Box(this.x, this.y + 1);
  }
  getLeftBox() {
    return this.x === 0 ? null : new Box(this.x - 1, this.y);
  }
  getNextdoorBoxes() {
    return [this.getTopBox(), this.getRightBox(), this.getBottomBox(), this.getLeftBox()].filter(
      (b) => b !== null
    );
  }
  getRandomNextdoorBox() {
    const options = this.getNextdoorBoxes();
    return options[Math.floor(Math.random() * options.length)];
  }
}

const swapBoxes = (grid, box1, box2) => {
  const temp = grid[box1.y][box1.x];
  grid[box1.y][box1.x] = grid[box2.y][box2.x];
  grid[box2.y][box2.x] = temp;
};

const isSolved = (grid) => {
  const solved = [].concat(...grid);
  return solved.join(",") === "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0";
};

const getRandomGrid = () => {
  let grid = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0],
  ];
  let blankBox = new Box(3, 3);
  for (let i = 0; i < 1000; i++) {
    const randomNextdoorBox = blankBox.getRandomNextdoorBox();
    swapBoxes(grid, blankBox, randomNextdoorBox);
    blankBox = randomNextdoorBox;
  }
  if (isSolved(grid)) return getRandomGrid();
  return grid;
};

function LogicGame() {
  const [grid, setGrid] = useState(getRandomGrid());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState("ready");
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (status === "playing") {
      const id = setInterval(() => setTime((t) => t + 1), 1000);
      setIntervalId(id);
    }
    return () => clearInterval(intervalId);
  }, [status]);

  const handleClickBox = (box) => {
    const blankBox = box.getNextdoorBoxes().find((next) => grid[next.y][next.x] === 0);
    if (blankBox) {
      const newGrid = grid.map((row) => row.slice());
      swapBoxes(newGrid, box, blankBox);
      setGrid(newGrid);
      setMoves((m) => m + 1);
      if (isSolved(newGrid)) {
        clearInterval(intervalId);
        setStatus("won");
      }
    }
  };

  const handlePlayReset = () => {
    if (status === "ready" || status === "won") {
      setGrid(getRandomGrid());
      setMoves(0);
      setTime(0);
      setStatus("playing");
    } else {
      setStatus("ready");
      clearInterval(intervalId);
    }
  };

  return (
    <div className="LO1-logic-game">
      <div className="LO1-logic-card">
        <div className="LO1-logic-grid">
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <button
                key={`${i}-${j}`}
                onClick={() => handleClickBox(new Box(j, i))}
                disabled={status !== "playing"}
                className="LO1-logic-button"
              >
                {cell !== 0 ? cell : ""}
              </button>
            ))
          )}
        </div>

        <div className="LO1-logic-footer">
          <button onClick={handlePlayReset} className="LO1-logic-control">
            {status === "ready" || status === "won" ? "Play" : "Reset"}
          </button>
          <span>Move: {moves}</span>
          <span>Time: {time}</span>
        </div>

        {status === "won" && <div className="LO1-logic-message">You win!</div>}
      </div>
    </div>
  );
}

export default LogicGame;
