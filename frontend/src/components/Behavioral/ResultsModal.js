import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Disclaimer from "components/common/Disclaimer";

const pct = (v) => (v === null || v === undefined ? "–" : `${Math.round(v * 100)}%`);

const SECTIONS = [
  ["behavior", "Body movement", "Pose-based model on the webcam recording"],
  ["heatmap", "Gaze path", "Eye-tracking scan-path model"],
  ["facial_expressions_recognition", "Emotion recognition", "Answers to the 4 clips"],
];

/** Result summary for one behavioural assessment. All confidences are P(ASD traits). */
export default function ResultsCard({ data }) {
  const flagged = data.final_prediction === "autism";
  return (
    <MDBox>
      <MDBox
        p={2.5}
        borderRadius="lg"
        mb={2}
        sx={{
          background: flagged ? "#fff7ed" : "#ecfdf5",
          border: `1px solid ${flagged ? "#fdba74" : "#6ee7b7"}`,
        }}
      >
        <MDTypography variant="h5" sx={{ color: flagged ? "#9a3412" : "#065f46" }}>
          {flagged
            ? "Some signs of autism-related traits were detected"
            : "No strong signs of autism-related traits"}
        </MDTypography>
        <MDTypography variant="body2" sx={{ color: flagged ? "#9a3412" : "#065f46" }}>
          Combined likelihood: <b>{pct(data.combined_confidence)}</b> (from{" "}
          {data.modalities_used?.length || 0} of 3 measures)
        </MDTypography>
      </MDBox>
      <Grid container spacing={2}>
        {SECTIONS.map(([k, title, sub]) => {
          const d = data.details?.[k] || {};
          const ok = d.confidence !== null && d.confidence !== undefined;
          return (
            <Grid item xs={12} md={4} key={k}>
              <MDBox p={2} borderRadius="lg" sx={{ border: "1px solid #e5e7eb", height: "100%" }}>
                <MDTypography variant="h6">{title}</MDTypography>
                <MDTypography variant="caption" color="text" display="block" mb={1}>
                  {sub}
                </MDTypography>
                {ok ? (
                  <>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        size="small"
                        label={d.prediction}
                        color={d.confidence >= 0.5 ? "warning" : "success"}
                      />
                      <MDTypography variant="button" fontWeight="bold">
                        {pct(d.confidence)}
                      </MDTypography>
                    </MDBox>
                    <LinearProgress
                      variant="determinate"
                      value={d.confidence * 100}
                      color={d.confidence >= 0.5 ? "warning" : "success"}
                      sx={{ mt: 1, height: 6 }}
                    />
                  </>
                ) : (
                  <MDTypography variant="caption" color="text">
                    {d.note || "Not available"}
                  </MDTypography>
                )}
              </MDBox>
            </Grid>
          );
        })}
      </Grid>
      {data.notes?.length > 0 && (
        <MDTypography variant="caption" color="text" display="block" mt={1}>
          {data.notes.join(" ")}
        </MDTypography>
      )}
      <Disclaimer />
    </MDBox>
  );
}

ResultsCard.propTypes = { data: PropTypes.object.isRequired };
