import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import api, { errorMessage } from "api/client";
import { QUESTION_SHORT } from "./translations";

const concerns = (r) =>
  ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"].filter((q) => r[q] === "no").length +
  (r.sentiment_q9 === 1 ? 1 : 0) +
  (r.sentiment_q10 === 1 ? 1 : 0);

/** Progress over time. (Previously used Tailwind classes that were never installed, so it rendered unstyled.) */
export default function Progress() {
  const [rows, setRows] = useState(null);
  const [scores, setScores] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/social/responses"), api.get("/social/scores")])
      .then(([r, s]) => {
        setRows(r.data);
        setScores(s.data);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!rows) return <LinearProgress />;
  if (!rows.length)
    return (
      <Card sx={{ p: 3 }}>
        <MDTypography variant="body2">Submit a questionnaire to see progress here.</MDTypography>
      </Card>
    );

  const latest = rows[rows.length - 1];
  const risk = latest.risk_prediction === "Risk Detected";
  const chart = rows.map((r) => ({
    date: new Date(r.date).toLocaleDateString(),
    risk:
      typeof r.risk_probability === "number"
        ? Math.round(r.risk_probability * 100)
        : risk
        ? 100
        : 0,
    concerns: concerns(r),
  }));
  const simon = scores.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString(),
    score: s.finalScore,
    level: s.currentLevel,
  }));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Card sx={{ p: 3, height: "100%" }}>
          <MDTypography variant="h6" mb={1}>
            Latest result
          </MDTypography>
          <Chip
            color={risk ? "warning" : "success"}
            label={risk ? "⚠️ Risk detected" : "✅ No risk detected"}
            sx={{ mb: 2 }}
          />
          {risk && latest.top_3_features?.length > 0 && (
            <>
              <MDTypography variant="button" fontWeight="bold" display="block" mb={1}>
                Top areas to work on
              </MDTypography>
              {latest.top_3_features.map((f) => (
                <MDBox key={f.feature} mb={1.5}>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="button">
                      {f.label || QUESTION_SHORT[f.feature]}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      {f.score_percent}% importance
                    </MDTypography>
                  </MDBox>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, f.score_percent * 5)}
                    color="warning"
                    sx={{ height: 6 }}
                  />
                </MDBox>
              ))}
            </>
          )}
        </Card>
      </Grid>
      <Grid item xs={12} md={7}>
        <Card sx={{ p: 3, height: "100%" }}>
          <MDTypography variant="h6">Risk score and concerns over time</MDTypography>
          <MDTypography variant="caption" color="text">
            Lower is better
          </MDTypography>
          <MDBox height={280} mt={2}>
            <ResponsiveContainer>
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="l" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="r"
                  orientation="right"
                  domain={[0, 10]}
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="l"
                  type="monotone"
                  dataKey="risk"
                  name="Risk score (%)"
                  stroke="#f97316"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="r"
                  type="monotone"
                  dataKey="concerns"
                  name="Concerning answers (of 10)"
                  stroke="#6366f1"
                />
              </LineChart>
            </ResponsiveContainer>
          </MDBox>
        </Card>
      </Grid>
      {simon.length > 0 && (
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <MDTypography variant="h6">Simon Says scores</MDTypography>
            <MDBox height={240} mt={2}>
              <ResponsiveContainer>
                <BarChart data={simon}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, n, p) => [`${v}% (level ${p.payload.level})`, "Score"]} />
                  <Bar dataKey="score" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </MDBox>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
