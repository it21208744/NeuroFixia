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
import { Pause } from "@mui/icons-material";
import Button from "@mui/material/Button";

const VideoPlayer = () => {
  const [modalResponses, setModalResponses] = useState([]);
  const [webGazerAvailability, setWebGazerAvailability] = useState(false);
  const [gazeCoordinates, setGazeCoordinates] = useState([]);
  const collectGazeDataRef = useRef(false);
  const [vidId, setVidId] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoList = [video1, video2, video3, video4];
  const playerRef = useRef(null);
  const videoElementRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  useEffect(() => {
    webgazer
      .setGazeListener((data, timeStamp) => {
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
          collectGazeDataRef.current = false; // Stop collecting gaze data
          if (vidId <= 3) {
            // Open modal for all videos (including the 4th)
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

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        setDownloadUrl(URL.createObjectURL(blob));
      };

      recorder.start(1000); // Capture data every 1 second
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error starting recording:", error);
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
      // Only play if it's not the last video
      collectGazeDataRef.current = true;
      console.log("useRef", collectGazeDataRef.current);
      if (videoElementRef.current) {
        videoElementRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            startRecording(); // Start recording when video starts playing
          })
          .catch((error) => console.log("Play failed:", error));
      }
    }
  };

  const handleNextVideo = (response) => {
    setModalResponses((prevRes) => [...prevRes, response]); // Add response to modalResponses
    console.log("Modal Responses:", modalResponses);

    if (vidId < 3) {
      // Only proceed if it's not the last video
      collectGazeDataRef.current = true;
      setVidId((prev) => {
        const nextVidId = (prev + 1) % videoList.length;
        return nextVidId;
      });
      setTimeout(() => handlePlayVideo(), 100); // Ensure video is loaded before playing
    } else {
      console.log("All videos completed. Data collection stopped.");
      console.log("Final Modal Responses:", [...modalResponses, response]); // Log final responses
      console.log("Final Gaze Coordinates:", gazeCoordinates);
      stopRecording(); // Stop recording after the 4th modal
    }
    collectGazeDataRef.current = false;
    handleModalClose();
  };

  // Function to log all gaze data and form data
  const logAllData = () => {
    console.log("All Modal Responses (Form Data):", modalResponses);
    console.log("All Gaze Coordinates (Gaze Data):", gazeCoordinates);
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
            <PlayCircleFilledWhiteIcon />
          </MDBox>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNextVideo("")} // Pass an empty response for the button
            style={{ position: "fixed", right: "2rem", bottom: "6rem", zIndex: 99 }}
          >
            Next Video
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={logAllData} // Log all data when clicked
            style={{ position: "fixed", right: "2rem", bottom: "10rem", zIndex: 99 }}
          >
            Log All Data
          </Button>
          {downloadUrl && (
            <Button
              variant="contained"
              color="success"
              href={downloadUrl}
              download="recorded-video.webm"
              style={{ position: "fixed", right: "2rem", bottom: "14rem", zIndex: 99 }}
            >
              Download Video
            </Button>
          )}
          <FormModal
            setModalResponses={setModalResponses}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            handleModalOpen={handleModalOpen}
            handleModalClose={handleModalClose}
            handleNextVideo={handleNextVideo}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default VideoPlayer;
