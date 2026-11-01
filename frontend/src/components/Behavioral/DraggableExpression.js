import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import api from "api/client";
import correctSound from "components/Cognitive/correctselect.mp3";
import wrongSound from "components/Cognitive/wrongselect.mp3";

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

const DraggableExpression = ({ expression, selected, onSelect }) => {
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
      onClick={() => onSelect(expression)}
      role="button"
      aria-pressed={selected}
      sx={{
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        m: 1,
        borderRadius: 1,
        overflow: "hidden",
        border: selected ? "3px solid #1A73E8" : "1px solid #ccc",
        boxShadow: isDragging || selected ? "0 0 10px #90caf9" : "none",
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
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

const DropBasket = ({ category, onDropExpression, onTap }) => {
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
      onClick={onTap}
      sx={{
        cursor: "pointer",
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
        {category}
      </Typography>
    </Box>
  );
};

DropBasket.propTypes = {
  category: PropTypes.string.isRequired,
  onDropExpression: PropTypes.func.isRequired,
  onTap: PropTypes.func.isRequired,
};

const FacialExpressionGame = () => {
  const [expressions, setExpressions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [saved, setSaved] = useState(false);

  const reset = () => {
    setExpressions(shuffleArray(originalExpressions));
    setFeedback("");
    setSelected(null);
    setAttempts(0);
    setSaved(false);
    setStartedAt(Date.now());
  };
  useEffect(reset, []);

  const finished = expressions.length === 0 && attempts > 0;

  useEffect(() => {
    if (finished && !saved) {
      setSaved(true);
      api
        .post("/behavioral/expression-game", {
          correct: originalExpressions.length,
          total: attempts,
          seconds: Math.round((Date.now() - startedAt) / 1000),
        })
        .catch(() => {});
    }
  }, [finished]);

  // Bug fix: correctly sorted faces now leave the list, so the game can actually be completed.
  const handleDrop = (item, dropCategory) => {
    setAttempts((n) => n + 1);
    setSelected(null);
    const isCorrect = item.category === dropCategory;
    if (isCorrect) {
      setExpressions((list) => list.filter((e) => e.id !== item.id));
      new Audio(correctSound).play().catch(() => {});
    } else {
      new Audio(wrongSound).play().catch(() => {});
    }
    setFeedback(
      isCorrect
        ? `✅ Great! That face is ${dropCategory.toLowerCase()}.`
        : `❌ Not quite - that face is not ${dropCategory.toLowerCase()}. Try again!`
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          maxWidth: 760,
          mx: "auto",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          Facial Expression Sorting Game
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={2}>
          Drag each face into the matching basket - or tap a face, then tap a basket.
        </Typography>
        {finished && (
          <Box textAlign="center" my={3}>
            <Typography variant="h5" color="success.main">
              🎉 All faces sorted in {attempts} tries!
            </Typography>
            <Button variant="contained" onClick={reset} sx={{ mt: 2, color: "#fff !important" }}>
              Play again
            </Button>
          </Box>
        )}

        <Grid container spacing={2} alignItems="flex-start">
          {/* Left column: draggable expressions */}
          <Grid item xs={5} container direction="column" alignItems="center">
            <Typography variant="h6" mb={2}>
              Drag Expressions
            </Typography>
            <Grid container direction="column" alignItems="center">
              {expressions.map((exp) => (
                <DraggableExpression
                  key={exp.id}
                  expression={exp}
                  selected={selected?.id === exp.id}
                  onSelect={(e) => setSelected(selected?.id === e.id ? null : e)}
                />
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
                  <DropBasket
                    category={cat}
                    onDropExpression={handleDrop}
                    onTap={() => selected && handleDrop(selected, cat)}
                  />
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
