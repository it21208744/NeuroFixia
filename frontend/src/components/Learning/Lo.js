import React, { useState, useContext, useEffect } from "react";
import "./Lo.css";
import * as XLSX from "xlsx"; // Import SheetJS library
import { DataContext } from "layouts/Learning";
import correctSound from "../../components/Cognitive/correctselect.mp3";
import wrongSound from "../../components/Cognitive/wrongselect.mp3";

const patterns = [
  {
    id: 1,
    question: "What comes next in this pattern?",
    sequence: [
      "circle.png",
      "heart.png",
      "circle.png",
      "heart.png",
      "circle.png",
      "heart.png",
      null,
    ],
    options: ["circle.png", "heart.png"],
    answer: "circle.png",
    points: 10,
  },
  {
    id: 2,
    question: "What comes next in this pattern?",
    sequence: [
      "star.png",
      "triangle.png",
      "star.png",
      "triangle.png",
      ,
      "star.png",
      "triangle.png",
      null,
    ],
    options: ["triangle.png", "star.png"],
    answer: "star.png",
    points: 10,
  },
  {
    id: 3,
    question: "What comes next in this pattern?",
    sequence: [
      "triangle.png",
      "hextogen.png",
      "star.png",
      "triangle.png",
      "hextogen.png",
      "star.png",
      "triangle.png",
      "hextogen.png",
      null,
    ],
    options: ["triangle.png", "star.png", "hextogen.png"],
    answer: "star.png",
    points: 10,
  },
  {
    id: 4,
    question: "What comes next in this pattern?",
    sequence: [
      "right.png",
      "left.png",
      "left.png",
      "right.png",
      "left.png",
      "left.png",
      "right.png",
      "left.png",
      "left.png",
      null,
    ],
    options: ["right.png", "left.png"],
    answer: "right.png",
    points: 10,
  },
  {
    id: 5,
    question: "What comes next in this pattern?",
    sequence: [
      "right.png",
      "left.png",
      "right.png",
      "left.png",
      "right.png",
      "left.png",
      "right.png",
      null,
    ],
    options: ["right.png", "left.png"],
    answer: "left.png",
    points: 10,
  },
  {
    id: 6,
    question: "What comes next in this pattern?",
    sequence: [
      "circle.png",
      "heart.png",
      "circle.png",
      null,
      "circle.png",
      "heart.png",
      "circle.png",
      "heart.png",
    ],
    options: ["circle.png", "heart.png"],
    answer: "heart.png",
    missingIndex: 3,
    points: 5,
  },
  {
    id: 7,
    question: "What comes next in this pattern?",
    sequence: [
      "star.png",
      "triangle.png",
      "star.png",
      "triangle.png",
      null,
      "triangle.png",
      "star.png",
    ],
    options: ["triangle.png", "star.png"],
    answer: "star.png",
    missingIndex: 4,
    points: 7,
  },
  {
    id: 8,
    question: "What comes next in this pattern?",
    sequence: [
      null,
      "hextogen.png",
      "star.png",
      "triangle.png",
      "hextogen.png",
      "star.png",
      "triangle.png",
    ],
    options: ["triangle.png", "star.png", "hextogen.png"],
    answer: "triangle.png",
    missingIndex: 0,
    points: 10,
  },
  {
    id: 9,
    question: "What comes next in this pattern?",
    sequence: [
      "right.png",
      "left.png",
      null,
      "left.png",
      "right.png",
      "left.png",
      "right.png",
      "left.png",
    ],
    options: ["right.png", "left.png"],
    answer: "right.png",
    missingIndex: 2,
    points: 15,
  },
  {
    id: 10,
    question: "What comes next in this pattern?",
    sequence: ["red.png", "green.png", "red.png", null, "red.png"],
    options: ["red.png", "green.png"],
    answer: "green.png",
    missingIndex: 3,
    points: 8,
  },
  {
    id: 11,
    question: "What comes next in this pattern?",
    sequence: [
      "tennis.png",
      "football.png",
      "ruggerball.png",
      null,
      "football.png",
      "ruggerball.png",
      "tennis.png",
      "football.png",
    ],
    options: ["tennis.png", "football.png", "ruggerball.png"],
    answer: "tennis.png",
    missingIndex: 3,
    points: 5,
  },
];

const Lo = () => {
  const webgazer = window.webgazer;

  useEffect(() => {
    webgazer.showPredictionPoints(false);
    console.log("resssff");
    webgazer.pause();
  });
  const { score, setScore, errors, setErrors, totalTime, completionTimes, setCompletionTimes } =
    useContext(DataContext);

  const [startTime, setStartTime] = useState(Date.now());
  const [feedbackIcons, setFeedbackIcons] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});

  const correctAudio = new Audio(correctSound);
  const wrongAudio = new Audio(wrongSound);

  const handleDrop = (selected, patternId) => {
    const pattern = patterns.find((p) => p.id === patternId);
    const isCorrect = selected === pattern.answer;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // For Patterns 1-5 and 6-11
    const missingIndex = pattern.sequence.indexOf(null);
    if (missingIndex !== -1) {
      pattern.sequence[missingIndex] = selected;
    }

    if (isCorrect) {
      correctAudio.play();
      setScore(score + pattern.points);
      setFeedbackIcons((prev) => ({ ...prev, [patternId]: "correct.png" }));
    } else {
      wrongAudio.play();
      setErrors(errors + 1);
      setFeedbackIcons((prev) => ({ ...prev, [patternId]: "wrong.png" }));
    }

    setCompletionTimes((prev) => [...prev, timeTaken]);
    setStartTime(Date.now());
  };

  const exportToExcel = () => {
    const data = [
      {
        Logical_Score: score,
        Logical_Task_Errors: errors,
        "Logical_Task_Completion_Time (s)": totalTime,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LogicGame Results");

    XLSX.writeFile(workbook, "LogicResults.xlsx");
  };

  return (
    <div className="logic-game">
      <h1>Logic Patterns</h1>
      {patterns.map((pattern) => (
        <div key={pattern.id} className="pattern-container">
          <div className="question">{pattern.question}</div>
          <div className="sequence">
            {pattern.sequence.map((img, index) =>
              img ? (
                <img key={index} src={`/images/${img}`} alt="" className="pattern-img" />
              ) : (
                <div key={index} className="missing-part">
                  ---------------------?
                </div>
              )
            )}
          </div>
          <div className="options">
            {pattern.options.map((option, index) => (
              <img
                key={index}
                src={`/images/${option}`}
                alt=""
                className="option-img"
                onClick={() => handleDrop(option, pattern.id)}
              />
            ))}
          </div>
          {feedbackIcons[pattern.id] && (
            <img
              src={`/images/${feedbackIcons[pattern.id]}`}
              alt="feedback"
              className="feedback-img"
            />
          )}
        </div>
      ))}
      <div className="metrics">
        <p>Score: {score}</p>
        <p>Errors: {errors}</p>
        <p>Total Time Taken: {totalTime}s</p>
      </div>
      <button className="export-button" onClick={exportToExcel}>
        Download Results
      </button>
    </div>
  );
};

export default Lo;
