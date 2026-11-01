import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Disclaimer from "components/common/Disclaimer";
import api, { errorMessage } from "api/client";
import { useAuth } from "context/AuthContext";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

const modules = [
  {
    key: "behavioral",
    title: "Behavioural",
    icon: "visibility",
    color: "info",
    route: "/behavioral",
    blurb: "Watch 4 short clips while eye-gaze and movement are analysed, then name the emotions.",
    result: (s) =>
      s?.latest && {
        flag: s.latest.final_prediction === "autism",
        text: `${Math.round((s.latest.combined_confidence || 0) * 100)}% likelihood of ASD traits`,
        date: s.latest.createdAt,
      },
  },
  {
    key: "social",
    title: "Social Skills",
    icon: "diversity_3",
    color: "success",
    route: "/social",
    blurb:
      "A 10-question parent questionnaire in English, Sinhala or Tamil (voice input supported).",
    result: (s) =>
      s?.latest && {
        flag: s.latest.risk_prediction === "Risk Detected",
        text: s.latest.risk_prediction,
        date: s.latest.date,
      },
  },
  {
    key: "sensory",
    title: "Sensory Processing",
    icon: "hearing",
    color: "warning",
    route: "/sensory",
    blurb: "Record your child's reaction to everyday noises and practise in the therapy room.",
    result: (s) =>
      s?.latest && {
        flag: s.latest.final_prediction === "Hypersensitivity",
        text: s.latest.final_prediction,
        date: s.latest.createdAt,
      },
  },
  {
    key: "cognitive",
    title: "Learning Abilities",
    icon: "extension",
    color: "primary",
    route: "/learning",
    blurb: "Memory, attention (with eye tracking) and logic games that build a cognitive profile.",
    result: (s) =>
      s?.latest && {
        flag: s.latest.prediction === 1,
        text: `Attention ${s.latest.levels?.attention} · Memory ${s.latest.levels?.memory} · Logic ${s.latest.levels?.logic}`,
        date: s.latest.createdAt,
      },
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((r) => setSummary(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const done = summary ? modules.filter((m) => summary[m.key]?.count > 0).length : 0;
  const child = user?.child?.name;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card
          sx={{ p: { xs: 2, md: 3 }, mb: 3, background: "linear-gradient(135deg,#1e3a8a,#0e7490)" }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <MDTypography variant="h4" color="white">
                Hello {user?.name?.split(" ")[0] || "there"} 👋
              </MDTypography>
              <MDTypography variant="body2" color="white" opacity={0.85}>
                {child
                  ? `Here is ${child}'s progress across the four NeuroFixia assessments.`
                  : "Add your child's details in the profile, then work through the four assessments below - in any order."}
              </MDTypography>
            </Grid>
            <Grid item xs={12} md={4} textAlign={{ xs: "left", md: "right" }}>
              <MDTypography variant="h2" color="white">
                {summary ? `${done}/4` : "–"}
              </MDTypography>
              <MDTypography variant="caption" color="white" opacity={0.85}>
                assessments completed
              </MDTypography>
            </Grid>
          </Grid>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {modules.map((m) => {
            const s = summary?.[m.key];
            const r = m.result(s);
            return (
              <Grid item xs={12} md={6} key={m.key}>
                <Card sx={{ height: "100%", p: 2.5, display: "flex", flexDirection: "column" }}>
                  <MDBox display="flex" alignItems="center" mb={1.5}>
                    <MDBox
                      variant="gradient"
                      bgColor={m.color}
                      coloredShadow={m.color}
                      borderRadius="lg"
                      width="3rem"
                      height="3rem"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mr={1.5}
                    >
                      <Icon sx={{ color: "#fff" }}>{m.icon}</Icon>
                    </MDBox>
                    <MDBox flexGrow={1}>
                      <MDTypography variant="h6">{m.title}</MDTypography>
                      <MDTypography variant="caption" color="text">
                        {s ? `${s.count} assessment${s.count === 1 ? "" : "s"} recorded` : " "}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  <MDTypography variant="button" color="text" fontWeight="regular" mb={2}>
                    {m.blurb}
                  </MDTypography>
                  <MDBox mt="auto">
                    {!summary ? (
                      <Skeleton height={32} />
                    ) : r ? (
                      <MDBox display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={1.5}>
                        <Chip
                          size="small"
                          color={r.flag ? "warning" : "success"}
                          label={r.flag ? "Needs attention" : "On track"}
                        />
                        <MDTypography variant="caption" fontWeight="medium">
                          {r.text}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          · {fmtDate(r.date)}
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <MDTypography variant="caption" color="text" display="block" mb={1.5}>
                        Not started yet
                      </MDTypography>
                    )}
                    <MDButton
                      variant="gradient"
                      color={m.color}
                      size="small"
                      onClick={() => navigate(m.route)}
                    >
                      {r ? "Open" : "Start"} <Icon sx={{ ml: 0.5 }}>arrow_forward</Icon>
                    </MDButton>
                  </MDBox>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        <Disclaimer />
      </MDBox>
    </DashboardLayout>
  );
}
