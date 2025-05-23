import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Images
import cogni from "../../components/Cognitive/group.png";
import logicGame from "../../components/Cognitive/logicgame.PNG";
import memoryGame from "../../components/Cognitive/memory.PNG";
import attentionGame from "../../components/Cognitive/sa.PNG";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import { Grid } from "@mui/material";

import "./Calibrator.css";

const Calibrator = () => {
  const webgazer = window.webgazer;
  const navigate = useNavigate();

  useEffect(() => {
    webgazer
      .setRegression("ridge")
      .showVideo(false)
      .begin()
      .then(() => console.log("WebGazer initialized"));

    return () => {
      webgazer.clearGazeListener();
    };
  }, []);

  return (
    <DashboardLayout>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            {/* Header Section */}
            <div className="image-container">
              <img src={cogni} alt="Calibrator Logo" className="calibrator-image" />
              <div className="student-overlay">Cognitive Skills Empowerment for Autism</div>
            </div>

            {/* Game Section */}
            <div className="game-row">
              {/* Logic Game */}
              <div className="game-card">
                <img src={logicGame} alt="Logic Game" className="game-image" />
                <div className="game-title">Logic Game</div>
                <button className="game-button">Start Game</button>
              </div>

              {/* Memory Game */}
              <div className="game-card">
                <img src={memoryGame} alt="Memory Game" className="game-image" />
                <div className="game-title">Memory Game</div>
                <button className="game-button">Start Game</button>
              </div>

              {/* Attention Game */}
              <div className="game-card">
                <img src={attentionGame} alt="Attention Game" className="game-image" />
                <div className="game-title">Attention Game</div>
                <button className="game-button">Start Game</button>
              </div>
            </div>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default Calibrator;
