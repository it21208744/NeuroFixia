import { useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "mui-player/dist/mui-player.min.css";
import MuiPlayer from "mui-player";
import video from "assets/behavioral/videos/sad.mp4";

function Tables() {
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
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={10} pb={3}>
        <Card sx={{ position: "relative", mt: -8, mx: 3, py: 2, px: 2 }}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <div ref={playerRef}></div>
            </Grid>
          </Grid>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
