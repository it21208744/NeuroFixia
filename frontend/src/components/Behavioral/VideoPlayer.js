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

const VideoPlayer = () => {
  const [vidId, setVidId] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayStatus, setAutoPlayStatus] = useState(false);
  const videoList = [video1, video2, video3, video4];
  const playerRef = useRef(null);
  const videoElementRef = useRef(null);

  useEffect(() => {
    if (vidId === 3) {
      setAutoPlayStatus(false); // Stop autoplay when last video reaches
    }

    if (playerRef.current) {
      const player = new MuiPlayer({
        container: playerRef.current,
        title: "Behavioral Video",
        src: videoList[vidId % videoList.length], // Ensure looping within bounds
        height: "220px",
        autoplay: autoPlayStatus, // Enable autoplay based on status
      });

      const videoElement = playerRef.current.querySelector("video");
      videoElementRef.current = videoElement;

      if (videoElement) {
        const handleVideoEnd = () => {
          setVidId((prev) => prev + 1);
          console.log("hello");
        };

        videoElement.addEventListener("ended", handleVideoEnd);

        return () => {
          videoElement.removeEventListener("ended", handleVideoEnd);
        };
      }
    }
  }, [vidId]); // Re-run when vidId changes

  const handlePlayVideo = () => {
    if (videoElementRef.current) {
      setAutoPlayStatus(true);
      videoElementRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.log("Play failed:", error));
    }
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
            onClick={handlePlayVideo} // Start video on click
          >
            <PlayCircleFilledWhiteIcon />
          </MDBox>
          <FormModal />
        </Grid>
      </Grid>
    </div>
  );
};

export default VideoPlayer;
