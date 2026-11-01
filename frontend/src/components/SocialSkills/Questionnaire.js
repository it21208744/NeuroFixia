import { useContext, useEffect, useRef, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import LinearProgress from "@mui/material/LinearProgress";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { LangContext } from "layouts/Social";
import api, { errorMessage } from "api/client";
import T, { LANGS } from "./translations";

// Bug fix: `new SpeechRecognition()` ran at import time and threw in Firefox/Safari, which
// crashed the *whole* app at start-up because routes.js imports every page.
const SpeechRecognition =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

const YN = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];
const TEXT = ["q9", "q10"];

export default function Questionnaire() {
  const { setValue, lang } = useContext(LangContext);
  const t = T[lang] || T.english;
  // Answers are stored as canonical "yes"/"no" (not the translated label), so the model never
  // depends on online translation of "ඔව්"/"ஆம்".
  const [ans, setAns] = useState({});
  const [listening, setListening] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const recRef = useRef(null);

  useEffect(() => () => recRef.current?.abort?.(), []);

  const listen = (field) => {
    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser - please type the answer (Chrome or Edge support voice)."
      );
      return;
    }
    recRef.current?.abort?.();
    const rec = new SpeechRecognition();
    rec.lang = LANGS[lang]?.speech || "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setAns((a) => ({ ...a, [field]: a[field] ? `${a[field]} ${text}` : text }));
    };
    rec.onerror = (e) =>
      setError(
        e.error === "not-allowed"
          ? "Microphone permission denied."
          : `Voice input error: ${e.error}`
      );
    rec.onend = () => setListening(null);
    recRef.current = rec;
    setListening(field);
    rec.start();
  };

  const complete = YN.every((q) => ans[q]) && TEXT.every((q) => (ans[q] || "").trim().length > 2);
  const answered =
    YN.filter((q) => ans[q]).length + TEXT.filter((q) => (ans[q] || "").trim()).length;

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/social/analyze", { ...ans, lang });
      setResult(data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ p: { xs: 2, md: 4 } }}>
      <MDTypography variant="h4">{t.title}</MDTypography>
      <MDTypography variant="body2" color="text" mb={2}>
        {t.intro}
      </MDTypography>
      <LinearProgress
        variant="determinate"
        value={(answered / 10) * 100}
        sx={{ mb: 3, height: 6 }}
      />

      {YN.map((q, i) => (
        <MDBox key={q} mb={2.5} pb={2} sx={{ borderBottom: "1px solid #eee" }}>
          <MDTypography variant="button" fontWeight="medium" display="block" mb={1}>
            {i + 1}. {t[q]}
          </MDTypography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={ans[q] || null}
            onChange={(e, v) => v && setAns({ ...ans, [q]: v })}
          >
            <ToggleButton value="yes" sx={{ px: 3 }} color="success">
              {t.yes}
            </ToggleButton>
            <ToggleButton value="no" sx={{ px: 3 }} color="error">
              {t.no}
            </ToggleButton>
          </ToggleButtonGroup>
        </MDBox>
      ))}

      {TEXT.map((q, i) => (
        <MDBox key={q} mb={2.5}>
          <MDTypography variant="button" fontWeight="medium" display="block" mb={1}>
            {i + 9}. {t[q]}
          </MDTypography>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm>
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder={t.placeholder}
                value={ans[q] || ""}
                onChange={(e) => setAns({ ...ans, [q]: e.target.value })}
              />
            </Grid>
            <Grid item>
              <MDButton
                variant={listening === q ? "gradient" : "outlined"}
                color="info"
                size="small"
                onClick={() => listen(q)}
              >
                <Icon sx={{ mr: 0.5 }}>{listening === q ? "graphic_eq" : "mic"}</Icon>
                {listening === q ? t.listening : t.speak}
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      ))}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {busy && <LinearProgress sx={{ mb: 1 }} />}
      <MDBox display="flex" justifyContent="space-between" alignItems="center">
        <MDButton variant="text" color="secondary" onClick={() => setValue("one")}>
          Back
        </MDButton>
        <MDButton variant="gradient" color="success" onClick={submit} disabled={!complete || busy}>
          {busy ? t.waiting : t.submit}
        </MDButton>
      </MDBox>

      <Dialog open={!!result} onClose={() => setValue("five")} maxWidth="sm" fullWidth>
        <DialogContent>
          {result && (
            <MDBox textAlign="center" py={2}>
              <MDTypography variant="h1">{result.risk_prediction === 1 ? "⚠️" : "✅"}</MDTypography>
              <MDTypography variant="h5" mb={1}>
                {result.risk_prediction === 1 ? t.risk : t.noRisk}
              </MDTypography>
              {result.risk_prediction === 1 && result.top_3_features?.length > 0 && (
                <MDTypography variant="body2" color="text">
                  Focus areas: {result.top_3_features.map((f) => f.label).join(", ")}
                </MDTypography>
              )}
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton variant="text" color="info" onClick={() => setValue("five")}>
            View progress
          </MDButton>
          {result?.risk_prediction === 1 && (
            <MDButton variant="gradient" color="success" onClick={() => setValue("four")}>
              Improvement activity
            </MDButton>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
}
