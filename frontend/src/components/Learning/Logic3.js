import React, { useState } from "react";

const GRID_ROWS = 4;
const GRID_COLS = 5;

// Auto-filled images
const filledCells = {
  "1x1": "image1x1.jpg",
  "4x1": "image4x1.jpg",
  "5x1": "image5x1.jpg",
  "1x2": "image1x2.jpg",
  "2x2": "image2x2.jpg",
  "3x2": "image3x2.jpg",
  "5x2": "image5x2.jpg",
  "5x3": "image5x3.jpg",
  "1x4": "image1x4.jpg",
  "5x4": "image5x4.jpg",
};

// Draggable image pieces
const draggableImages = [
  "image2x1.jpg",
  "image3x1.jpg",
  "image4x2.jpg",
  "image1x3.jpg",
  "image2x3.jpg",
  "image3x3.jpg",
  "image4x3.jpg",
  "image2x4.jpg",
  "image3x4.jpg",
  "image4x4.jpg",
];

const Logic3 = () => {
  const [grid, setGrid] = useState({});

  const handleDrop = (e, row, col) => {
    const imageName = e.dataTransfer.getData("text/plain");
    const newGrid = { ...grid, [`${col}x${row}`]: imageName };
    setGrid(newGrid);
  };

  const handleDragStart = (e, imageName) => {
    e.dataTransfer.setData("text/plain", imageName);
  };

  const getImageForCell = (col, row) => {
    const key = `${col}x${row}`;
    if (filledCells[key]) return `/images/${filledCells[key]}`;
    if (grid[key]) return `/images/${grid[key]}`;
    return null;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Logic Activity 3</h1>
      <p>Complete the grid by dragging and dropping the correct pieces.</p>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 100px)", gap: "5px" }}>
        {Array.from({ length: GRID_ROWS }, (_, rowIndex) =>
          Array.from({ length: GRID_COLS }, (_, colIndex) => {
            const row = rowIndex + 1;
            const col = colIndex + 1;
            const key = `${col}x${row}`;
            const imageSrc = getImageForCell(col, row);

            return (
              <div
                key={key}
                onDrop={(e) => handleDrop(e, row, col)}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  width: "100px",
                  height: "100px",
                  border: "2px dashed #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt={key}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    draggable={false}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Draggable Image Bank */}
      <h2 style={{ marginTop: "30px" }}>Available Pieces</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {draggableImages.map((img, index) => (
          <img
            key={index}
            src={`/images/${img}`}
            alt={img}
            draggable
            onDragStart={(e) => handleDragStart(e, img)}
            style={{
              width: "80px",
              height: "80px",
              border: "1px solid #ddd",
              cursor: "grab",
              objectFit: "cover",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Logic3;
