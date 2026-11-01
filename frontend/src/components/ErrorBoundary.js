import { Component } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

/** Keeps one broken screen from blanking the whole app. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("UI error:", error, info);
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;
    if (!error) return children;
    return (
      <Box p={6} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Something went wrong on this page
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {String(error.message || error)}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ color: "#fff !important" }}
        >
          Reload
        </Button>
      </Box>
    );
  }
}
ErrorBoundary.propTypes = { children: PropTypes.node.isRequired };
