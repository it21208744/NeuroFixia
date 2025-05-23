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
  const [uploadedImage, setUploadedImage] = useState(null);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordedChunksRef = useRef([]);
  const canvasContainerRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState("");

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

        // Auto-download video
        const videoLink = document.createElement("a");
        videoLink.href = url;
        videoLink.download = "video.webm";
        document.body.appendChild(videoLink);
        videoLink.click();
        document.body.removeChild(videoLink);

        // Auto-download canvas
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
      sendDataToAPI();
    }
    collectGazeDataRef.current = false;
    handleModalClose();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  const sendDataToAPI = async () => {
    try {
      setResultModalOpen(true);
      const formData = new FormData();

      if (downloadUrl) {
        const videoBlob = await fetch(downloadUrl).then((res) => res.blob());
        formData.append("video", videoBlob, "video.webm");
      }

      if (uploadedImage) {
        formData.append("image", uploadedImage, uploadedImage.name);
      } else {
        const imageResponse = await fetch(constantImage);
        const imageBlob = await imageResponse.blob();
        formData.append("image", imageBlob, "exampleHeatMap.png");
      }

      if (modalResponses.length > 0) {
        formData.append("expressions", JSON.stringify(modalResponses));
      }

      const response = await axios.post("http://localhost:5000/api/analyze-combined", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setApiRes(response.data);
      console.log("API Response:", response.data);
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
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ position: "fixed", right: "2rem", bottom: "14rem", zIndex: 99 }}
          />
          <div ref={canvasContainerRef}>
            <LineArtCanvas points={gazeCoordinates} />
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
      </Grid>
    </div>
  );
};

export default VideoPlayer;
