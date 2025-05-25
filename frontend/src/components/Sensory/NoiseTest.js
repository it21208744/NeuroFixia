import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Collapse,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const NoiseTest = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [noisePlaying, setNoisePlaying] = useState(false);
  const [selectedNoise, setSelectedNoise] = useState("white_noise");
  const [age, setAge] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const audioRef = useRef(new Audio());

  const noises = {
    white_noise: "/sounds/sound1.mp3",
    nature: "/sounds/sound2.mp3",
    city: "/sounds/sound3.mp3",
  };

  // Start webcam and recording
  const startRecording = async () => {
    recordedChunks.current = [];
    setPrediction(null);
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        const file = new File([blob], "recorded_video.webm", {
          type: "video/webm",
        });
        setVideoBlob(URL.createObjectURL(blob));
        setVideoFile(file);
        // Stop webcam preview
        if (webcamRef.current && webcamRef.current.srcObject) {
          webcamRef.current.srcObject.getTracks().forEach((track) => track.stop());
          webcamRef.current.srcObject = null;
        }
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  // Toggle noise playback
  const toggleNoise = () => {
    if (noisePlaying) {
      audioRef.current.pause();
      setNoisePlaying(false);
    } else {
      audioRef.current.src = noises[selectedNoise];
      audioRef.current.loop = true;
      audioRef.current.play();
      setNoisePlaying(true);
    }
  };

  // Handle video file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type (optional)
    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }

    // Revoke the old object URL if any
    if (videoBlob) {
      URL.revokeObjectURL(videoBlob);
    }

    const newBlob = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoBlob(newBlob);
    setPrediction(null);
  };

  // Upload video to backend for prediction
  const handleVideoUpload = async () => {
    if (!videoFile) {
      alert("Please select or record a video first.");
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);

      const response = await axios.post("http://localhost:5031/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPrediction({
        finalPrediction: response.data.final_prediction,
        cnnLstmPrediction: response.data.cnn_lstm_prediction,
        confidenceHypersensitive: Math.round(response.data.confidence_hypersensitivity * 100),
        confidenceNotHypersensitive: Math.round(
          response.data.confidence_not_hypersensitivity * 100
        ),
        dominantEmotion: response.data.dominant_emotion,
        emotionAligned: response.data.emotion_alignment_with_hypersensitivity,
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error processing video. Please try again.");
    }
    setLoading(false);
  };

  // Age input validation for 3-7 years
  const handleAgeChange = (e) => {
    const inputAge = e.target.value;
    setAge(inputAge);
    if (parseInt(inputAge) >= 3 && parseInt(inputAge) <= 7) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 700, margin: "auto", mt: 5, p: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" gutterBottom>
            Auditory Hypersensitivity Test
          </Typography>
          <IconButton
            aria-label="toggle instructions"
            onClick={() => setHelpOpen((prev) => !prev)}
            size="large"
            color="primary"
          >
            <HelpOutlineIcon />
          </IconButton>
        </Box>

        <Collapse in={helpOpen} timeout="auto" unmountOnExit>
          <Box
            sx={{
              fontSize: "0.89rem",
              mb: 2,
              p: 2,
              bgcolor: "#f5f7fa",
              borderRadius: 2,
              border: "1px solid #ddd",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Instructions for Using the Auditory Hypersensitivity Test
            </Typography>
            <ol>
              <li>
                <b>Enter Child’s Age:</b> Input the age (between 3 and 7 years) to unlock the test.
              </li>
              <li>
                <b>Select Noise Type:</b> Choose the sound to play during the test.
              </li>
              <li>
                <b>Play Noise:</b> Click “Play Noise” to start and “Stop Noise” to stop the sound.
              </li>
              <li>
                <b>Record Reaction:</b> Click “Start Recording” to record the child's reaction via
                webcam. Click “Stop Recording” to end.
              </li>
              <li>
                <b>Or Upload Video:</b> You can upload a pre-recorded video instead of recording.
              </li>
              <li>
                <b>Upload and Predict:</b> Upload the recorded or uploaded video for analysis.
              </li>
              <li>
                <b>View Results:</b> After processing, results will appear below.
              </li>
              <li>
                <b>Permissions:</b> Ensure your browser has camera and microphone access.
              </li>
            </ol>
          </Box>
        </Collapse>

        <Typography mb={2}>
          Please enter the child's age. Only children aged 3 to 7 can proceed with the test.
        </Typography>

        <TextField
          fullWidth
          label="Enter Age (3-7 only)"
          type="number"
          value={age}
          onChange={handleAgeChange}
          inputProps={{ min: 3, max: 7 }}
          disabled={recording}
        />

        {!isUnlocked && age !== "" && (
          <Typography color="error" mt={2}>
            Only children aged 3 to 7 are allowed to take this test.
          </Typography>
        )}

        {isUnlocked && (
          <>
            <Box mt={3}>
              <Typography mb={1}>Select Noise Type:</Typography>
              <Select
                fullWidth
                value={selectedNoise}
                onChange={(e) => setSelectedNoise(e.target.value)}
                disabled={recording || noisePlaying}
              >
                <MenuItem value="white_noise">Sound 1</MenuItem>
                <MenuItem value="nature">Sound 2</MenuItem>
                <MenuItem value="city">Sound 3</MenuItem>
              </Select>
            </Box>

            <Box mt={2}>
              <Button
                variant="contained"
                onClick={toggleNoise}
                color={noisePlaying ? "error" : "success"}
                sx={{ textTransform: "none", fontWeight: "bold" }}
                disabled={recording && !noisePlaying}
              >
                {noisePlaying ? "Stop Noise" : "Play Noise"}
              </Button>
            </Box>

            <Box mt={3}>
              <Typography mb={1}>Webcam Preview (During Recording):</Typography>
              <video
                ref={webcamRef}
                autoPlay
                muted
                playsInline
                style={{ width: "100%", maxHeight: 300, backgroundColor: "#000" }}
              />
            </Box>

            <Box mt={2}>
              <Button
                variant="contained"
                onClick={recording ? stopRecording : startRecording}
                color={recording ? "error" : "primary"}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "info.main",
                  color: "#ffffff !important",
                  "&:hover": {
                    backgroundColor: "info.dark",
                  },
                }}
                // disabled={noisePlaying && !recording}
              >
                {recording ? "Stop Recording" : "Start Recording"}
              </Button>
            </Box>

            <Box mt={3}>
              <Typography mb={1}>Or Upload a Video File:</Typography>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={recording}
              />
            </Box>

            {videoBlob && (
              <Box mt={3}>
                <Typography mb={1}>Recorded/Uploaded Video Preview:</Typography>
                <video controls src={videoBlob} style={{ width: "100%", maxHeight: 300 }} />
              </Box>
            )}

            <Box mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleVideoUpload}
                disabled={loading || recording || !videoFile}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  color: "#ffffff !important",
                  "&:hover": {
                    backgroundColor: "info.dark",
                  },
                }}
              >
                Upload and Predict
              </Button>
            </Box>

            {loading && (
              <Box mt={2} textAlign="center">
                <CircularProgress />
              </Box>
            )}

            {prediction && (
              <>
                <Box mt={3} sx={{ bgcolor: "#e3f2fd", p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Final Prediction: {prediction.finalPrediction}
                  </Typography>
                  <Typography>CNN-LSTM Prediction: {prediction.cnnLstmPrediction}</Typography>
                  <Typography>
                    Confidence (Hypersensitivity): {prediction.confidenceHypersensitive}%
                  </Typography>
                  <Typography>
                    Confidence (Not Hypersensitivity): {prediction.confidenceNotHypersensitive}%
                  </Typography>
                  <Typography>Dominant Emotion: {prediction.dominantEmotion}</Typography>
                  <Typography>
                    Emotion Alignment: {prediction.emotionAligned ? "Aligned" : "Not Aligned"}
                  </Typography>
                </Box>
                {/* Case 1: Both CNN-LSTM and Final Prediction say Hypersensitivity */}
                {prediction.cnnLstmPrediction === "Hypersensitivity" &&
                  prediction.finalPrediction === "Hypersensitivity" && (
                    <Box
                      mt={2}
                      p={2}
                      sx={{
                        bgcolor: "#fff3cd",
                        border: "1px solid #ffeeba",
                        borderRadius: 2,
                        color: "#856404",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Both emotional expressions and body reactions indicate{" "}
                      <strong>hypersensitivity</strong>.<br />
                      We strongly recommend contacting a medical professional for further guidance.
                      <br />
                      You can book a consultation through Richway Arya Hospital:
                      <br />
                      <a
                        href="https://lrh.health.gov.lk/home-en/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#856404", textDecoration: "underline" }}
                      >
                        https://lrh.health.gov.lk/home-en/
                      </a>
                    </Box>
                  )}

                {/* Case 2: Only CNN-LSTM says Hypersensitivity but Final Prediction says Not */}
                {prediction.cnnLstmPrediction === "Hypersensitivity" &&
                  prediction.finalPrediction === "Not Hypersensitivity" && (
                    <Box
                      mt={2}
                      p={2}
                      sx={{
                        bgcolor: "#fff3cd",
                        border: "1px solid #ffeeba",
                        borderRadius: 2,
                        color: "#856404",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Emotional expressions indicate <strong>no hypersensitivity</strong>, but body
                      reactions show signs of <strong>hypersensitivity</strong>.<br />
                      We recommend contacting a medical professional to assess the situation.
                      <br />
                      You can book a consultation through Richway Arya Hospital:
                      <br />
                      <a
                        href="https://lrh.health.gov.lk/home-en/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#856404", textDecoration: "underline" }}
                      >
                        https://lrh.health.gov.lk/home-en/
                      </a>
                    </Box>
                  )}

                {/* Case 3: Both CNN-LSTM and Final Prediction say Not Hypersensitivity */}
                {prediction.cnnLstmPrediction === "Not Hypersensitivity" &&
                  prediction.finalPrediction === "Not Hypersensitivity" && (
                    <Box
                      mt={2}
                      p={2}
                      sx={{
                        bgcolor: "#d4edda",
                        border: "1px solid #c3e6cb",
                        borderRadius: 2,
                        color: "#155724",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Both emotional expressions and body reactions indicate{" "}
                      <strong>no signs of hypersensitivity</strong>.<br />
                      Therefore, it is{" "}
                      <strong>not necessary to contact a medical professional</strong> at this time.
                      <br />
                      Continue observing regularly and retest if needed.
                    </Box>
                  )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NoiseTest;
