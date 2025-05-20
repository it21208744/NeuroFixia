import React from "react";
import Grid from "@mui/material/Grid";
// import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
// import LearningNav from "components/Learning/LearningNav";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function Tables() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* <LearningNav/> */}
          {/* <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/calibrator")} // <-- UPDATED
              sx={{ mr: 2, color: "white" }}
            >
              Go to Calibrator
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/shadow")}
              sx={{ mr: 2, color: "white" }}
            >
              Go to Shadow
            </Button>
            <Button variant="contained" color="primary" onClick={() => navigate("/lo")}>
              Go to Lo
            </Button>
          </Grid> */}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
