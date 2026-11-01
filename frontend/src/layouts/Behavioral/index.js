import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PageHeader from "components/common/PageHeader";
import VideoPlayer from "components/Behavioral/VideoPlayer";

export default function Behavioral() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <PageHeader
          icon="visibility"
          title="Behavioural assessment"
          subtitle="Eye-gaze, body movement and emotion recognition"
          color="info"
        />
        <VideoPlayer />
      </MDBox>
    </DashboardLayout>
  );
}
