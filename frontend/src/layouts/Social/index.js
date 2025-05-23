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

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import prettier from "prettier";
import React, { useState, createContext, useContext } from "react";

// Create context
export const LangContext = createContext();

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";

//mysocial
import InitialQuestion from "components/SocialSkills/InitialQuestion";
import Questionnaire from "components/SocialSkills/Questionnaire";
import AllSales from "components/SocialSkills/AllSales";
import Simon from "components/SocialSkills/Simon";
import Progress from "components/SocialSkills/Progress";

function Tables() {
  const [value, setValue] = useState("one");
  const [lang, setLang] = useState("");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();

  return (
    <LangContext.Provider value={{ value, setValue, lang, setLang }}>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <MDTypography variant="h6" gutterBottom></MDTypography>
              <Tabs
                value={value}
                onChange={handleChange}
                textColor="secondary"
                indicatorColor="secondary"
                aria-label="Social skills"
              >
                <Tab value="one" label="InitialQuestion" />
                <Tab value="two" label="Questionnaire" />
                <Tab value="three" label="AllSales" />
                <Tab value="four" label="Simon" />
                <Tab value="five" label="Progress" />
              </Tabs>
            </Grid>
            <Grid item xs={12}>
              {value === "one" && <InitialQuestion />}
              {value === "two" && <Questionnaire />}
              {value === "three" && <AllSales />}
              {value === "four" && <Simon />}
              {value === "five" && <Progress />}
            </Grid>
          </Grid>
        </MDBox>
      </DashboardLayout>
    </LangContext.Provider>
  );
}

export default Tables;
