import { useContext, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Alert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { LangContext } from "layouts/Social";
import { useAuth } from "context/AuthContext";
import api, { errorMessage } from "api/client";
import { LANGS } from "./translations";
import illustration from "./images/a.png";

export default function InitialQuestion() {
  const { setValue, lang, setLang } = useContext(LangContext);
  const { user } = useAuth();
  const [age, setAge] = useState(user?.child?.age ? String(user.child.age) : "");
  const [gender, setGender] = useState(user?.child?.gender || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setError("");
    setBusy(true);
    try {
      await api.post("/social/profile", { age, gender, lang });
      setValue("two");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <MDTypography variant="h4" mb={1}>
            Social skills observation
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={3}>
            A short 10-question questionnaire about your child&apos;s social and communication
            development. Choose your language - Sinhala and Tamil answers are translated
            automatically.
          </MDTypography>
          <MDTypography variant="button" fontWeight="bold" display="block" mb={1}>
            Language
          </MDTypography>
          <ToggleButtonGroup
            exclusive
            value={lang}
            onChange={(e, v) => v && setLang(v)}
            sx={{ mb: 3, flexWrap: "wrap" }}
          >
            {Object.entries(LANGS).map(([k, v]) => (
              <ToggleButton key={k} value={k} sx={{ px: 2 }}>
                {v.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Child's age"
                value={age}
                inputProps={{ min: 1, max: 18 }}
                onChange={(e) => setAge(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                sx={{ "& .MuiInputBase-root": { height: 44 } }}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <MDButton
            variant="gradient"
            color="success"
            sx={{ mt: 3 }}
            onClick={start}
            disabled={busy || !lang || !age || !gender}
          >
            Start questionnaire
          </MDButton>
        </Grid>
        <Grid item xs={12} md={6} textAlign="center">
          <MDBox
            component="img"
            src={illustration}
            alt=""
            sx={{ maxWidth: "100%", maxHeight: 360 }}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
