/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import { useEffect, createContext, useState, useContext } from "react";
// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import LearningNav from "components/Learning/LearningNav";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import TestComponent1 from "components/Learning/TestComponent1";
import TestComponent2 from "components/Learning/TestComponent2";

export const DataContext = createContext(null);

function Tables() {
  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();

  //memory card
  const [accuracy, setAccuracy] = useState(0);
  const [memoryScore, setMemoryScore] = useState(0);
  const [gazeDataCollection, setGazeDataCollection] = useState([]);
  //const [gazeDataCollection, setGazeDataCollection] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  //Logical
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [completionTimes, setCompletionTimes] = useState([]);
  const totalTime = completionTimes.reduce((acc, time) => acc + time, 0);

  //Shadow
  const [shadowScore, setShadowScore] = useState(100);
  //const [elapsedTime, setTimeElapsed] = useState([])
  const [completedPatterns, setCompletedPatterns] = useState([]);
  const [gazeShiftsCount, setGazeShiftsCount] = useState([]);
  const [fixationDuration, setFixationDuration] = useState([]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <DataContext.Provider
              value={{
                elapsedTime,
                setElapsedTime,
                accuracy,
                setAccuracy,
                memoryScore,
                setMemoryScore,
                formatTime,
                score,
                setScore,
                errors,
                setErrors,
                totalTime,
                completionTimes,
                setCompletionTimes,
                shadowScore,
                setShadowScore,
                //elapsedTime,
                //setTimeElapsed,
                completedPatterns,
                setCompletedPatterns,
                gazeShiftsCount,
                setGazeShiftsCount,
                fixationDuration,
                setFixationDuration,
                gazeDataCollection,
                setGazeDataCollection,
              }}
            >
              <LearningNav />
            </DataContext.Provider>

            {/* sample page learning */}
          </Grid>
        </Grid>
      </MDBox>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default Tables;
