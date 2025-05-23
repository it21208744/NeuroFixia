import React, { useState } from "react";
import bird1 from "../../components/Cognitive/1bird.png";
import bird2 from "../../components/Cognitive/2bird.png";
import bird3 from "../../components/Cognitive/3bird.png";
import bird4 from "../../components/Cognitive/4bird.png";
import bird5 from "../../components/Cognitive/5bird.png";
import birds5 from "../../components/Cognitive/5birds.png";
import correctSound from "../../components/Cognitive/correctselect.mp3";
import wrongSound from "../../components/Cognitive/wrongselect.mp3";

const imageStyle = {
  border: "3px solid black", // Adds a black border
  objectFit: "cover", // Ensures the image fits inside the rounded frame
  borderRadius: "10px", // Optional: Adds rounded corners
  marginLeft: "350px",
};

const buttonStyle = {
  backgroundColor: "#16244d",
  color: "white",
  padding: "10px 20px",
  borderRadius: "5px",
  fontSize: "20px",
  cursor: "pointer",
  border: "none",
  margin: "20px 10px",
  width: 50,
  height: 50,
  marginLeft: "360px",
  marginRight: "-280px",
};

const images = [
  { src: bird1, count: 1, width: 460, height: 460 },
  { src: bird2, count: 2, width: 460, height: 460 },
  { src: bird3, count: 3, width: 460, height: 460 },
  { src: bird4, count: 4, width: 460, height: 460 },
  { src: bird5, count: 5, width: 460, height: 460 },
  { src: birds5, count: 6, width: 460, height: 460 },
];

const Attention3 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState("");

  const currentImage = images[currentIndex];

  // Generate options for buttons and ensure 4 buttons are displayed
  let options = Array.from({ length: 4 }, (_, i) => currentImage.count - 1 + i);

  // Ensure exactly 4 options by replacing any filtered-out values
  options = options.filter((num) => num > 0);
  while (options.length < 4) {
    options.push(options[options.length - 1] + 1);
  }

  const handleAnswer = (answer) => {
    if (answer === currentImage.count) {
      setMessage("Correct!");
      const correctAudio = new Audio(correctSound);
      correctAudio.play();

      setTimeout(() => {
        setMessage("");
        if (currentIndex < images.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          alert("Game Over! Well done.");
          setCurrentIndex(0);
        }
      }, 1000);
    } else {
      setMessage("Try Again!");
      const wrongAudio = new Audio(wrongSound);
      wrongAudio.play();
    }
  };

  return (
    <div className="text-center p-4">
      <h1 style={{ marginLeft: "450px", fontSize: "2.5rem", fontWeight: "bold", color: "#16244d" }}>
        Count the Birds
      </h1>
      <img
        src={currentImage.src}
        alt={`Birds ${currentImage.count}`}
        width={currentImage.width}
        height={currentImage.height}
        className="mx-auto mb-4"
        style={imageStyle}
      />
      <div className="flex justify-center gap-2">
        {options.map((num) => (
          <button key={num} onClick={() => handleAnswer(num)} style={buttonStyle}>
            {num}
          </button>
        ))}
      </div>
      {message && <p className="mt-4 font-semibold">{message}</p>}
    </div>
  );
};

export default Attention3;
