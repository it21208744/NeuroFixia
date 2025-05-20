// import React, { useState, useEffect, useContext } from "react";
// import * as XLSX from "xlsx";
// import { useNavigate } from "react-router-dom";
// import { DataContext } from "./LandingPage";
// import { timeToFirstGaze, countTimesOutsideArea } from "./webgazerFunctions";
// import "./Shadow.css";

// import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
// import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import MDBox from "components/MDBox";
// import MDTypography from "components/MDTypography";

// const patterns = [
//   {
//     original: "/images/original1.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 0,
//   },
//   {
//     original: "/images/original2.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 1,
//   },
//   {
//     original: "/images/original3.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 2,
//   },
//   {
//     original: "/images/original4.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 3,
//   },
//   {
//     original: "/images/original5.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 4,
//   },
//   {
//     original: "/images/original6.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 5,
//   },
//   {
//     original: "/images/original7.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 6,
//   },
//   {
//     original: "/images/original8.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 7,
//   },
//   {
//     original: "/images/original9.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 8,
//   },
//   {
//     original: "/images/original3.png",
//     shadows: [...Array(9)].map((_, i) => `/images/shadow${i + 1}.png`),
//     correctIndex: 2,
//   },
// ];

// function Shadow() {
//   const webgazer = window.webgazer;
//   const {
//     shadowScore,
//     setShadowScore,
//     timeElapsed,
//     setTimeElapsed,
//     completedPatterns,
//     setCompletedPatterns,
//     gazeShiftsCount,
//     setGazeShiftsCount,
//     fixationDuration,
//     setFixationDuration,
//     gazeDataCollection,
//     setGazeDataCollection,
//   } = useContext(DataContext);

//   const navigate = useNavigate();
//   const [currentPattern, setCurrentPattern] = useState(0);
//   const [feed, setFeed] = useState("");
//   const [isDisabled, setIsDisabled] = useState(false);

//   useEffect(() => {
//     const listener = (data, elapsedTime) => {
//       if (data) {
//         setGazeDataCollection((prev) => [
//           ...prev,
//           { x: data.x, y: data.y, time: elapsedTime / 1000 },
//         ]);
//       }
//     };

//     setGazeDataCollection([]);
//     const timer = setInterval(() => {
//       setTimeElapsed((prev) => prev + 1);
//     }, 1000);

//     return () => {
//       webgazer.clearGazeListener();
//       clearInterval(timer);
//     };
//   }, []);

//   const handleClick = (index) => {
//     setIsDisabled(true);
//     const isCorrect = index === patterns[currentPattern].correctIndex;
//     setFeed(isCorrect ? "You are correct!" : "You are wrong!");
//     if (!isCorrect) setShadowScore((prevScore) => prevScore - 10);

//     setTimeout(() => {
//       setFeed("");
//       setIsDisabled(false);
//       setCompletedPatterns((prev) => [...prev, currentPattern + 1]);
//       if (currentPattern < patterns.length - 1) {
//         setCurrentPattern((prev) => prev + 1);
//       } else {
//         endGame();
//       }
//     }, 1500);
//   };

//   const endGame = () => {
//     alert(`Game over! Final Score: ${shadowScore}`);
//     setGazeShiftsCount(countTimesOutsideArea(gazeDataCollection));
//     setFixationDuration((timeToFirstGaze(gazeDataCollection) / 1000).toFixed(2));
//   };

//   const handleSubmit = () => {
//     webgazer.pause();
//     const data = [
//       {
//         Attention_Score: shadowScore,
//         "Time Elapsed (seconds)": timeElapsed,
//         "Patterns Completed": completedPatterns.length,
//         Gaze_Shifts_Count: gazeShiftsCount,
//         "Fixation_Duration (s)": parseFloat(fixationDuration).toFixed(2),
//       },
//     ];

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Shadow Game Results");
//     XLSX.writeFile(workbook, "Shadow_Game_Results.xlsx");
//   };

//   const { original, shadows } = patterns[currentPattern];

//   return (
//     <DashboardLayout>
//       <DashboardNavbar />
//       <MDBox p={3}>
//         <MDTypography variant="h4" gutterBottom>
//           Shadow Matching Game
//         </MDTypography>
//         <div className="shadow-game">
//           <div className="ab">
//             <div>Score: {shadowScore}</div>
//             <div>Time Elapsed: {timeElapsed} seconds</div>
//           </div>

//           {feed && <div className="feed">{feed}</div>}

//           <div className="original-container">
//             <img src={original} alt="Original Object" className="original-image" />
//           </div>

//           <div className="game-container">
//             <div className="shadow-grid">
//               {shadows.map((shadow, index) => (
//                 <button
//                   key={index}
//                   className="shadow-button"
//                   onClick={() => handleClick(index)}
//                   disabled={isDisabled}
//                 >
//                   <img src={shadow} alt={`Shadow ${index + 1}`} />
//                 </button>
//               ))}
//             </div>

//             <div className="progress-container">
//               <div className="progress">
//                 {Array.from({ length: 10 }, (_, i) => (
//                   <div key={i} className="progress-item">
//                     <span>{i + 1}</span>
//                     {completedPatterns.includes(i + 1) && <span> - Done</span>}
//                   </div>
//                 ))}
//               </div>
//               <button className="submit-button" onClick={handleSubmit}>
//                 Submit and Download Results
//               </button>
//             </div>
//           </div>
//         </div>
//       </MDBox>
//     </DashboardLayout>
//   );
// }

// export default Shadow;
