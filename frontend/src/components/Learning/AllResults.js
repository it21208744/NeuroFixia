import { useContext, useState } from "react";
import { DataContext } from "layouts/Learning";
import * as XLSX from "xlsx";
import axios from "axios"; // Import axios for API requests
import { useNavigate } from "react-router-dom";

const AllResults = () => {
  const {
    fixationDuration,
    gazeShiftsCount,
    shadowScore,
    accuracy,
    elapsedTime,
    memoryScore,
    totalTime,
    errors,
    score,
    formatTime,
  } = useContext(DataContext);

  const [predictionResult, setPredictionResult] = useState(null);
  const [probabilityAutism, setProbabilityAutism] = useState(null);
  const [probabilityTD, setProbabilityTD] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [dataSaved, setDataSaved] = useState(false);
  const [attentionLevel, setAttentionLevel] = useState(null);
  const [logicalThinkingLevel, setLogicalThinkingLevel] = useState(null);
  const [memoryLevel, setMemoryLevel] = useState(null);
  const [showSuggestionButton, setShowSuggestionButton] = useState(false);

  const navigate = useNavigate(); // Initialize navigate function

  const getPerformanceLevel = (score) => {
    if (score >= 71) return "Good";
    if (score >= 41) return "Moderate";
    return "Low";
  };

  const handleSubmit = async (label) => {
    const excelData = [
      {
        Fixation_Duration: fixationDuration,
        Gaze_Shift_Count: gazeShiftsCount,
        Attention_Score: shadowScore,
        Memory_Recall_Accuracy: Number(accuracy.toFixed(2)),
        Response_Time: formatTime(elapsedTime),
        Memory_Score: Number(memoryScore.toFixed(2)),
        Logical_Task_Completion_Time: totalTime,
        Logical_Task_Errors: errors,
        Logical_Score: score,
        AUTISM_LABEL: label,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Game Results");

    await new Promise((resolve) => {
      XLSX.writeFile(workbook, "Game_Results.xlsx");
      setTimeout(resolve, 1000);
    });

    try {
      const data = {
        accuracy: Number(accuracy.toFixed(2)),
        memoryScore: Number(memoryScore.toFixed(2)),
        timeSpent: Number(elapsedTime),
        gazeShiftsCount: Number(gazeShiftsCount),
        fixationDuration: Number(fixationDuration),
        attentionScore: Number(shadowScore),
        score: Number(score),
        errors: Number(errors),
        totalTime: Number(totalTime),
      };

      await axios.post("http://localhost:8080/game/add", data);
      console.log("Data sent to database successfully");
      setDataSaved(true);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handlePredict = async () => {
    if (!dataSaved) {
      alert("Please save data first by clicking ASD or TD button.");
      return;
    }

    try {
      const requestData = {
        features: [
          Number(fixationDuration),
          Number(gazeShiftsCount),
          Number(shadowScore),
          Number(accuracy),
          Number(elapsedTime),
          Number(memoryScore),
          Number(totalTime),
          Number(errors),
          Number(score),
        ],
      };

      console.log("Sending request data:", requestData);

      const response = await axios.post("http://127.0.0.1:5000/predict", requestData);

      const { prediction, probability_autism, probability_td, confidence_score } = response.data;

      setPredictionResult(prediction);
      setProbabilityAutism(probability_autism);
      setProbabilityTD(probability_td);
      setConfidenceScore(confidence_score);
      setAttentionLevel(getPerformanceLevel(shadowScore));
      setMemoryLevel(getPerformanceLevel(memoryScore));
      setLogicalThinkingLevel(getPerformanceLevel(score));

      setShowSuggestionButton(true); // Always show suggestion button after prediction
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  const handleSuggestionClick = () => {
    navigate("/subhome"); // Navigate to SubHome page
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={() => handleSubmit("ASD")}
        style={{ ...styles.cButton, marginLeft: "800px" }}
      >
        AUTISM
      </button>
      <button onClick={() => handleSubmit("TD")} style={{ ...styles.cButton, marginLeft: "40px" }}>
        TD
      </button>
      <button
        onClick={handlePredict}
        style={{ ...styles.cButton, marginLeft: "40px" }}
        disabled={!dataSaved}
      >
        Predict
      </button>

      {predictionResult !== null && (
        <div className="prediction-result">
          <h2 style={{ marginLeft: "40px" }}>
            Prediction Result: {predictionResult === 1 ? "Autistic" : "Typical Development (TD)"}
          </h2>
          <p style={{ marginLeft: "40px" }}>
            <strong>Probability of Cognitive Disabilities:</strong> {probabilityAutism}%
          </p>
          <p style={{ marginLeft: "40px" }}>
            <strong>Probability of Strong Cognitive Abilities:</strong> {probabilityTD}%
          </p>
          <p style={{ marginLeft: "40px" }}>
            <strong>Confidence Score:</strong> {confidenceScore}%
          </p>
          <br />
          <br />
          <h3 style={{ marginLeft: "40px" }}>Performance Levels</h3>
          <p style={{ marginLeft: "40px" }}>
            <strong>Attention:</strong> {attentionLevel}
          </p>
          <p style={{ marginLeft: "40px" }}>
            <strong>Logical Thinking:</strong> {logicalThinkingLevel}
          </p>
          <p style={{ marginLeft: "40px" }}>
            <strong>Memory:</strong> {memoryLevel}
          </p>
          <br />
          <br />
          {showSuggestionButton && (
            <button
              onClick={handleSuggestionClick}
              className="suggestion-button"
              style={{ ...styles.cButton, marginBottom: "10px" }}
            >
              Suggest Activity
            </button>
          )}

          {(attentionLevel === "Low" ||
            logicalThinkingLevel === "Low" ||
            memoryLevel === "Low") && (
            <div>
              <p>
                It looks like your child is facing challenges with{" "}
                {[
                  attentionLevel === "Low" ? "Attention" : null,
                  logicalThinkingLevel === "Low" ? "Logical Thinking" : null,
                  memoryLevel === "Low" ? "Memory" : null,
                ]
                  .filter(Boolean)
                  .join(" & ")}
                . With the right suggestion activities, they can improve. Good luck!
              </p>
              <br />
              {attentionLevel === "Low" && (
                <button
                  className="low-level-button"
                  style={{ ...styles.cButton, marginLeft: "10px" }}
                >
                  Attention
                </button>
              )}
              {logicalThinkingLevel === "Low" && (
                <button
                  className="low-level-button"
                  style={{ ...styles.cButton, marginRight: "30px" }}
                >
                  Logical Thinking
                </button>
              )}
              {memoryLevel === "Low" && (
                <button
                  className="low-level-button"
                  style={{ ...styles.cButton, marginLeft: "30px" }}
                >
                  Memory
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div style={styles.resultImage}>
        <img src="/images/result.png" alt="Result" style={styles.image} />
      </div>
    </div>
  );
};

const styles = {
  resultImage: {
    marginTop: "0px",
    textAlign: "center",
  },
  image: {
    width: "1000px",
    height: "500px",
    display: "block",
    margin: "0 auto",
  },
  cButton: {
    backgroundColor: "#16244d",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s",
  },
  lowLevelButton: {
    backgroundColor: "#FF6347", // Red color for low-level skill buttons
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s",
  },
};

export default AllResults;
