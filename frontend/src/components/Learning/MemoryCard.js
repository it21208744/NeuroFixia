// import React, { useState, useEffect, useRef, useContext } from "react";
// import PropTypes from "prop-types";
// import "./MemoryCard.css"; // Ensure CSS for cards and metrics is imported
// import memorySound from "../../components/Cognitive//memorycard.mp3";
// import finishBellSound from "../../components/Cognitive//finishbell.mp3";
// import * as XLSX from "xlsx"; // Import the xlsx library
// import { DataContext } from "./LandingPage";
// import { useNavigate } from "react-router-dom";

// function MemoryCard({ item, id, handleClick, reveal }) {
//   // Cards will always be visible if "reveal" is true
//   const itemClass = reveal || item.stat ? `active ${item.stat}` : "";

//   return (
//     <div className={`card ${itemClass}`} onClick={() => handleClick(id)}>
//       <img src={item.img} alt="" />
//     </div>
//   );
// }

// MemoryCard.propTypes = {
//   item: PropTypes.shape({
//     img: PropTypes.string.isRequired,
//     stat: PropTypes.string,
//   }).isRequired,
//   id: PropTypes.number.isRequired,
//   handleClick: PropTypes.func.isRequired,
//   reveal: PropTypes.bool.isRequired,
// };

// function MemoryGame() {
//   const [items, setItems] = useState(
//     [
//       { id: 1, img: "/img/apple.png", stat: "" },
//       { id: 1, img: "/img/apple.png", stat: "" },
//       { id: 2, img: "/img/carret.png", stat: "" },
//       { id: 2, img: "/img/carret.png", stat: "" },
//       { id: 3, img: "/img/flower.png", stat: "" },
//       { id: 3, img: "/img/flower.png", stat: "" },
//       { id: 4, img: "/img/graps.png", stat: "" },
//       { id: 4, img: "/img/graps.png", stat: "" },
//       { id: 5, img: "/img/leamon.png", stat: "" },
//       { id: 5, img: "/img/leamon.png", stat: "" },
//       { id: 6, img: "/img/pinapple.png", stat: "" },
//       { id: 6, img: "/img/pinapple.png", stat: "" },
//       { id: 7, img: "/img/strabery.png", stat: "" },
//       { id: 7, img: "/img/strabery.png", stat: "" },
//       { id: 8, img: "/img/toffe.png", stat: "" },
//       { id: 8, img: "/img/toffe.png", stat: "" },
//     ].sort(() => Math.random() - 0.5)
//   );

//   const [prev, setPrev] = useState(-1);
//   const [timeLeft, setTimeLeft] = useState(180); // 180 seconds for simplicity
//   const [correctMatches, setCorrectMatches] = useState(0);
//   const [totalAttempts, setTotalAttempts] = useState(0);
//   const [startTime, setStartTime] = useState(Date.now());
//   const [responseTimes, setResponseTimes] = useState([]);
//   const [averageResponseTime, setAverageResponseTime] = useState(0);
//   const [reveal, setReveal] = useState(true);

//   const audioRef = useRef(new Audio(memorySound));
//   const finishBellRef = useRef(new Audio(finishBellSound));
//   // const [elapsedTime, setElapsedTime] = useState(0) // Time in seconds
//   const webgazer = window.webgazer;

//   const {
//     accuracy,
//     setAccuracy,
//     memoryScore,
//     setMemoryScore,
//     formatTime,
//     elapsedTime,
//     setElapsedTime,
//   } = useContext(DataContext);

//   useEffect(() => {
//     webgazer.showPredictionPoints(false);

//     webgazer.pause();
//     const timer = setInterval(() => {
//       setElapsedTime((prev) => prev + 1); // Increment every second
//     }, 1000);

//     // Clear the timer when the component is unmounted or when the game ends
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     // Set a timer to hide cards after 20 seconds
//     const hideCardsTimer = setTimeout(() => {
//       setReveal(false);
//     }, 20000);

//     return () => clearTimeout(hideCardsTimer);
//   }, []);

