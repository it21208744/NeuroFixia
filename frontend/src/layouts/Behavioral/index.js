import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "mui-player/dist/mui-player.min.css";
import VideoPlayer from "components/Behavioral/VideoPlayer";

function Tables() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={10} pb={3}>
        <Card sx={{ position: "relative", mt: -8, mx: 3, py: 2, px: 2 }}>
          <VideoPlayer />
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
