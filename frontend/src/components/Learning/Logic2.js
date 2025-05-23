import React, { useState, useEffect } from "react";

// Import all images
import Bflish1 from "../../components/Cognitive/Bflish1.jpeg";
import Bflish2 from "../../components/Cognitive/Bflish2.jpeg";
import Bflish3 from "../../components/Cognitive/Bflish3.jpeg";

import panda1 from "../../components/Cognitive/panda1.jpeg";
import panda2 from "../../components/Cognitive/panda2.jpeg";
import panda3 from "../../components/Cognitive/panda3.jpeg";

import nest1 from "../../components/Cognitive/nest1.jpeg";
import nest2 from "../../components/Cognitive/nest2.jpeg";
import nest3 from "../../components/Cognitive/nest3.jpeg";

import owl1 from "../../components/Cognitive/owl1.jpeg";
import owl2 from "../../components/Cognitive/owl2.jpeg";
import owl3 from "../../components/Cognitive/owl3.jpeg";

import tree1 from "../../components/Cognitive/tree1.jpeg";
import tree2 from "../../components/Cognitive/tree2.jpeg";
import tree3 from "../../components/Cognitive/tree3.jpeg";

// Patterns are ordered: [small, medium, big]
const patterns = [
  [Bflish1, Bflish2, Bflish3],
  [panda1, panda2, panda3],
  [nest1, nest2, nest3],
  [owl1, owl2, owl3],
  [tree1, tree2, tree3],
];

const Logic2 = () => {
  const [originalPattern, setOriginalPattern] = useState([]);
  const [cards, setCards] = useState([]);
  const [dropped, setDropped] = useState([null, null, null]);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const patternIndex = Math.floor(Math.random() * patterns.length);
    const selectedPattern = [...patterns[patternIndex]]; // small, medium, big
    const cardObjs = selectedPattern.map((img, index) => ({
      img,
      size: index === 0 ? "small" : index === 1 ? "medium" : "large",
    }));
    const shuffled = [...cardObjs].sort(() => Math.random() - 0.5);

    setOriginalPattern(cardObjs); // expected correct order
    setCards(shuffled); // shuffled drag items
    setDropped([null, null, null]);
    setIsCorrect(false);
  };

  const handleDrop = (index, card) => {
    if (dropped[index] !== null) return;
    const updated = [...dropped];
    updated[index] = card;
    setDropped(updated);
    setCards((prev) => prev.filter((c) => c.img !== card.img));

    if (updated.every((item) => item !== null)) {
      const correct = updated.every((item, i) => item.img === originalPattern[i].img);
      setIsCorrect(correct);
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const drag = (e, card) => {
    e.dataTransfer.setData("img", card.img);
    e.dataTransfer.setData("size", card.size);
  };

  const drop = (e, index) => {
    const img = e.dataTransfer.getData("img");
    const size = e.dataTransfer.getData("size");
    const card = { img, size };
    handleDrop(index, card);
  };

  const getSizeStyle = (size) => {
    switch (size) {
      case "small":
        return { width: "100px", height: "100px" };
      case "medium":
        return { width: "130px", height: "130px" };
      case "large":
        return { width: "160px", height: "160px" };
      default:
        return { width: "80px", height: "80px" };
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1>Logic Activity 2</h1>
      <p>
        Drag and drop the images from <strong>small → medium → big</strong>
      </p>

      {/* Draggable cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        {cards.map((card, idx) => (
          <img
            key={idx}
            src={card.img}
            alt={`card-${idx}`}
            draggable
            onDragStart={(e) => drag(e, card)}
            style={{
              ...getSizeStyle(card.size),
              objectFit: "contain",
              border: "2px solid #555",
              borderRadius: "8px",
              cursor: "grab",
              padding: "5px",
              backgroundColor: "#fff",
            }}
          />
        ))}
      </div>

      {/* Drop zones */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {dropped.map((card, idx) => (
          <div
            key={idx}
            onDragOver={allowDrop}
            onDrop={(e) => drop(e, idx)}
            style={{
              width: "160px",
              height: "160px",
              border: "2px dashed #999",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {card && (
              <img
                src={card.img}
                alt={`dropped-${idx}`}
                style={{
                  ...getSizeStyle(card.size),
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Result message */}
      {dropped.every((img) => img !== null) && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            color: isCorrect ? "green" : "red",
          }}
        >
          {isCorrect
            ? "✅ Great job! You ordered them correctly."
            : "❌ Try again. That's not the correct order."}
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={resetGame}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Shuffle New Pattern
      </button>
    </div>
  );
};

export default Logic2;
