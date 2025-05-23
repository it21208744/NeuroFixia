import { useState } from "react";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import NoiseTest from "components/Sensory/NoiseTest";
import AuditoryTherapy from "components/Sensory/AuditoryTherapy";
import SessionHistory from "components/Sensory/SessionHistory"; // ⬅️ Add this

function Tables() {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleChange} aria-label="Sensory Test Tabs">
            <Tab label="Noise Test" />
            <Tab label="Auditory Therapy" />
            <Tab label="Session History" />
          </Tabs>
        </Box>

        <Grid container spacing={6}>
          <Grid item xs={12}>
            {tabValue === 0 && <NoiseTest />}
            {tabValue === 1 && <AuditoryTherapy userId="1" />}
            {tabValue === 2 && <SessionHistory userId="1" />}
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
