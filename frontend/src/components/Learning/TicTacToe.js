import React, { useRef, useState } from "react";
import "./TicTacToe.css";
import circle_icon from "../../components/Cognitive/circle.png.png";
import cross_icon from "../../components/Cognitive/cross.png.png";
import winSound from "../../components/Cognitive/win-sound.mp3";
import mom_icon from "../../components/Cognitive/mom.png";
import child_icon from "../../components/Cognitive/child.png";

let data = ["", "", "", "", "", "", "", "", ""];

const TicTacToe = () => {
  let [count, setCount] = useState(0);
  let [lock, setLock] = useState(false);
  let [scoreX, setScoreX] = useState(0);
  let [scoreO, setScoreO] = useState(0);
  let titleRef = useRef(null);
  let box1 = useRef(null);
  let box2 = useRef(null);
  let box3 = useRef(null);
  let box4 = useRef(null);
  let box5 = useRef(null);
  let box6 = useRef(null);
  let box7 = useRef(null);
  let box8 = useRef(null);
  let box9 = useRef(null);

  let box_array = [box1, box2, box3, box4, box5, box6, box7, box8, box9];
  const toggle = (e, num) => {
    if (lock) {
      return 0;
    }
    if (count % 2 === 0) {
      e.target.innerHTML = `<img src='${cross_icon}'>`;
      data[num] = "x";
      setCount(++count);
    } else {
      e.target.innerHTML = `<img src='${circle_icon}'>`;
      data[num] = "o";
      setCount(++count);
    }
    checkWin();
  };

  /*const checkWin = () => {
   if(data[0]===data[1] && data[2] && data[2]!=="")
   {
    won(data[2]);
   }
else if(data[3]===data[4] && data[4]===data[5] && data[5]!=="")
   {
    won(data[5]);
   }
else if(data[6]===data[7] && data[7]===data[8] && data[8]!=="")
    {
    won(data[8]);
    }
else if(data[0]===data[3] && data[3]===data[6] && data[6]!=="")
    {
    won(data[6]);
    }    
else if(data[1]===data[4] && data[4]===data[7] && data[7]!=="")
    {
    won(data[7]);
    }
else if(data[2]===data[5] && data[5]===data[8] && data[8]!=="")
    {
    won(data[8]);
    }
else if(data[0]===data[4] && data[4]===data[8] && data[8]!=="")
    {
    won(data[8]);
    }
else if(data[0]===data[1] && data[1]===data[2] && data[2]!=="")
    {
    won(data[2]);
    }
else if(data[2]===data[4] && data[4]===data[6] && data[6]!=="")
    {
     won(data[6]);
    }       
 }*/

  const checkWin = () => {
    // Check all winning combinations
    const winningCombinations = [
      [0, 1, 2], // Top row
      [3, 4, 5], // Middle row
      [6, 7, 8], // Bottom row
      [0, 3, 6], // Left column
      [1, 4, 7], // Middle column
      [2, 5, 8], // Right column
      [0, 4, 8], // Diagonal \
      [2, 4, 6], // Diagonal /
    ];

    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      // Check if the three positions are filled and equal
      if (data[a] && data[a] === data[b] && data[a] === data[c]) {
        won(data[a]); // Call won function with the winning player (X or O)
        return; // Exit after finding a win
      }
    }
  };

  const won = (winner) => {
    setLock(true);
    const winAudio = new Audio(winSound); // Create a new Audio object
    winAudio.play(); // Play the sound

    /*if(winner==="x")
    {
        setScoreX(scoreX); // Increment score for X
        //titleRef.current.innerHTML = `Congratulations: <img src =${cross_icon}>Score: ${scoreX + 10}`;
    }
    else 
    {
        setScoreO(scoreO); // Increment score for O
        //titleRef.current.innerHTML = `Congratulations: <img src =${circle_icon}>Score: ${scoreX + 10}`;
    }
    titleRef.current.innerHTML = `Congratulations: <img src='${winner === "x" ? child_icon : mom_icon}'> 
    Score - X: ${scoreX + (winner === "x" ? 10 : 0)}, O: ${scoreO + (winner === "o" ? 10 : 0)}`;
 } */

    if (winner === "x") {
      setScoreX((prevScoreX) => prevScoreX + 10); // Correctly increment score for X
      document.querySelector(".child-image").classList.add("pulse"); // Add blink to child image
    } else {
      setScoreO((prevScoreO) => prevScoreO + 10); // Correctly increment score for O
      document.querySelector(".mom-image").classList.add("blink"); // Add blink to mom image
    }

    titleRef.current.innerHTML = `Congratulations: <img src='${
      winner === "x" ? child_icon : mom_icon
    }'> 
        Score - X: ${winner === "x" ? scoreX + 10 : scoreX}, O: ${
      winner === "o" ? scoreO + 10 : scoreO
    }`;
  };

  const reset = () => {
    setLock(false);
    data = ["", "", "", "", "", "", "", "", ""];
    titleRef.current.innerHTML = "Tic Tac Toe In <span>XO</span>";
    document.querySelector(".child-image").classList.remove("pulse");
    document.querySelector(".mom-image").classList.remove("pulse");

    box_array.map((e) => {
      e.current.innerHTML = "";
    });
    setCount(0); // Reset count for new game
  };

  return (
    <div className="tcontainer">
      <h1 className="title" ref={titleRef}>
        Tie Tac Toe Game In <span>XO</span>
      </h1>

      <div className="game-area">
        <div className="side-image">
          <img src={child_icon} alt="Child" className="child-image" />
          <p className="score">Child (X): {scoreX}</p>
        </div>
        <div className="board">
          <div className="row1">
            <div
              className="boxes"
              ref={box1}
              onClick={(e) => {
                toggle(e, 0);
              }}
            ></div>
            <div
              className="boxes"
              ref={box2}
              onClick={(e) => {
                toggle(e, 1);
              }}
            ></div>
            <div
              className="boxes"
              ref={box3}
              onClick={(e) => {
                toggle(e, 2);
              }}
            ></div>
          </div>
          <div className="row2">
            <div
              className="boxes"
              ref={box4}
              onClick={(e) => {
                toggle(e, 3);
              }}
            ></div>
            <div
              className="boxes"
              ref={box5}
              onClick={(e) => {
                toggle(e, 4);
              }}
            ></div>
            <div
              className="boxes"
              ref={box6}
              onClick={(e) => {
                toggle(e, 5);
              }}
            ></div>
          </div>
          <div className="row3">
            <div
              className="boxes"
              ref={box7}
              onClick={(e) => {
                toggle(e, 6);
              }}
            ></div>
            <div
              className="boxes"
              ref={box8}
              onClick={(e) => {
                toggle(e, 7);
              }}
            ></div>
            <div
              className="boxes"
              ref={box9}
              onClick={(e) => {
                toggle(e, 8);
              }}
            ></div>
          </div>
        </div>
        <div className="side-image">
          <img src={mom_icon} alt="Mom" className="mom-image" />
          <p className="score">Mom (O): {scoreO}</p>
        </div>
      </div>
      <button
        className="reset"
        onClick={() => {
          reset();
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default TicTacToe;
