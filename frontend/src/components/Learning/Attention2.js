import React, { useState, useEffect } from "react";
import "./Attention2.css"; // Custom styles

import purpletoffe from "../../components/Cognitive/purpletoffe.png";
import redtoffe from "../../components/Cognitive/redtoffe.png";
import greentoffe from "../../components/Cognitive/greentoffe.png";
import bluetoffe from "../../components/Cognitive/bluetoffe.png";
import apple1 from "../../components/Cognitive/apple1.png";
import mango from "../../components/Cognitive/mango.png";
import orange from "../../components/Cognitive/orange.png";
import dogi from "../../components/Cognitive/dogi.png";
import squral from "../../components/Cognitive/squral.png";
import rabbite from "../../components/Cognitive/rabbite.png";
import greenball from "../../components/Cognitive/greenball.png";
import pinkball from "../../components/Cognitive/pinkball.png";
import redball from "../../components/Cognitive/redball.png";
import blue from "../../components/Cognitive/blue.png";
import red1 from "../../components/Cognitive/red1.png";
import yellow from "../../components/Cognitive/yellow.png";

import correctSound from "../../components/Cognitive/correctselect.mp3";
import wrongSound from "../../components/Cognitive/wrongselect.mp3";

const patterns = [
  [
    purpletoffe,
    redtoffe,
    greentoffe,
    bluetoffe,
    purpletoffe,
    redtoffe,
    greentoffe,
    bluetoffe,
    purpletoffe,
    redtoffe,
    greentoffe,
    bluetoffe,
    purpletoffe,
    redtoffe,
    bluetoffe,
    bluetoffe,
  ],
  [
    apple1,
    mango,
    orange,
    apple1,
    mango,
    orange,
    apple1,
    mango,
    orange,
    apple1,
    mango,
    orange,
    apple1,
    mango,
    orange,
    apple1,
  ],
  [
    dogi,
    squral,
    rabbite,
    dogi,
    squral,
    rabbite,
    dogi,
    squral,
    rabbite,
    dogi,
    squral,
    rabbite,
    dogi,
    squral,
    rabbite,
    dogi,
  ],
  [
    greenball,
    pinkball,
    redball,
    greenball,
    pinkball,
    redball,
    greenball,
    pinkball,
    redball,
    greenball,
    pinkball,
    redball,
    greenball,
    pinkball,
    redball,
    greenball,
  ],
  [
    blue,
    red1,
    yellow,
    blue,
    red1,
    yellow,
    blue,
    red1,
    yellow,
    blue,
    red1,
    yellow,
    blue,
    red1,
    yellow,
    blue,
  ],
];

const Attention2 = () => {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [remainingImages, setRemainingImages] = useState([...patterns[0]]);
  const [shakingImages, setShakingImages] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setRemainingImages([...patterns[currentPattern]]);
  }, [currentPattern]);

  const handleNextPattern = () => {
    if (currentPattern + 1 < patterns.length) {
      setCurrentPattern(currentPattern + 1);
    } else {
      handleFinishGame();
    }
  };

  const handleFinishGame = () => {
    alert(`Game Over! Your final score is: ${score}`);
    setCurrentPattern(0);
    setScore(0);
  };

  const getMostUsedImage = (pattern) => {
    const counts = pattern.reduce((acc, img) => {
      acc[img] = (acc[img] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  };

  const playSound = (isCorrect) => {
    const sound = new Audio(isCorrect ? correctSound : wrongSound);
    sound.play();
  };

  const handleImageClick = (image) => {
    const mostUsedImage = getMostUsedImage(remainingImages);
    if (image === mostUsedImage) {
      const filteredImages = remainingImages.filter((img) => img !== mostUsedImage);
      playSound(true);
      setScore((prevScore) => prevScore + 2);
      if (filteredImages.length === 0) {
        handleNextPattern();
      } else {
        setRemainingImages(filteredImages);
      }
    } else {
      playSound(false);
      setShakingImages((prev) => [...prev, image]);
      setTimeout(() => {
        setShakingImages((prev) => prev.filter((img) => img !== image));
      }, 500);
    }
  };

  return (
    <div className="a2-p-4 a2-text-center">
      <h1 className="a2-header">Pick the Most Frequent Image</h1>
      <div className="a2-grid a2-grid-cols-4 a2-grid-rows-4 a2-gap-2 a2-mb-4">
        {remainingImages.map((image, index) => (
          <div
            key={index}
            className={`a2-border a2-rounded-lg a2-p-2 a2-cursor-pointer ${
              shakingImages.includes(image) ? "a2-shake" : ""
            }`}
            onClick={() => handleImageClick(image)}
          >
            <img
              src={image}
              alt={`image-${index}`}
              className="a2-w-20 a2-h-20 a2-object-cover a2-mx-auto"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleNextPattern}
        className="a2-btn a2-bg-blue-500 a2-text-white a2-font-bold a2-rounded hover:a2-hover:bg-blue-700"
      >
        {currentPattern === patterns.length - 1 ? "Finish" : "Next Pattern"}
      </button>

      <div className="a2-mt-4 a2-text-xl a2-font-bold">
        <p>
          Score: {score} / {patterns.length * 2}
        </p>
      </div>
    </div>
  );
};

export default Attention2;
