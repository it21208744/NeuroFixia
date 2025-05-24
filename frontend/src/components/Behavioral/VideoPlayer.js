// Add this at the top with other imports
import { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import MuiPlayer from "mui-player";
import video1 from "assets/behavioral/videos/sad.mp4";
import video2 from "assets/behavioral/videos/angry.mp4";
import video3 from "assets/behavioral/videos/happy.mp4";
import video4 from "assets/behavioral/videos/surprised.mp4";
import FormModal from "./FormModal";
import Button from "@mui/material/Button";
import axios from "axios";
import LineArtCanvas from "./LineArtCanvas";
import ResultsModal from "./ResultsModal";
import html2canvas from "html2canvas";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TestResultsChart from "./TestResultsChart";

const VideoPlayer = () => {
  const [modalResponses, setModalResponses] = useState([]);
  const [apiRes, setApiRes] = useState({});
  const [webGazerAvailability, setWebGazerAvailability] = useState(false);
  const [gazeCoordinates, setGazeCoordinates] = useState([]);
  const collectGazeDataRef = useRef(false);
  const [vidId, setVidId] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoList = [video1, video2, video3, video4];
  const playerRef = useRef(null);
  const videoElementRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordedChunksRef = useRef([]);
  const canvasContainerRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [testCompletedModalOpen, setTestCompletedModalOpen] = useState(false);

  const constantImage = "src/assets/images/behavioral/exampleHeatMap.png";

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const handleResultModalOpen = () => setResultModalOpen(true);
  const handleResultModalClose = () => setResultModalOpen(false);

  useEffect(() => {
    webgazer
      .setGazeListener((data) => {
        if (data) {
          setWebGazerAvailability(true);
        }
        if (collectGazeDataRef.current && data) {
          const { x, y } = data;
          setGazeCoordinates((prevData) => [...prevData, { x, y }]);
        }
      })
      .begin();

    if (playerRef.current) {
      const player = new MuiPlayer({
        container: playerRef.current,
        title: "Behavioral Video",
        src: videoList[vidId % videoList.length],
        height: "220px",
        autoplay: false,
      });

      const videoElement = playerRef.current.querySelector("video");
      videoElementRef.current = videoElement;

      if (videoElement) {
        const handleVideoEnd = () => {
          collectGazeDataRef.current = false;
          if (vidId <= 3) {
            handleModalOpen();
          }
        };
        videoElement.addEventListener("ended", handleVideoEnd);

        return () => {
          videoElement.removeEventListener("ended", handleVideoEnd);
        };
      }
    }
  }, [vidId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        const videoLink = document.createElement("a");
        videoLink.href = url;
        videoLink.download = "video.webm";
        document.body.appendChild(videoLink);
        videoLink.click();
        document.body.removeChild(videoLink);

        if (canvasContainerRef.current) {
          const canvas = canvasContainerRef.current.querySelector("canvas");
          if (canvas) {
            const image = canvas.toDataURL("image/png");
            const imageLink = document.createElement("a");
            imageLink.href = image;
            imageLink.download = "lineart.png";
            document.body.appendChild(imageLink);
            imageLink.click();
            document.body.removeChild(imageLink);
          }
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handlePlayVideo = () => {
    if (vidId < 4) {
      collectGazeDataRef.current = true;
      startRecording();
      if (videoElementRef.current) {
        videoElementRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => console.log("Play failed:", error));
      }
    }
  };

  const handleNextVideo = (response) => {
    setModalResponses((prevRes) => [...prevRes, response]);

    if (vidId < 3) {
      collectGazeDataRef.current = true;
      setVidId((prev) => (prev + 1) % videoList.length);
      setTimeout(() => handlePlayVideo(), 100);
    } else {
      console.log("All videos completed. Data collection stopped.");
      console.log("Final Modal Responses:", [...modalResponses, response]);
      console.log("Final Gaze Coordinates:", gazeCoordinates);
      stopRecording();
      setTestCompletedModalOpen(true); // 👈 open the modal
      // sendDataToAPI();
    }

    collectGazeDataRef.current = false;
    handleModalClose();
  };

  const sendDataToAPI = async () => {
    try {
      console.log("Opening result modal...");
      setResultModalOpen(true);

      const formData = new FormData();

      if (downloadUrl) {
        console.log("Fetching video from:", downloadUrl);
        const videoBlob = await fetch(downloadUrl).then((res) => res.blob());
        console.log("Video blob fetched:", videoBlob);
        formData.append("video", videoBlob, "video.webm");
        console.log("Video appended to formData");
      } else {
        console.log("No downloadUrl provided.");
      }

      console.log("Fetching image from:", constantImage);
      const imageResponse = await fetch(constantImage);
      const imageBlob = await imageResponse.blob();
      console.log("Image blob fetched:", imageBlob);
      formData.append("image", imageBlob, "exampleHeatMap.png");
      console.log("Image appended to formData");

      if (modalResponses.length > 0) {
        console.log("Modal responses to append:", modalResponses);
        formData.append("expressions", JSON.stringify(modalResponses));
        console.log("Expressions appended to formData");
      } else {
        console.log("No modal responses to append.");
      }

      console.log("Sending formData to API...");
      const response = await axios.post("http://localhost:5000/api/analyze-combined", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("API response received:", response.data);
      setApiRes(response.data);
    } catch (error) {
      console.error("Error sending data to API:", error);
    }
  };

  const logAllData = () => {
    console.log("All Modal Responses (Form Data):", modalResponses);
    console.log("All Gaze Coordinates (Gaze Data):", gazeCoordinates);
    sendDataToAPI();
  };

  return (
    <div>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <div ref={playerRef}></div>
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="3.25rem"
            height="3.25rem"
            bgColor="white"
            shadow="sm"
            borderRadius="50%"
            position="fixed"
            right="2rem"
            bottom="2rem"
            zIndex={99}
            color="dark"
            sx={{ cursor: "pointer" }}
            onClick={handlePlayVideo}
          >
            Start test
          </MDBox>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNextVideo("")}
            style={{ position: "fixed", right: "2rem", bottom: "6rem", zIndex: 99 }}
          >
            Next Video
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={logAllData}
            style={{ position: "fixed", right: "2rem", bottom: "10rem", zIndex: 99 }}
          >
            Log All Data
          </Button>

          <div
            ref={canvasContainerRef}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "2rem",
            }}
          >
            <LineArtCanvas points={gazeCoordinates} width={1080} height={720} />
          </div>
          <div
            ref={canvasContainerRef}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "2rem",
            }}
          >
            <TestResultsChart />
          </div>

          <FormModal
            setModalResponses={setModalResponses}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            handleModalOpen={handleModalOpen}
            handleModalClose={handleModalClose}
            handleNextVideo={handleNextVideo}
          />
          <ResultsModal
            setModalResponses={setModalResponses}
            modalOpen={resultModalOpen}
            setModalOpen={setResultModalOpen}
            handleModalOpen={handleResultModalOpen}
            handleModalClose={handleResultModalClose}
            handleNextVideo={handleNextVideo}
            data={apiRes}
          />
        </Grid>
        <Dialog open={testCompletedModalOpen} onClose={() => setTestCompletedModalOpen(false)}>
          <DialogTitle>Test Completed</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You’ve finished all the videos. Thank you for completing the test!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestCompletedModalOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </div>
  );
};

export default VideoPlayer;
