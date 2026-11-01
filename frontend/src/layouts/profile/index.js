import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PageHeader from "components/common/PageHeader";
import { useAuth } from "context/AuthContext";
import { errorMessage } from "api/client";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const welcome = new URLSearchParams(useLocation().search).get("welcome");
  const [child, setChild] = useState({ name: "", age: "", gender: "" });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setChild({ name: "", age: "", gender: "", ...(user?.child || {}) });
  }, [user]);

  const save = async () => {
    setMsg(null);
    try {
      await updateProfile({ child: { ...child, age: child.age ? Number(child.age) : undefined } });
      if (welcome) navigate("/dashboard");
      else setMsg({ type: "success", text: "Saved" });
    } catch (e) {
      setMsg({ type: "error", text: errorMessage(e) });
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <PageHeader
          icon="child_care"
          title="Child profile"
          subtitle="Used to personalise activities and reports"
        />
        {welcome && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Account created! Tell us a little about your child to get started.
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={2}>
                Child details
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Child's first name"
                    value={child.name}
                    onChange={(e) => setChild({ ...child, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Age (years)"
                    inputProps={{ min: 1, max: 18 }}
                    value={child.age}
                    onChange={(e) => setChild({ ...child, age: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    value={child.gender || ""}
                    onChange={(e) => setChild({ ...child, gender: e.target.value })}
                    sx={{ "& .MuiInputBase-root": { height: 44 } }}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              {msg && (
                <Alert severity={msg.type} sx={{ mt: 2 }}>
                  {msg.text}
                </Alert>
              )}
              <MDBox mt={3}>
                <MDButton variant="gradient" color="info" onClick={save}>
                  {welcome ? "Save and continue" : "Save"}
                </MDButton>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3 }}>
              <MDTypography variant="h6" mb={1}>
                Parent account
              </MDTypography>
              <MDTypography variant="button" display="block" color="text">
                Name: {user?.name}
              </MDTypography>
              <MDTypography variant="button" display="block" color="text">
                Email: {user?.email}
              </MDTypography>
              <MDTypography variant="caption" display="block" color="text" mt={2}>
                All assessment results are stored privately against this account.
              </MDTypography>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
