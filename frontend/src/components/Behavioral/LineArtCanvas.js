import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

const LineArtCanvas = ({ points }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear the canvas
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Customize stroke styles
    ctx.lineWidth = 0.5;

    // Draw lines
    points.forEach((point, index) => {
      const { x, y, color } = point;

      ctx.beginPath();
      if (index > 0) {
        const prevPoint = points[index - 1];
        ctx.moveTo(prevPoint.x, prevPoint.y); // Start at the previous point
      }
      ctx.lineTo(x, y); // Draw line to current point
      ctx.strokeStyle = color || `hsl(${Math.random() * 360}, 100%, 50%)`; // Random colors
      ctx.stroke();
    });
  }, [points]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
};

LineArtCanvas.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
};

export default LineArtCanvas;
