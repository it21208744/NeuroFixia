import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import CircularProgress from "@mui/material/CircularProgress";
import { Height } from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  height: 700,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function ResultsModal({ modalOpen, handleModalOpen, handleModalClose, data }) {
  useEffect(() => {
    console.log(data);
  }, [data]);

  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div>
      <Button onClick={handleModalOpen}>Open modal</Button>
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {!data || Object.keys(data).length === 0 ? (
            <CircularProgress />
          ) : (
            <div
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                Autism Risk Assessment Results
              </h2>

              {/* Behavior Section */}
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#f3f3f3",
                  borderRadius: "8px",
                }}
              >
                <h3>Behavioral Risk</h3>
                <p>
                  Model Confidence:{" "}
                  {data.details.behavior.confidence !== null
                    ? `${(data.details.behavior.confidence * 100).toFixed(2)}%`
                    : "Poor video quality"}
                </p>
                <p>
                  Prediction:{" "}
                  <strong>{data.details.behavior.prediction || "Poor video quality"}</strong>
                </p>
              </div>

              {/* Facial Expressions Section */}
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#f3f3f3",
                  borderRadius: "8px",
                }}
              >
                <h3>Facial Expressions Recognition</h3>
                <p>
                  Model Confidence:{" "}
                  {data.details.facial_expressions_recognition.confidence !== null
                    ? `${(data.details.facial_expressions_recognition.confidence * 100).toFixed(
                        2
                      )}%`
                    : "N/A"}
                </p>
                <p>
                  Prediction:{" "}
                  <strong>{data.details.facial_expressions_recognition.prediction || "N/A"}</strong>
                </p>
              </div>

              {/* Heatmap Section */}
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#f3f3f3",
                  borderRadius: "8px",
                }}
              >
                <h3>Heatmap Analysis</h3>
                <p>
                  Model Confidence:{" "}
                  {data.details.heatmap.confidence !== null
                    ? `${(data.details.heatmap.confidence * 100).toFixed(2)}%`
                    : "N/A"}
                </p>
                <p>
                  Prediction: <strong>{data.details.heatmap.prediction || "N/A"}</strong>
                </p>
              </div>

              {/* Final Prediction */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  padding: "10px",
                  backgroundColor: "#d1f7d1",
                  borderRadius: "8px",
                }}
              >
                <h3>
                  Final Prediction:{" "}
                  <span style={{ color: "#007b00" }}>{data.final_prediction || "N/A"}</span>
                </h3>
                <p>
                  There is{" "}
                  {data.combined_confidence !== null
                    ? `${(data.combined_confidence * 100).toFixed(2)}%`
                    : "N/A"}{" "}
                  likelihood of exhibiting autistic traits.
                </p>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
}

ResultsModal.propTypes = {
  modalOpen: PropTypes.bool.isRequired,
  handleModalOpen: PropTypes.func.isRequired,
  handleModalClose: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};
