import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import AuthLayout from "layouts/authentication/components/AuthLayout";
import { useAuth } from "context/AuthContext";
import { errorMessage } from "api/client";

export default function SignIn() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Sign in failed"));
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your child's journey">
      <MDBox component="form" onSubmit={submit} noValidate>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
            {error}
          </Alert>
        )}
        <MDBox mb={2}>
          <MDInput
            type="email"
            label="Email"
            fullWidth
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </MDBox>
        <MDBox mb={3}>
          <MDInput
            type="password"
            label="Password"
            fullWidth
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </MDBox>
        <MDButton
          type="submit"
          variant="gradient"
          color="info"
          fullWidth
          disabled={busy || !email || !password}
        >
          {busy ? <CircularProgress size={18} color="inherit" /> : "Sign in"}
        </MDButton>
        <MDTypography variant="button" color="text" display="block" textAlign="center" mt={3}>
          New to NeuroFixia?{" "}
          <MDTypography
            component={Link}
            to="/authentication/sign-up"
            variant="button"
            color="info"
            fontWeight="medium"
            textGradient
          >
            Create an account
          </MDTypography>
        </MDTypography>
      </MDBox>
    </AuthLayout>
  );
}
