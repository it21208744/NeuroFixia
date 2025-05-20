// import { Outlet } from "react-router-dom";
// import { useEffect, createContext, useState, useContext } from "react";

// export const DataContext = createContext(null);
// const LandingPage = () => {
//   const [isVideoOn, setIsVideoOn] = useState(false);
//   const [gazeDataCollection, setGazeDataCollection] = useState([]);

//   //memory card
//   const [accuracy, setAccuracy] = useState(0);
//   const [memoryScore, setMemoryScore] = useState(0);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
//   };

//   //Logical
//   const [score, setScore] = useState(0);
//   const [errors, setErrors] = useState(0);
//   const [completionTimes, setCompletionTimes] = useState([]);
//   const totalTime = completionTimes.reduce((acc, time) => acc + time, 0);

//   //Shadow
//   const [shadowScore, setShadowScore] = useState(100);
//   //const [elapsedTime, setTimeElapsed] = useState([])
//   const [completedPatterns, setCompletedPatterns] = useState([]);
//   const [gazeShiftsCount, setGazeShiftsCount] = useState([]);
//   const [fixationDuration, setFixationDuration] = useState([]);

//   useEffect(() => {
//     // const listener = (data, elapsedTime) => {
//     //   if (data) {
//     //     setGazeDataCollection((prev) => [
//     //       ...prev,
//     //       { x: data.x, y: data.y, time: elapsedTime / 1000 },
//     //     ])
//     //   }
//     // }
//     // webgazer
//     //   .setGazeListener(listener)
//     //   .setRegression('ridge') // 'weightedRidge' 'threadedRidge'
//     //   .showVideo(false)
//     //   .begin()
//     //   .then(() => console.log('WebGazer initialized'))
//     // return () => {
//     //   webgazer.clearGazeListener()
//     // }
//   }, []);

//   return (
//     <div>
//       <DataContext.Provider
//         value={{
//           elapsedTime,
//           setElapsedTime,
//           accuracy,
//           setAccuracy,
//           memoryScore,
//           setMemoryScore,
//           formatTime,
//           score,
//           setScore,
//           errors,
//           setErrors,
//           totalTime,
//           completionTimes,
//           setCompletionTimes,
//           shadowScore,
//           setShadowScore,
//           //elapsedTime,
//           //setTimeElapsed,
//           completedPatterns,
//           setCompletedPatterns,
//           gazeShiftsCount,
//           setGazeShiftsCount,
//           fixationDuration,
//           setFixationDuration,
//           gazeDataCollection,
//           setGazeDataCollection,
//         }}
//       >
//         <Outlet />
//       </DataContext.Provider>
//       <button onClick={() => console.log(gazeDataCollection)}>log data</button>
//     </div>
//   );
// };
// export default LandingPage;
