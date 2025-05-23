import React, { useState, useEffect } from "react";
import correctSound from "../../components/Cognitive/correctselect.mp3";
import wrongSound from "../../components/Cognitive/wrongselect.mp3";
import clickSound from "../../components/Cognitive/click.wav"; // Import your click sound
import img1 from "../../components/Cognitive/2m1.png";
import img2 from "../../components/Cognitive/2m2.png";
import img3 from "../../components/Cognitive/2m3.png";
import img4 from "../../components/Cognitive/2m4.png";
import img5 from "../../components/Cognitive/2m5.png";
import img6 from "../../components/Cognitive/2m6.png";
import img7 from "../../components/Cognitive/2m7.png";
import img8 from "../../components/Cognitive/2m8.png";
import img10 from "../../components/Cognitive/2m10.png";
import img11 from "../../components/Cognitive/2m11.png";
import img12 from "../../components/Cognitive/2m12.png";
import img13 from "../../components/Cognitive/2m13.png";

const imageList = [img1, img2, img3, img4, img5, img6, img7, img8, img10, img11, img12, img13];

const Memory2 = () => {
  const [currentImage, setCurrentImage] = useState(null);
  const [shownImages, setShownImages] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [round, setRound] = useState(1);
  const [correctRounds, setCorrectRounds] = useState(0); // Track the number of correct rounds
  const maxRounds = 5;
  const [showGrid, setShowGrid] = useState(false);
  const [highlighted, setHighlighted] = useState([]);

  useEffect(() => {
    startNewRound();
  }, [round]);

  const startNewRound = () => {
    const shuffled = [...imageList].sort(() => 0.5 - Math.random());
    const newShownImages = shuffled.slice(0, 3);
    setShownImages(newShownImages);
    setAllImages(shuffled.slice(0, 9));
    setSelectedImages([]);
    setHighlighted([]);
    setShowGrid(false);
    setCurrentImage(null);

    newShownImages.forEach((img, index) => {
      setTimeout(() => {
        setCurrentImage(img);
      }, index * 3000);
    });

    setTimeout(() => {
      setCurrentImage(null);
      setShowGrid(true);
    }, 9000);
  };

  const handleSelect = (img) => {
    // Play the click sound when selecting a card
    const clickAudio = new Audio(clickSound);
    clickAudio.play();

    if (selectedImages.includes(img)) {
      setSelectedImages(selectedImages.filter((i) => i !== img));
    } else {
      if (selectedImages.length < 3) {
        setSelectedImages([...selectedImages, img]);
      }
    }
  };

  const checkAnswer = () => {
    const correctAudio = new Audio(correctSound);
    const wrongAudio = new Audio(wrongSound);
    if (selectedImages.sort().toString() === shownImages.sort().toString()) {
      correctAudio.play();
      setCorrectRounds(correctRounds + 1); // Increment correct rounds
      if (round < maxRounds) {
        setTimeout(() => setRound(round + 1), 2000);
      } else {
        alert("Game Completed!");
        setRound(1); // Reset the round
        setCorrectRounds(0); // Reset the correct rounds
      }
    } else {
      setHighlighted(shownImages);
      wrongAudio.play();
      navigator.vibrate(500); // Vibrate on wrong answer
      setTimeout(() => {
        setHighlighted([]);
        if (round < maxRounds) {
          setRound(round + 1);
        } else {
          alert("Game Completed!");
          setRound(1); // Reset the round
          setCorrectRounds(0); // Reset the correct rounds
        }
      }, 1000);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#16244d",
          textAlign: "center",
          marginBottom: "10px",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
          fontFamily: "'Arial', sans-serif",
        }}
      >
        Memory Game - Round {round}
      </h1>
      <br />
      <p
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#16244d",
          textAlign: "center",
          marginBottom: "20px",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
          fontFamily: "'Arial', sans-serif",
        }}
      >
        Score: {correctRounds}/{maxRounds}
      </p>
      {!showGrid ? (
        <div>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#16244d",
              textAlign: "center",
              marginBottom: "20px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
              fontFamily: "'Arial', sans-serif",
            }}
          >
            Memorize the image
          </p>
          {currentImage && (
            <img src={currentImage} alt="memory" style={{ width: 300, height: 300, margin: 10 }} />
          )}
        </div>
      ) : (
        <div>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#16244d",
              textAlign: "center",
              marginBottom: "20px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
              fontFamily: "'Arial', sans-serif",
            }}
          >
            Select the images have you seen before
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 150px)",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            {allImages.map((img) => (
              <img
                key={img}
                src={img}
                alt="grid"
                onClick={() => handleSelect(img)}
                style={{
                  width: 150,
                  height: 150,
                  border: selectedImages.includes(img)
                    ? "3px solid green"
                    : "3px solid transparent",
                  backgroundColor: highlighted.includes(img) ? "red" : "transparent",
                }}
              />
            ))}
          </div>
          <button
            onClick={checkAnswer}
            style={{
              backgroundColor: "#16244d",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              border: "none",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "background-color 0.3s",
              marginTop: 20,
            }}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Memory2;
