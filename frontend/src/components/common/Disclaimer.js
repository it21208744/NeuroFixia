import Alert from "@mui/material/Alert";

export default function Disclaimer() {
  return (
    <Alert severity="info" sx={{ fontSize: "0.85rem", mt: 2 }}>
      These results come from screening models and are <b>not a diagnosis</b>. If you are concerned
      about your child&apos;s development, please consult a paediatrician or child psychiatrist (in
      Sri Lanka, e.g. the{" "}
      <a href="https://lrh.health.gov.lk/home-en/" target="_blank" rel="noreferrer">
        Lady Ridgeway Hospital for Children
      </a>
      ).
    </Alert>
  );
}
