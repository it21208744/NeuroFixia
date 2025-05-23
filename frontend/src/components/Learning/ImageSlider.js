import React, { useState, useEffect } from "react";

const ImageSlider = () => {
  const totalPieces = 9;
  const gridSize = 3;
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const correctOrder = [
    "image_part_001.png",
    "image_part_002.png",
    "image_part_003.png",
    "image_part_004.png",
    "image_part_005.png",
    "image_part_006.png",
    "image_part_007.png",
    "image_part_008.png",
    "image_part_009.png",
  ];

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const parts = [...correctOrder];
    setGrid(shuffleArray(parts));
  }, []);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newGrid = [...grid];
    [newGrid[draggedIndex], newGrid[index]] = [newGrid[index], newGrid[draggedIndex]];
    setGrid(newGrid);
    setDraggedIndex(null);

    if (newGrid.every((val, i) => val === correctOrder[i])) {
      setScore(9); // perfect score
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Needed to allow drop
  };

  const styles = {
    container: {
      padding: "20px",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
    },
    referenceImage: {
      width: "200px",
      border: "2px dashed #ccc",
      marginBottom: "10px",
    },
    referenceCaption: {
      fontStyle: "italic",
      marginBottom: "20px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: `repeat(${gridSize}, 100px)`,
      gap: "5px",
      justifyContent: "center",
      marginBottom: "20px",
    },
    gridCell: {
      width: "100px",
      height: "100px",
      border: "2px solid #444",
      backgroundColor: "#eee",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      cursor: "grab",
    },
    scoreText: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#006400",
    },
  };

  return (
    <div style={styles.container}>
      <h1>Image Slider Puzzle</h1>
      <p>Drag and drop the tiles to complete the picture.</p>

      <img src="/images/dog.png" alt="Dog Reference" style={styles.referenceImage} />
      <div style={styles.referenceCaption}>Reference Image</div>

      <div style={styles.grid}>
        {grid.map((part, index) => (
          <div
            key={index}
            style={styles.gridCell}
            onDrop={() => handleDrop(index)}
            onDragOver={handleDragOver}
          >
            {part && (
              <img
                src={`/images/${part}`}
                alt={`Piece ${index + 1}`}
                style={styles.image}
                draggable
                onDragStart={() => handleDragStart(index)}
              />
            )}
          </div>
        ))}
      </div>

      {score !== null && (
        <div style={styles.scoreText}>You completed the puzzle! Score: {score}/9</div>
      )}
    </div>
  );
};

export default ImageSlider;
