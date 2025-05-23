import React, { useState, useEffect } from "react";
import "./Logic1.css"; // Add necessary CSS styles

import drive1 from "../../components/Cognitive/drive1.jpeg";
import drive2 from "../../components/Cognitive/drive2.jpeg";
import drive3 from "../../components/Cognitive/drive3.jpeg";
import drive4 from "../../components/Cognitive/drive4.jpeg";
import bathrrom from "../../components/Cognitive/bathrrom.jpg";
import bathrrom1 from "../../components/Cognitive/bathrrom1.jpg"; // Added the new image
import bathrrom2 from "../../components/Cognitive/bathrrom2.jpg";
import bathrrom3 from "../../components/Cognitive/bathrrom3.jpg";
import snowBall1 from "../../components/Cognitive/snow ball1.jpg";
import snowBall2 from "../../components/Cognitive/snow ball2.jpg";
import snowBall3 from "../../components/Cognitive/snow ball3.jpg";
import snowBall4 from "../../components/Cognitive/snow ball4.jpg";
import night1 from "../../components/Cognitive/night1.png";
import night2 from "../../components/Cognitive/night2.png";
import night3 from "../../components/Cognitive/night3.png";
import night4 from "../../components/Cognitive/night4.png";
import night5 from "../../components/Cognitive/night5.png";
import bird1 from "../../components/Cognitive/bird1.jpeg";
import bird2 from "../../components/Cognitive/bird2.jpeg";
import bird3 from "../../components/Cognitive/bird3.jpeg";
import bird4 from "../../components/Cognitive/bird4.jpeg";
import bird5 from "../../components/Cognitive/bird5.jpeg";

import flowerGrowth1 from "../../components/Cognitive/fower growth1.jpg";
import flowerGrowth2 from "../../components/Cognitive/fower growth2.jpg";
import flowerGrowth3 from "../../components/Cognitive/fower growth3.jpg";
import flowerGrowth4 from "../../components/Cognitive/fower growth4.jpg";

const patterns = [
  { name: "Getting Into the Car Safely 👶🚗", images: [drive1, drive2, drive3, drive4], score: 10 },
  {
    name: "Using the Bathroom Properly🚽👦🧼",
    images: [bathrrom, bathrrom1, bathrrom2, bathrrom3],
    score: 5,
  }, // Updated Bathroom pattern
  {
    name: "Let's Build a Snowman!☃️❄️",
    images: [snowBall1, snowBall2, snowBall3, snowBall4],
    score: 15,
  },
  {
    name: "Getting Ready for Bed🌙😴",
    images: [night1, night2, night3, night4, night5],
    score: 20,
  },
  {
    name: "The Little Bird Who Needed Help 🕊️💖",
    images: [bird1, bird2, bird3, bird4, bird5],
    score: 25,
  },
  {
    name: "How a Seed 🌱 Grows into a Flower 🌸",
    images: [flowerGrowth1, flowerGrowth2, flowerGrowth3, flowerGrowth4],
    score: 25,
  },
];

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const Logic1 = () => {
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [originalOrder, setOriginalOrder] = useState([]);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    loadPattern(currentPatternIndex);
  }, [currentPatternIndex]);

  const loadPattern = (index) => {
    const selectedPattern = patterns[index];
    setOriginalOrder(selectedPattern.images);
    setShuffledImages(shuffleArray(selectedPattern.images));
    setUserOrder(new Array(selectedPattern.images.length).fill(null));
    setIsCorrect(null); // Reset correctness on loading new pattern
  };

  const handleDrop = (index, imageSrc) => {
    const newOrder = [...userOrder];
    const droppedImage = shuffledImages.find((img) => img === imageSrc);
    newOrder[index] = droppedImage;
    setUserOrder(newOrder);
  };

  const calculateScore = () => {
    const currentPattern = patterns[currentPatternIndex];
    const correctOrder = userOrder.every((img, index) => img === originalOrder[index]);

    if (correctOrder) {
      setTotalScore((prevScore) => prevScore + currentPattern.score);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const nextPattern = () => {
    calculateScore();
    if (currentPatternIndex < patterns.length - 1) {
      setCurrentPatternIndex((prevIndex) => prevIndex + 1);
    } else {
      alert(`Game Over! Your total score is: ${totalScore}/100`);
    }
  };

  return (
    <div className="activity-container">
      <h1 className="sequential-header">Sequential Drag and Drop Activity</h1>
      <h1>{patterns[currentPatternIndex].name} </h1>
      <div className="shuffled-container">
        {shuffledImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="activity"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", img)}
          />
        ))}
      </div>
      <div className="drop-container">
        {originalOrder.map((_, idx) => (
          <div
            key={idx}
            className="drop-box"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(idx, e.dataTransfer.getData("text/plain"))}
          >
            {userOrder[idx] ? <img src={userOrder[idx]} alt="placed" /> : <span>{idx + 1}</span>}
          </div>
        ))}
      </div>
      <button className="sebutton" onClick={nextPattern}>
        {currentPatternIndex === patterns.length - 1 ? "Finish" : "Next"}
      </button>
      <h2>Total Score: {totalScore}/100</h2>
      {isCorrect !== null && (
        <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          {isCorrect
            ? `Correct! You earned ${patterns[currentPatternIndex].score} points.`
            : "Incorrect! Try again."}
        </div>
      )}
    </div>
  );
};

export default Logic1;
