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
  const [webGazerAvailability, setWebGazerAvailability] = useState(false);
  const [gazeCoordinates, setGazeCoordinates] = useState([]);
  const collectGazeDataRef = useRef(false);
  const [vidId, setVidId] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoList = [video1, video2, video3, video4];
  const playerRef = useRef(null);
  const videoElementRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
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
          // console.log({ x, y });
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
          handleModalOpen();
        };
        videoElement.addEventListener("ended", handleVideoEnd);

        return () => {
          videoElement.removeEventListener("ended", handleVideoEnd);
        };
      }
    }
  }, [vidId]);

  const handlePlayVideo = () => {
    collectGazeDataRef.current = true;
    console.log("useRef", collectGazeDataRef.current);
    if (videoElementRef.current) {
      videoElementRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.log("Play failed:", error));
    }
  };

  const handleNextVideo = () => {
    console.log(gazeCoordinates);
    collectGazeDataRef.current = true;
    if (vidId != 3) {
      setVidId((prev) => {
        const nextVidId = (prev + 1) % videoList.length;
        return nextVidId;
      });
      setTimeout(() => handlePlayVideo(), 100); // Ensure video is loaded before playing
    }
    collectGazeDataRef.current = false;
    handleModalClose();
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
            onClick={handleNextVideo}
            style={{ position: "fixed", right: "2rem", bottom: "6rem", zIndex: 99 }}
            disable={true}
          >
            Next Video
          </Button>
          <FormModal
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
