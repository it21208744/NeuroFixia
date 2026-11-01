import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import logo from "assets/images/neurofixia-logo.svg";

const modules = [
  ["visibility", "Behavioural", "Eye-gaze, movement & emotion recognition"],
  ["diversity_3", "Social skills", "Multilingual parent questionnaire with NLP"],
  ["hearing", "Sensory", "Auditory hypersensitivity test & therapy room"],
  ["extension", "Learning", "Memory, attention & logic games"],
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      sx={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0e7490 100%)", py: 4 }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={4}
        sx={{ px: 2, m: 0, width: "100%" }}
      >
        <Grid item xs={12} md={5} lg={4} sx={{ display: { xs: "none", md: "block" } }}>
          <MDBox color="white">
            <MDBox display="flex" alignItems="center" mb={2}>
              <MDBox component="img" src={logo} alt="" width="3rem" mr={1.5} />
              <MDTypography variant="h3" color="white">
                NeuroFixia
              </MDTypography>
            </MDBox>
            <MDTypography variant="h5" color="white" fontWeight="regular" mb={3} opacity={0.9}>
              Early screening and guided home activities for autism-related developmental needs.
            </MDTypography>
            {modules.map(([icon, name, text]) => (
              <MDBox key={name} display="flex" alignItems="flex-start" mb={1.5}>
                <Icon sx={{ color: "#67e8f9", mr: 1.5, mt: 0.3 }}>{icon}</Icon>
                <MDBox>
                  <MDTypography variant="button" color="white" fontWeight="bold" display="block">
                    {name}
                  </MDTypography>
                  <MDTypography variant="caption" color="white" opacity={0.8}>
                    {text}
                  </MDTypography>
                </MDBox>
              </MDBox>
            ))}
            <MDTypography variant="caption" color="white" opacity={0.7} display="block" mt={3}>
              NeuroFixia is a screening aid, not a diagnosis. Always discuss results with a
              qualified professional.
            </MDTypography>
          </MDBox>
        </Grid>
        <Grid item xs={12} sm={9} md={5} lg={4} xl={3.5}>
          <Card sx={{ p: { xs: 3, sm: 4 } }}>
            <MDBox display={{ xs: "flex", md: "none" }} alignItems="center" mb={2}>
              <MDBox component="img" src={logo} alt="" width="2.25rem" mr={1} />
              <MDTypography variant="h5">NeuroFixia</MDTypography>
            </MDBox>
            <MDTypography variant="h4" fontWeight="bold">
              {title}
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="regular" display="block" mb={3}>
              {subtitle}
            </MDTypography>
            {children}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
