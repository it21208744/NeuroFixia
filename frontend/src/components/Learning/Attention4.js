import React, { useState } from "react";

const Attention4 = () => {
  const totalPieces = 9;
  const [grid, setGrid] = useState(Array(totalPieces).fill(null));
  const [score, setScore] = useState(null);

  const correctOrder = [
    "image_part_009.png",
    "image_part_008.png",
    "image_part_007.png",
    "image_part_006.png",
    "image_part_005.png",
    "image_part_004.png",
    "image_part_003.png",
    "image_part_002.png",
    "image_part_001.png",
  ];

  // Load sound
  const playDropSound = () => {
    const audio = new Audio("/images/dragClick.mp3");
    audio.play();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const imageId = e.dataTransfer.getData("imageId");
    const newGrid = [...grid];
    newGrid[index] = imageId;
    setGrid(newGrid);

    // Play sound
    playDropSound();

    // If puzzle is completed, calculate score
    if (newGrid.every((cell) => cell !== null)) {
      calculateScore(newGrid);
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const handleDragStart = (e, imageId) => {
    e.dataTransfer.setData("imageId", imageId);
  };

  const calculateScore = (userGrid) => {
    let count = 0;
    for (let i = 0; i < totalPieces; i++) {
      if (userGrid[i] === correctOrder[i]) {
        count++;
      }
    }
    setScore(count);
  };

  const imageParts = Array.from({ length: totalPieces }, (_, i) => `image_part_00${i + 1}.png`);

  // Inline styles
  const styles = {
    container: {
      padding: "20px",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
    },
    referenceImage: {
      width: "200px",
      border: "2px dashed #ccc",
      marginBottom: "5px",
    },
    referenceCaption: {
      fontStyle: "italic",
      marginBottom: "20px",
    },
    gameArea: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 100px)",
      gap: "10px",
      marginBottom: "20px",
    },
    gridCell: {
      width: "100px",
      height: "100px",
      border: "2px solid #444",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9f9f9",
    },
    pieceImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    draggableContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "center",
    },
    draggableImage: {
      width: "80px",
      height: "80px",
      cursor: "grab",
      border: "1px solid #999",
    },
    scoreText: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#006400",
    },
  };

  return (
    <div style={styles.container}>
      <h1>Attention Activity 4</h1>
      <p>Drag the image parts into the correct grid cells to complete the dog picture.</p>

      <div>
        <img src="/images/dog.png" alt="Dog Reference" style={styles.referenceImage} />
        <div style={styles.referenceCaption}>Reference image</div>
      </div>

      <div style={styles.gameArea}>
        <div style={styles.grid}>
          {grid.map((cell, index) => (
            <div
              key={index}
              style={styles.gridCell}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={allowDrop}
            >
              {cell && (
                <img src={`/images/${cell}`} alt={`Part ${index + 1}`} style={styles.pieceImage} />
              )}
            </div>
          ))}
        </div>

        <div style={styles.draggableContainer}>
          {imageParts.map((part, index) =>
            !grid.includes(part) ? (
              <img
                key={index}
                src={`/images/${part}`}
                alt={`Part ${index + 1}`}
                draggable
                onDragStart={(e) => handleDragStart(e, part)}
                style={styles.draggableImage}
              />
            ) : null
          )}
        </div>

        {score !== null && <div style={styles.scoreText}>You scored {score} out of 9!</div>}
      </div>
    </div>
  );
};

export default Attention4;