//   useEffect(() => {
//     if (timeLeft > 0) {
//       const timer = setInterval(() => {
//         setTimeLeft((prevTime) => prevTime - 1);
//       }, 1000);
//       return () => clearInterval(timer);
//     } else {
//       audioRef.current.pause();
//     }
//   }, [timeLeft]);

//   useEffect(() => {
//     if (timeLeft <= 10 && timeLeft > 0) {
//       finishBellRef.current.play();
//     }
//   }, [timeLeft]);

//   function check(current) {
//     setTotalAttempts((prev) => prev + 1);

//     const responseTime = (Date.now() - startTime) / 1000; // Time in seconds
//     setResponseTimes((prev) => [...prev, responseTime]);
//     setStartTime(Date.now());

//     if (items[current].id === items[prev].id) {
//       setCorrectMatches((prev) => prev + 1);
//       items[current].stat = "correct";
//       items[prev].stat = "correct";
//       setItems([...items]);
//       setPrev(-1);
//     } else {
//       items[current].stat = "wrong";
//       items[prev].stat = "wrong";
//       setItems([...items]);

//       setTimeout(() => {
//         items[current].stat = "";
//         items[prev].stat = "";
//         setItems([...items]);
//         setPrev(-1);
//       }, 2000);
//     }

//     // Update metrics
//     const totalCorrect = correctMatches + 1; // Include current correct match
//     const attempts = totalAttempts + 1; // Include current attempt
//     const totalResponseTime = [...responseTimes, responseTime].reduce((a, b) => a + b, 0);

//     setAccuracy((totalCorrect / attempts) * 100);
//     setAverageResponseTime(totalResponseTime / attempts);

//     const accuracyWeight = 1.5; // Example weight
//     const timeWeight = 1.0; // Example weight

//     setMemoryScore(
//       accuracyWeight * ((totalCorrect / attempts) * 100) -
//         timeWeight * (totalResponseTime / attempts)
//     );
//   }

//   function handleClick(id) {
//     if (prev === -1) {
//       items[id].stat = "active";
//       setItems([...items]);
//       setPrev(id);
//     } else {
//       check(id);
//     }
//   }

//   const getTimeBarWidth = () => `${(timeLeft / 180) * 100}%`;

//   // Function to handle Excel download
//   const downloadExcel = () => {
//     const data = [
//       {
//         "Memory_Recall_Accuracy (%)": accuracy.toFixed(2),
//         "Response_Time (s)": formatTime(elapsedTime),
//         Memory_Score: memoryScore.toFixed(2),
//       },
//     ];

//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Metrics");

//     // Save to file
//     XLSX.writeFile(wb, "memory_game_results.xlsx");
//   };

//   return (
//     <div className="memory-game">
//       <div className="timer-container">
//         <div className="timer-wrapper">
//           <img
//             src="/img/timer.png"
//             alt="Timer Icon"
//             className={`timer-icon ${timeLeft <= 10 ? "vibrate" : ""}`}
//           />
//           <div className={`timer ${timeLeft <= 10 ? "vibrate" : ""}`}>
//             Time Left: {formatTime(timeLeft)}
//           </div>
//         </div>
//         <div className="time-bar">
//           <div className="time-bar-fill" style={{ width: getTimeBarWidth() }}></div>
//         </div>
//       </div>

//       <div className="metrics">
//         <div>Memory Recall Accuracy: {accuracy.toFixed(2)}%</div>
//         <div>Memory Score: {memoryScore.toFixed(2)}</div>
//         <div>Time Spent: {formatTime(elapsedTime)}</div> {/* Display elapsed time */}
//       </div>

//       {/* Add the button to download the results */}
//       <button onClick={downloadExcel} className="download-button">
//         Download Results as Excel
//       </button>

//       <div className="gcontainer">
//         {items.map((item, index) => (
//           <MemoryCard
//             key={index}
//             item={item}
//             id={index}
//             handleClick={handleClick}
//             reveal={reveal}
//           />
//         ))}
//       </div>

//       {timeLeft === 0 && <div className="game-over">Time&apos;s up! Game Over!</div>}
//     </div>
//   );
// }

// export default MemoryGame;
