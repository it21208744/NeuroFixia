import { useState } from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const POINTS = [10, 50, 90].flatMap((y) => [10, 50, 90].map((x) => ({ x, y })));
const CLICKS = 3;

/**
 * 9-point calibration. WebGazer learns from every click on the page, so the child clicks each
 * dot 3 times while looking at it. (The original app had no calibration step at all.)
 */
export default function Calibration({ onDone }) {
  const [clicks, setClicks] = useState(Array(POINTS.length).fill(0));
  const done = clicks.every((c) => c >= CLICKS);

  const hit = (i) => {
    const next = [...clicks];
    next[i] = Math.min(CLICKS, next[i] + 1);
    setClicks(next);
  };

  return (
    <MDBox position="fixed" sx={{ inset: 0, zIndex: 1400, background: "rgba(255,255,255,0.97)" }}>
      <MDBox
        position="absolute"
        top="38%"
        left="50%"
        sx={{ transform: "translate(-50%,-50%)", textAlign: "center", maxWidth: 520, px: 2 }}
      >
        <MDTypography variant="h5">Eye-tracking calibration</MDTypography>
        <MDTypography variant="body2" color="text" mb={2}>
          Look at each red dot and click it {CLICKS} times until it turns green. Keep your head
          still.
        </MDTypography>
        {done && (
          <MDButton variant="gradient" color="success" onClick={onDone}>
            Start the clips
          </MDButton>
        )}
      </MDBox>
      {POINTS.map((p, i) => {
        const c = clicks[i];
        return (
          <MDBox
            key={i}
            component="button"
            onClick={() => hit(i)}
            aria-label={`Calibration point ${i + 1}`}
            position="absolute"
            left={`${p.x}%`}
            top={`${p.y}%`}
            sx={{
              transform: "translate(-50%,-50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "3px solid #fff",
              boxShadow: "0 0 0 2px rgba(0,0,0,.2)",
              cursor: "pointer",
              background:
                c >= CLICKS ? "#22c55e" : `rgba(239,68,68,${0.4 + (0.6 * (CLICKS - c)) / CLICKS})`,
            }}
          />
        );
      })}
    </MDBox>
  );
}

Calibration.propTypes = { onDone: PropTypes.func.isRequired };
