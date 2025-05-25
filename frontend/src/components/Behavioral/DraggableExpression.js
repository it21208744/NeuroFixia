import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import happy from "./images/happy.jpg";
import sad from "./images/sad.jpg";
import angry from "./images/angry.jpg";
import surprised from "./images/surprised.jpg";
import disgusted from "./images/disgusted.jpg";
import neutral from "./images/neutral.jpg";

const IMAGE_SIZE = 96;

const originalExpressions = [
  { id: 1, name: "Happy", src: happy, category: "Happy" },
  { id: 2, name: "Sad", src: sad, category: "Sad" },
  { id: 3, name: "Angry", src: angry, category: "Angry" },
  { id: 4, name: "Surprised", src: surprised, category: "Surprised" },
  { id: 5, name: "Disgusted", src: disgusted, category: "Disgusted" },
  { id: 6, name: "Neutral", src: neutral, category: "Neutral" },
];

const categories = ["Happy", "Sad", "Angry", "Surprised", "Disgusted", "Neutral"];

const emojiMap = {
  Happy: "😊",
  Sad: "😢",
  Angry: "😠",
  Surprised: "😲",
  Disgusted: "🤢",
  Neutral: "😐",
};

const shuffleArray = (array) => {
  // Fisher-Yates shuffle
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const DraggableExpression = ({ expression }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "expression",
    item: expression,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Box
      ref={drag}
      sx={{
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        m: 1,
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid #ccc",
        boxShadow: isDragging ? "0 0 10px #aaa" : "none",
        cursor: "move",
        opacity: isDragging ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        transition: "opacity 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
      }}
    >
      <img
        src={expression.src}
        alt={expression.name}
        style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, objectFit: "cover" }}
        draggable={false}
      />
    </Box>
  );
};

DraggableExpression.propTypes = {
  expression: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
};

const DropBasket = ({ category, onDropExpression }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "expression",
    drop: (item) => onDropExpression(item, category),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <Box
      ref={drop}
      sx={{
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        m: 1.5,
        p: 1,
        borderRadius: 2,
        border: "4px solid",
        borderColor: isOver ? "success.main" : "grey.300",
        backgroundColor: isOver ? "success.light" : "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        transition: "all 0.2s ease",
        boxShadow: isOver ? "0 0 10px green" : "none",
      }}
    >
      <Typography variant="h2" component="div" sx={{ mb: 0.5, lineHeight: 1 }}>
        {emojiMap[category]}
      </Typography>
      <Typography variant="subtitle1" component="div" fontWeight="bold" textAlign="center">
        {category} Basket
      </Typography>
    </Box>
  );
};

DropBasket.propTypes = {
  category: PropTypes.string.isRequired,
  onDropExpression: PropTypes.func.isRequired,
};

const FacialExpressionGame = () => {
  const [expressions, setExpressions] = useState([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setExpressions(shuffleArray(originalExpressions));
  }, []);

  const handleDrop = (item, dropCategory) => {
    const isCorrect = item.category === dropCategory;
    setFeedback(
      isCorrect
        ? `✅ Correct! ${item.name} goes in the ${dropCategory} basket.`
        : `❌ Incorrect! ${item.name} does not belong in the ${dropCategory} basket.`
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          p: 4,
          maxWidth: 700,
          mx: "auto",
          bgcolor: "background.default",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Facial Expression Sorting Game
        </Typography>

        <Grid container spacing={2} alignItems="flex-start">
          {/* Left column: draggable expressions */}
          <Grid item xs={5} container direction="column" alignItems="center">
            <Typography variant="h6" mb={2}>
              Drag Expressions
            </Typography>
            <Grid container direction="column" alignItems="center">
              {expressions.map((exp) => (
                <DraggableExpression key={exp.id} expression={exp} />
              ))}
            </Grid>
          </Grid>

          {/* Right column: drop baskets */}
          <Grid item xs={7} container direction="column" alignItems="center">
            <Typography variant="h6" mb={2}>
              Drop into Baskets
            </Typography>
            <Grid container direction="row" justifyContent="center" spacing={2}>
              {categories.map((cat) => (
                <Grid item key={cat}>
                  <DropBasket category={cat} onDropExpression={handleDrop} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {feedback && (
          <Typography
            variant="subtitle1"
            align="center"
            mt={4}
            color={feedback.startsWith("✅") ? "success.main" : "error.main"}
            fontWeight="medium"
          >
            {feedback}
          </Typography>
        )}
      </Box>
    </DndProvider>
  );
};

export default FacialExpressionGame;
