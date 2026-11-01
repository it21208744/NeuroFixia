import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
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
import api, { errorMessage } from "api/client";

const asPct = (v) => (v === null || v === undefined ? null : Math.round(v * 100));

export default function TestResultsChart() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/behavioral/predictions")
      .then(({ data }) =>
        setRows(
          data.map((item) => ({
            date: new Date(item.createdAt).toLocaleString([], {
              dateStyle: "short",
              timeStyle: "short",
            }),
            combined: asPct(item.combined_confidence),
            behaviour: asPct(item.details?.behavior?.confidence),
            emotion: asPct(item.details?.facial_expressions_recognition?.confidence),
            gaze: asPct(item.details?.heatmap?.confidence),
          }))
        )
      )
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!rows) return <CircularProgress />;
  if (!rows.length)
    return (
      <MDTypography variant="body2">
        No assessments yet - complete one to see progress here.
      </MDTypography>
    );

  return (
    <MDBox>
      <MDTypography variant="h6">Likelihood of ASD traits over time (%)</MDTypography>
      <MDTypography variant="caption" color="text">
        Lower is better. Each point is one completed assessment.
      </MDTypography>
      <MDBox height={360} mt={2}>
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => (v === null ? "–" : `${v}%`)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="combined"
              stroke="#1A73E8"
              strokeWidth={3}
              name="Combined"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="behaviour"
              stroke="#22c55e"
              name="Movement"
              connectNulls
            />
            <Line type="monotone" dataKey="gaze" stroke="#f97316" name="Gaze path" connectNulls />
            <Line
              type="monotone"
              dataKey="emotion"
              stroke="#a855f7"
              name="Emotion answers"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </MDBox>
    </MDBox>
  );
}
