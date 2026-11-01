import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PageHeader from "components/common/PageHeader";
import NoiseTest from "components/Sensory/NoiseTest";
import AuditoryTherapy from "components/Sensory/AuditoryTherapy";
import SessionHistory from "components/Sensory/SessionHistory";

export default function Sensory() {
  const [tab, setTab] = useState(0);
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <PageHeader
          icon="hearing"
          title="Sensory processing"
          subtitle="Auditory hypersensitivity test and graded sound-exposure therapy"
          color="warning"
        />
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ mb: 3 }}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab label="Noise test" icon={<Icon>graphic_eq</Icon>} iconPosition="start" />
          <Tab label="Auditory therapy" icon={<Icon>headphones</Icon>} iconPosition="start" />
          <Tab label="Session history" icon={<Icon>insights</Icon>} iconPosition="start" />
        </Tabs>
        {tab === 0 && <NoiseTest />}
        {tab === 1 && <AuditoryTherapy />}
        {tab === 2 && <SessionHistory />}
      </MDBox>
    </DashboardLayout>
  );
}
