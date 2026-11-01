import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import * as XLSX from "xlsx";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import api, { errorMessage } from "api/client";
import T from "./translations";

/** History of submitted questionnaires (replaces the copy-pasted "AllSales/Coffees" table). */
export default function MyResponses() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const load = () =>
    api
      .get("/social/responses")
      .then((r) => setRows([...r.data].reverse()))
      .catch((e) => setError(errorMessage(e)));
  useEffect(() => {
    load();
  }, []);

  const remove = async () => {
    try {
      await api.delete(`/social/responses/${toDelete}`);
      setToDelete(null);
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const exportXlsx = () => {
    const data = rows.map((r) => ({
      Date: new Date(r.date).toLocaleString(),
      Result: r.risk_prediction,
      "Risk probability": r.risk_probability,
      ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`Q${i + 1}`, r[`q${i + 1}`]])),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Social questionnaire");
    XLSX.writeFile(wb, "neurofixia_social_responses.xlsx");
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!rows) return null;

  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={1}
      >
        <MDTypography variant="h5">My responses</MDTypography>
        {rows.length > 0 && (
          <MDButton variant="outlined" color="info" size="small" onClick={exportXlsx}>
            <Icon sx={{ mr: 0.5 }}>download</Icon> Export Excel
          </MDButton>
        )}
      </MDBox>
      {!rows.length && (
        <MDTypography variant="body2">No questionnaires submitted yet.</MDTypography>
      )}
      {rows.map((r) => {
        const t = T[r.lang] || T.english;
        const risk = r.risk_prediction === "Risk Detected";
        return (
          <Accordion
            key={r._id}
            disableGutters
            sx={{
              mb: 1,
              "&:before": { display: "none" },
              border: "1px solid #eee",
              borderRadius: "8px !important",
            }}
          >
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <MDBox display="flex" alignItems="center" gap={1.5} flexWrap="wrap" width="100%">
                <MDTypography variant="button" fontWeight="medium">
                  {new Date(r.date).toLocaleString()}
                </MDTypography>
                <Chip size="small" color={risk ? "warning" : "success"} label={r.risk_prediction} />
                {typeof r.risk_probability === "number" && (
                  <MDTypography variant="caption" color="text">
                    {Math.round(r.risk_probability * 100)}% risk score
                  </MDTypography>
                )}
              </MDBox>
            </AccordionSummary>
            <AccordionDetails>
              {Array.from({ length: 10 }, (_, i) => `q${i + 1}`).map((q, i) => (
                <MDBox key={q} mb={1}>
                  <MDTypography variant="caption" color="text" display="block">
                    {i + 1}. {t[q]}
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {r[q]}
                  </MDTypography>
                </MDBox>
              ))}
              <MDBox textAlign="right">
                <IconButton color="error" onClick={() => setToDelete(r._id)} aria-label="Delete">
                  <Icon>delete</Icon>
                </IconButton>
              </MDBox>
            </AccordionDetails>
          </Accordion>
        );
      })}
      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>Delete this response?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Cancel</Button>
          <Button color="error" onClick={remove}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
