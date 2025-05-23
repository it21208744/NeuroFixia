import React, { useState, useEffect } from "react";
import img1 from "../../components/Cognitive/3m1.jpg";
import img2 from "../../components/Cognitive/3m2.jpg";
import img3 from "../../components/Cognitive/3m3.jpg";
import img4 from "../../components/Cognitive/3m4.jpg";
import img5 from "../../components/Cognitive/3m5.jpg";
import img6 from "../../components/Cognitive/3m6.jpg";
import img7 from "../../components/Cognitive/3m7.jpg";
import img8 from "../../components/Cognitive/3m8.jpg";
import correctSound from "../../components/Cognitive/correctselect.mp3";
import wrongSound from "../../components/Cognitive//wrongselect.mp3";

const images = [img1, img2, img3, img4, img5, img6, img7, img8];

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const Memory3 = () => {
  const [round, setRound] = useState(0);
  const [showingImages, setShowingImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [showCheckImage, setShowCheckImage] = useState(false);
  const [checkImages, setCheckImages] = useState([]);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [title, setTitle] = useState("Keep the cards in mind");

  useEffect(() => {
    if (round < 8) {
      startImageSequence();
    }
  }, [round]);

  const startImageSequence = () => {
    setTitle("Keep the cards in mind");
    const roundImages = shuffleArray([...images]).slice(0, 5);
    setShowingImages(roundImages);
    let index = 0;

    const interval = setInterval(() => {
      if (index < roundImages.length) {
        setCurrentImage(roundImages[index]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCheckImages(shuffleArray([...images]));
          setShowCheckImage(true);
          setCurrentCheckIndex(0);
          setCurrentImage(null);
          setTitle("Have you seen this before?");
        }, 1000);
      }
    }, 3000);
  };

  const playSound = (isCorrect) => {
    const audio = new Audio(isCorrect ? correctSound : wrongSound);
    audio.play();
  };

  const handleUserResponse = (response) => {
    const correct = showingImages.includes(checkImages[currentCheckIndex]);
    if ((response === "Show" && correct) || (response === "Not Show" && !correct)) {
      playSound(true);
    } else {
      playSound(false);
    }

    setUserResponses([
      ...userResponses,
      { round, checkImage: checkImages[currentCheckIndex], response },
    ]);
    if (currentCheckIndex < 7) {
      setTimeout(() => {
        setCurrentCheckIndex(currentCheckIndex + 1);
      }, 2000);
    } else {
      setTimeout(() => {
        setShowCheckImage(false);
        setRound(round + 1);
      }, 2000);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#16244d" }}>{title}</h1>
      {currentImage && <img src={currentImage} alt="Memory Test" width={300} />}
      {showCheckImage && currentCheckIndex < 8 && (
        <div>
          <img src={checkImages[currentCheckIndex]} alt="Check Image" width={300} />
          <br />
          <button
            style={{
              backgroundColor: "#16244d",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              border: "none",
              margin: "20px 10px",
            }}
            onClick={() => handleUserResponse("Show")}
          >
            Show
          </button>
          <button
            style={{
              backgroundColor: "#16244d",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              border: "none",
              margin: "20px 10px",
            }}
            onClick={() => handleUserResponse("Not Show")}
          >
            Not Show
          </button>
        </div>
      )}
      {round === 8 && <h2>Game Over! Thanks for playing.</h2>}
    </div>
  );
};

export default Memory3;
