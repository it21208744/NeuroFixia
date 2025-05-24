import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

const LineArtCanvas = ({ points, width = 300, height = 300 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear and prepare canvas
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // Get max screen dimensions to normalize
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    if (screenW === 0 || screenH === 0) return;

    points.forEach((point, index) => {
      const normX = (point.x / screenW) * width;
      const normY = (point.y / screenH) * height;

      ctx.beginPath();
      if (index > 0) {
        const prev = points[index - 1];
        const prevX = (prev.x / screenW) * width;
        const prevY = (prev.y / screenH) * height;
        ctx.moveTo(prevX, prevY);
      }
      ctx.lineTo(normX, normY);
      ctx.strokeStyle = point.color || `hsl(${Math.random() * 360}, 100%, 50%)`;
      ctx.stroke();
    });
  }, [points, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "1px solid #ccc",
        backgroundColor: "black",
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
};

LineArtCanvas.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default LineArtCanvas;
