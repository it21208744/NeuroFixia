import React, { useState, useEffect } from "react";
import "./Memory1.css"; // Import CSS for blinking animation

import meenaImage from "../../components/Cognitive/Meena.png";
import rosiImage from "../../components/Cognitive/Rosi.png";
import royImage from "../../components/Cognitive/Roy.png";
import pinkyImage from "../../components/Cognitive/Pinky.png";
import ruwanImage from "../../components/Cognitive/Ruwan.png";

import meenaAudio from "../../components/Cognitive/meena1.mp3";
import rosiAudio from "../../components/Cognitive/rosi.mp3";
import royAudio from "../../components/Cognitive/roy.mp3";
import pinkyAudio from "../../components/Cognitive/pinky.mp3";
import ruwanAudio from "../../components/Cognitive/ruwan.mp3";

const students = [
  { name: "Meena", image: meenaImage, audio: meenaAudio },
  { name: "Rosi", image: rosiImage, audio: rosiAudio },
  { name: "Roy", image: royImage, audio: royAudio },
  { name: "Pinky", image: pinkyImage, audio: pinkyAudio },
  { name: "Ruwan", image: ruwanImage, audio: ruwanAudio },
];

const Memory1 = () => {
  const [step, setStep] = useState(0);
  const [showTest, setShowTest] = useState(false);
  const [score, setScore] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false); // Control blinking effect

  useEffect(() => {
    if (step < students.length) {
      setIsBlinking(true); // Start blinking when audio plays
      const audio = new Audio(students[step].audio);
      audio.play();
      audio.onended = () => setIsBlinking(false); // Stop blinking when audio ends
    } else {
      setShowTest(true);
    }
  }, [step]);

  const handleNext = () => setStep(step + 1);

  const handleSelection = (selected, correct) => {
    if (selected === correct) setScore(score + 1);
    setStep(step + 1);
  };

  return (
    <div className="p-4 text-center">
      <h1 className="activity-title"> Fun Name Memory Game!👦👧👦👧👧 </h1>
      <p className="subtitle">Listen carefully, remember the names, and match them correctly!</p>

      {!showTest ? (
        step < students.length ? (
          <div className="child-container">
            <h1 className="child-name">Hi {students[step].name} 👋</h1>
            <img
              src={students[step].image}
              alt={students[step].name}
              width={280}
              className={isBlinking ? "blink" : ""} // Apply blinking effect conditionally
            />

            <buttonm onClick={handleNext} className="mt-4 p-2 bg-blue-500 text-white rounded">
              Next
            </buttonm>
          </div>
        ) : (
          <h2>Loading test...</h2>
        )
      ) : step - students.length < students.length ? (
        <div>
          <h2 style={{ marginLeft: "300px" }}>🤔 Can you remember their name? 👀</h2>
          <img
            src={students[step - students.length].image}
            alt="Test Child"
            width={250}
            className="test-image-left"
          />
          <div className="mt-4">
            {students.map((student) => (
              <button
                key={student.name}
                onClick={() => handleSelection(student.name, students[step - students.length].name)}
                className="buttonA" // Apply buttonA class
              >
                {student.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <h2 style={{ marginLeft: "400px" }}>Test completed! Your score: {score}/5</h2>
      )}
    </div>
  );
};

export default Memory1;
