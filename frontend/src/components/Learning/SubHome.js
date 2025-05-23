import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import cogni from "../../components/Cognitive/group.png"; // Ensure the path to the image file is correct
import logicGame from "../../components/Cognitive/logicgame.PNG";
import memoryGame from "../../components/Cognitive/memory.PNG"; // Path to the memory game image
import attentionGame from "../../components/Cognitive/sa.PNG"; // Path to the attention game image
import attentionI from "../../components/Cognitive/attentionI.png";
import attentionI1 from "../../components/Cognitive/attentionI1.jpeg";
import attentionI2 from "../../components/Cognitive/attentionI2.png";
import attentionI3 from "../../components/Cognitive/attentionI3.png";
import attentionI4 from "../../components/Cognitive/attentionI4.jpg";

import memoryI from "../../components/Cognitive/memoryI.jpg";
import memoryI1 from "../../components/Cognitive/memoryI1.jpg";
import memoryI2 from "../../components/Cognitive/memoryI2.jpg";
import memoryI3 from "../../components/Cognitive/memoryI3.jpg";
import memoryI4 from "../../components/Cognitive/memoryI4.jpeg";

import logicI from "../../components/Cognitive/logicI.jpg";
import logicI1 from "../../components/Cognitive/logicI1.jpeg";
import logicI2 from "../../components/Cognitive/logicI2.png";
import logicI3 from "../../components/Cognitive/logicI3.jpg";
import logicI4 from "../../components/Cognitive/logicI4.png";

import "./SubHome.css"; // Link to the CSS file

function SubHome({ onSelectActivity }) {
  return (
    <>
      {/* Game Section */}

      <h2 style={{ marginLeft: "400px", fontSize: "2.5rem", fontWeight: "bold", color: "#16244d" }}>
        Suggestion Activities
      </h2>
      <h2 style={{ marginLeft: "10px" }}>Attention Activities</h2>
      <div className="subHome-game-row" style={{ marginLeft: "250px" }}>
        {/* Attention Game */}
        <div className="subHome-game-card">
          <img src={attentionI} alt="Attention Game 1" className="subHome-game-image" />
          <div className="subHome-game-title">Attention1</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Attention1")}>
            Start Game
          </button>
        </div>

        <div className="subHome-game-card">
          <img src={attentionI1} alt="Attention Game 2" className="subHome-game-image" />
          <div className="subHome-game-title">Attention2</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Attention2")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={attentionI2} alt="Attention Game 3" className="subHome-game-image" />
          <div className="subHome-game-title">Attention3</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Attention3")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={attentionI3} alt="Attention Game 4" className="subHome-game-image" />
          <div className="subHome-game-title">Attention4</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Attention4")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={attentionI4} alt="Attention Game 5" className="subHome-game-image" />
          <div className="subHome-game-title">Attention5</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Attention5")}>
            Start Game
          </button>
        </div>
      </div>
      <h2 style={{ marginLeft: "10px", marginTop: "50px" }}>Memory Activities</h2>
      <div className="subHome-game-row" style={{ marginLeft: "250px" }}>
        {/* Memory Game */}
        <div className="subHome-game-card">
          <img src={memoryI} alt="Memory Game 1" className="subHome-game-image" />
          <div className="subHome-game-title">Memory1</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Memory1")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={memoryI1} alt="Memory Game 2" className="subHome-game-image" />
          <div className="subHome-game-title">Memory2</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Memory2")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={memoryI2} alt="Memory Game 3" className="subHome-game-image" />
          <div className="subHome-game-title">Memory3</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Memory3")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={memoryI3} alt="Memory Game 4" className="subHome-game-image" />
          <div className="subHome-game-title">Memory4</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Memory4")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={memoryI4} alt="Memory Game 5" className="subHome-game-image" />
          <div className="subHome-game-title">Memory5</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Memory5")}>
            Start Game
          </button>
        </div>
      </div>
      <h2 style={{ marginLeft: "10px", marginTop: "50px" }}>Logical Thinking Activities</h2>
      <div className="subHome-game-row" style={{ marginLeft: "250px" }}>
        {/* Logic Game */}
        <div className="subHome-game-card">
          <img src={logicI} alt="Logic Game 1" className="subHome-game-image" />
          <div className="subHome-game-title">Logic1</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Logic1")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={logicI1} alt="Logic Game 2" className="subHome-game-image" />
          <div className="subHome-game-title">Logic2</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Logic2")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={logicI2} alt="Logic Game 3" className="subHome-game-image" />
          <div className="subHome-game-title">Logic3</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Logic3")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={logicI3} alt="Logic Game 4" className="subHome-game-image" />
          <div className="subHome-game-title">Logic4</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Logic4")}>
            Start Game
          </button>
        </div>
        <div className="subHome-game-card">
          <img src={logicI4} alt="Logic Game 5" className="subHome-game-image" />
          <div className="subHome-game-title">Logic5</div>
          <button className="subHome-game-button" onClick={() => onSelectActivity("Logic5")}>
            Start Game
          </button>
        </div>
      </div>
    </>
  );
}
SubHome.propTypes = {
  onSelectActivity: PropTypes.func.isRequired,
};

export default SubHome;
