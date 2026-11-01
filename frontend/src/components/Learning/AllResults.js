import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Icon from "@mui/material/Icon";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Disclaimer from "components/common/Disclaimer";
import { DataContext } from "layouts/Learning";
import api, { errorMessage } from "api/client";

const LEVEL_COLOR = { Good: "success", Moderate: "info", Low: "warning" };
const SUGGEST = { attention: "Attention1", memory: "Memory1", logic: "Logic1" };

/*
 * Bug fixes: parents previously had to click "AUTISM" or "TD" (labelling their own child) before
 * "Predict" was enabled, the browser called the Flask model directly on 127.0.0.1:5021, every click
 * downloaded an Excel file, and "Suggest Activity" called an undefined setTabValue().
 */
export default function AllResults({ go }) {
  const c = useContext(DataContext);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const loadHistory = () =>
    api
      .get("/cognitive/results")
      .then((r) => setHistory(r.data))
      .catch(() => {});
  useEffect(() => {
    loadHistory();
  }, []);

  const metrics = {
    fixationDuration: Number(c.fixationDuration) || 0,
    gazeShiftsCount: Number(c.gazeShiftsCount) || 0,
    attentionScore: Number(c.shadowScore) || 0,
    accuracy: Number((c.accuracy || 0).toFixed(2)),
    timeSpent: Number(c.elapsedTime) || 0,
    memoryScore: Number((c.memoryScore || 0).toFixed(2)),
    totalTime: Number(c.totalTime) || 0,
    errors: Number(c.errors) || 0,
    score: Number(c.score) || 0,
  };
  const ready = c.done.memory && c.done.attention && c.done.logic;

  const analyse = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/cognitive/analyze", metrics);
      setResult(data);
      loadHistory();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const exportXlsx = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        Fixation_Duration: metrics.fixationDuration,
        Gaze_Shift_Count: metrics.gazeShiftsCount,
        Attention_Score: metrics.attentionScore,
        Memory_Recall_Accuracy: metrics.accuracy,
        Response_Time: c.formatTime(metrics.timeSpent),
        Memory_Score: metrics.memoryScore,
        Logical_Task_Completion_Time: metrics.totalTime,
        Logical_Task_Errors: metrics.errors,
        Logical_Score: metrics.score,
        Prediction: result ? (result.prediction === 1 ? "Needs support" : "Typical") : "",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Game Results");
    XLSX.writeFile(wb, "neurofixia_learning_results.xlsx");
  };

  const rows = [
    ["Memory accuracy", `${metrics.accuracy}%`],
    ["Memory score", metrics.memoryScore],
    ["Memory time", c.formatTime(metrics.timeSpent)],
    ["Attention score", `${metrics.attentionScore}/100`],
    ["Time to first look at target", `${metrics.fixationDuration}s`],
    ["Gaze shifts away", metrics.gazeShiftsCount],
    ["Logic score", `${metrics.score}/100`],
    ["Logic errors", metrics.errors],
    ["Logic time", `${metrics.totalTime}s`],
  ];
  const low = result
    ? Object.entries(result.levels)
        .filter(([, v]) => v === "Low")
        .map(([k]) => k)
    : [];

  return (
    <MDBox>
      {!ready && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Complete the Memory, Attention and Logic games first (done:{" "}
          {["memory", "attention", "logic"].filter((k) => c.done[k]).join(", ") || "none"}).
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <MDTypography variant="h6" mb={1}>
            This session&apos;s game metrics
          </MDTypography>
          {rows.map(([k, v]) => (
            <MDBox
              key={k}
              display="flex"
              justifyContent="space-between"
              py={0.5}
              sx={{ borderBottom: "1px solid #f0f0f0" }}
            >
              <MDTypography variant="button" color="text">
                {k}
              </MDTypography>
              <MDTypography variant="button" fontWeight="medium">
                {v}
              </MDTypography>
            </MDBox>
          ))}
          <MDBox mt={2} display="flex" gap={1} flexWrap="wrap">
            <MDButton
              variant="gradient"
              color="success"
              onClick={analyse}
              disabled={!ready || busy}
            >
              <Icon sx={{ mr: 1 }}>analytics</Icon> Analyse
            </MDButton>
            <MDButton variant="outlined" color="info" onClick={exportXlsx}>
              <Icon sx={{ mr: 1 }}>download</Icon> Excel
            </MDButton>
          </MDBox>
          {busy && <LinearProgress sx={{ mt: 2 }} />}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>
        <Grid item xs={12} md={7}>
          {result ? (
            <MDBox>
              <MDBox
                p={2}
                borderRadius="lg"
                mb={2}
                sx={{
                  background: result.prediction === 1 ? "#fff7ed" : "#ecfdf5",
                  border: `1px solid ${result.prediction === 1 ? "#fdba74" : "#6ee7b7"}`,
                }}
              >
                <MDTypography variant="h5">
                  {result.prediction === 1
                    ? "Some cognitive skills may need support"
                    : "Cognitive skills look on track"}
                </MDTypography>
                <MDTypography variant="body2">
                  Likelihood of autism-related cognitive differences:{" "}
                  <b>{result.probability_autism}%</b>
                </MDTypography>
              </MDBox>
              <MDTypography variant="h6" mb={1}>
                Performance levels
              </MDTypography>
              {Object.entries(result.levels).map(([k, v]) => (
                <MDBox
                  key={k}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <MDTypography variant="button" sx={{ textTransform: "capitalize" }}>
                    {k === "logic" ? "Logical thinking" : k}
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <Chip size="small" label={v} color={LEVEL_COLOR[v]} />
                    {v !== "Good" && (
                      <MDButton
                        size="small"
                        variant="text"
                        color="primary"
                        onClick={() => go(SUGGEST[k])}
                      >
                        Practise
                      </MDButton>
                    )}
                  </MDBox>
                </MDBox>
              ))}
              {low.length > 0 && (
                <Alert severity="warning" sx={{ mt: 1, fontSize: "0.85rem" }}>
                  Your child may find {low.join(" & ")} challenging. Regular play with the suggested
                  activities can help.
                </Alert>
              )}
              <MDButton
                variant="gradient"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => go("activities")}
              >
                All suggested activities
              </MDButton>
            </MDBox>
          ) : (
            <MDTypography variant="body2" color="text">
              Press <b>Analyse</b> to get the cognitive profile.
            </MDTypography>
          )}
        </Grid>
      </Grid>
      {history.length > 1 && (
        <MDBox mt={4}>
          <MDTypography variant="h6">Progress across sessions</MDTypography>
          <MDBox height={260} mt={1}>
            <ResponsiveContainer>
              <LineChart
                data={history.map((h) => ({
                  date: new Date(h.createdAt).toLocaleDateString(),
                  Attention: h.attentionScore,
                  Memory: h.memoryScore,
                  Logic: h.score,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line dataKey="Attention" stroke="#f97316" />
                <Line dataKey="Memory" stroke="#22c55e" />
                <Line dataKey="Logic" stroke="#6366f1" />
              </LineChart>
            </ResponsiveContainer>
          </MDBox>
        </MDBox>
      )}
      <Disclaimer />
    </MDBox>
  );
}
AllResults.propTypes = { go: PropTypes.func.isRequired };
