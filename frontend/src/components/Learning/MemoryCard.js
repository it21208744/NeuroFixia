import React, { useState, useEffect, useRef, useContext } from "react";
import PropTypes from "prop-types";
import "./MemoryCard.css"; // CSS for cards and metrics
import memorySound from "../../components/Cognitive/memorycard.mp3";
import finishBellSound from "../../components/Cognitive/finishbell.mp3";
import * as XLSX from "xlsx";
import { DataContext } from "layouts/Learning";

// MemoryCardItem component
function MemoryCardItem({ item, id, handleClick, reveal }) {
  const itemClass = reveal || item.stat ? `active ${item.stat}` : "";
  return (
    <div className={`card ${itemClass}`} onClick={() => handleClick(id)}>
      <img src={item.img} alt="memory card" />
    </div>
  );
}

// PropTypes validation for MemoryCardItem
MemoryCardItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    img: PropTypes.string.isRequired,
    stat: PropTypes.string,
  }).isRequired,
  id: PropTypes.number.isRequired,
  handleClick: PropTypes.func.isRequired,
  reveal: PropTypes.bool.isRequired,
};

function MemoryCard() {
  const [items, setItems] = useState(
    [
      { id: 1, img: "/img/apple.png", stat: "" },
      { id: 1, img: "/img/apple.png", stat: "" },
      { id: 2, img: "/img/carret.png", stat: "" },
      { id: 2, img: "/img/carret.png", stat: "" },
      { id: 3, img: "/img/flower.png", stat: "" },
      { id: 3, img: "/img/flower.png", stat: "" },
      { id: 4, img: "/img/graps.png", stat: "" },
      { id: 4, img: "/img/graps.png", stat: "" },
      { id: 5, img: "/img/leamon.png", stat: "" },
      { id: 5, img: "/img/leamon.png", stat: "" },
      { id: 6, img: "/img/pinapple.png", stat: "" },
      { id: 6, img: "/img/pinapple.png", stat: "" },
      { id: 7, img: "/img/strabery.png", stat: "" },
      { id: 7, img: "/img/strabery.png", stat: "" },
      { id: 8, img: "/img/toffe.png", stat: "" },
      { id: 8, img: "/img/toffe.png", stat: "" },
    ].sort(() => Math.random() - 0.5)
  );

  const [prev, setPrev] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(180);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState([]);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [reveal, setReveal] = useState(true);

  const audioRef = useRef(new Audio(memorySound));
  const finishBellRef = useRef(new Audio(finishBellSound));
  const webgazer = window.webgazer;

  const {
    accuracy,
    setAccuracy,
    memoryScore,
    setMemoryScore,
    formatTime,
    elapsedTime,
    setElapsedTime,
  } = useContext(DataContext);

  useEffect(() => {
    webgazer.showPredictionPoints(false);
    webgazer.pause();

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Automatically hide all cards after 20 seconds
  useEffect(() => {
    const hideCardsTimer = setTimeout(() => {
      setReveal(false);
    }, 20000); // Cards are visible for 20s

    return () => clearTimeout(hideCardsTimer);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      audioRef.current.pause();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      finishBellRef.current.play();
    }
  }, [timeLeft]);

  function check(current) {
    setTotalAttempts((prev) => prev + 1);

    const responseTime = (Date.now() - startTime) / 180;
    setResponseTimes((prev) => [...prev, responseTime]);
    setStartTime(Date.now());

    if (items[current].id === items[prev].id) {
      setCorrectMatches((prev) => prev + 1);
      items[current].stat = "correct";
      items[prev].stat = "correct";
      setItems([...items]);
      setPrev(-1);
    } else {
      items[current].stat = "wrong";
      items[prev].stat = "wrong";
      setItems([...items]);
      setTimeout(() => {
        items[current].stat = "";
        items[prev].stat = "";
        setItems([...items]);
        setPrev(-1);
      }, 2000);
    }

    // Accuracy=( Correct Matches / Total Attempts )×100 --------Memory recallAccuracy
    const totalCorrect = correctMatches + 1;
    const attempts = totalAttempts + 1;
    const totalResponseTime = [...responseTimes, responseTime].reduce((a, b) => a + b, 0);

    setAccuracy((totalCorrect / attempts) * 100);
    setAverageResponseTime(totalResponseTime / attempts);

    const accuracyWeight = 1.5; // Example weight
    const timeWeight = 1.0; // Example weight

    // Memory Score = (Accuracy) − (Average Response Time)--------Memory Score
    setMemoryScore(
      accuracyWeight * ((totalCorrect / attempts) * 100) -
        timeWeight * (totalResponseTime / attempts)
    );
  }

  function handleClick(id) {
    if (prev === -1) {
      items[id].stat = "active";
      setItems([...items]);
      setPrev(id);
    } else {
      check(id);
    }
  }

  const getTimeBarWidth = () => `${(timeLeft / 100) * 100}%`;

  const downloadExcel = () => {
    const data = [
      {
        "Memory_Recall_Accuracy (%)": accuracy.toFixed(2),
        "Response_Time (s)": formatTime(elapsedTime),
        Memory_Score: memoryScore.toFixed(2),
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Metrics");
    XLSX.writeFile(wb, "memory_game_results.xlsx");
  };

  return (
    <div className="memory-game">
      <div className="timer-container">
        <div className="timer-wrapper">
          <img
            src="/img/timer.png"
            alt="Timer Icon"
            className={`timer-icon ${timeLeft <= 10 ? "vibrate" : ""}`}
          />
          <div className={`timer ${timeLeft <= 10 ? "vibrate" : ""}`}>
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        <div className="time-bar">
          <div className="time-bar-fill" style={{ width: getTimeBarWidth() }}></div>
        </div>
      </div>

      <div className="metrics">
        <div>Memory Recall Accuracy: {accuracy.toFixed(2)}%</div>
        <div>Memory Score: {memoryScore.toFixed(2)}</div>
        <div>Time Spent: {formatTime(elapsedTime)}</div>
      </div>

      <button onClick={downloadExcel} className="download-button">
        Download Results as Excel
      </button>

      <div className="gcontainer">
        {items.map((item, index) => (
          <MemoryCardItem
            key={index}
            item={item}
            id={index}
            handleClick={handleClick}
            reveal={reveal}
          />
        ))}
      </div>

      {timeLeft === 0 && <div className="game-over">Time&apos;s up! Game Over!</div>}
    </div>
  );
}

export default MemoryCard;
