import { useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import MuiPlayer from "mui-player";
import video from "assets/behavioral/videos/sad.mp4";

const VideoPlayer = () => {
  const playerRef = useRef(null);
  useEffect(() => {
    if (playerRef.current) {
      new MuiPlayer({
        container: playerRef.current,
        title: "Behavioral Video",
        src: video,
        height: "220px",
      });
    }
  }, []);
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
            onClick={() => console.log("Start the test")}
          >
            <PlayCircleFilledWhiteIcon />
          </MDBox>
        </Grid>
      </Grid>
    </div>
  );
};
export default VideoPlayer;
