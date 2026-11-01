import PropTypes from "prop-types";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/** Consistent coloured header used at the top of every module page. */
export default function PageHeader({ icon, title, subtitle, color }) {
  return (
    <MDBox
      variant="gradient"
      bgColor={color}
      coloredShadow={color}
      borderRadius="xl"
      p={{ xs: 2, md: 3 }}
      mb={3}
      display="flex"
      alignItems="center"
    >
      <MDBox
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="3.5rem"
        height="3.5rem"
        borderRadius="lg"
        mr={2}
        sx={{ background: "rgba(255,255,255,0.18)", flexShrink: 0 }}
      >
        <Icon sx={{ color: "#fff", fontSize: "2rem !important" }}>{icon}</Icon>
      </MDBox>
      <MDBox>
        <MDTypography variant="h4" color="white">
          {title}
        </MDTypography>
        {subtitle && (
          <MDTypography variant="button" color="white" fontWeight="regular" opacity={0.85}>
            {subtitle}
          </MDTypography>
        )}
      </MDBox>
    </MDBox>
  );
}

PageHeader.defaultProps = { subtitle: "", color: "info" };
PageHeader.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  color: PropTypes.string,
};
