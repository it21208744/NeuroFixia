import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import AuthLayout from "layouts/authentication/components/AuthLayout";
import { useAuth } from "context/AuthContext";
import { errorMessage } from "api/client";

export default function SignUp() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user && !busy) return <Navigate to="/dashboard" replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters long");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/profile?welcome=1", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Registration failed"));
      setBusy(false);
    }
    return null;
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One parent account keeps all your child's results together"
    >
      <MDBox component="form" onSubmit={submit} noValidate>
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
            {error}
          </Alert>
        )}
        <MDBox mb={2}>
          <MDInput
            label="Your name"
            fullWidth
            value={form.name}
            onChange={set("name")}
            autoComplete="name"
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="email"
            label="Email"
            fullWidth
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="password"
            label="Password (min 6 characters)"
            fullWidth
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
            required
          />
        </MDBox>
        <MDBox mb={1}>
          <MDInput
            type="password"
            label="Confirm password"
            fullWidth
            value={form.confirm}
            onChange={set("confirm")}
            autoComplete="new-password"
            required
          />
        </MDBox>
        <MDBox display="flex" alignItems="center" ml={-1} mb={2}>
          <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <MDTypography
            variant="button"
            color="text"
            fontWeight="regular"
            sx={{ cursor: "pointer" }}
            onClick={() => setAgree(!agree)}
          >
            I understand NeuroFixia is a screening aid and not a medical diagnosis
          </MDTypography>
        </MDBox>
        <MDButton
          type="submit"
          variant="gradient"
          color="info"
          fullWidth
          disabled={busy || !agree || !form.name || !form.email || !form.password}
        >
          {busy ? <CircularProgress size={18} color="inherit" /> : "Create account"}
        </MDButton>
        <MDTypography variant="button" color="text" display="block" textAlign="center" mt={3}>
          Already have an account?{" "}
          <MDTypography
            component={Link}
            to="/authentication/sign-in"
            variant="button"
            color="info"
            fontWeight="medium"
            textGradient
          >
            Sign in
          </MDTypography>
        </MDTypography>
      </MDBox>
    </AuthLayout>
  );
}
