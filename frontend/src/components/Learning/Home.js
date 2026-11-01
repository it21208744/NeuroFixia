import { useContext } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { DataContext } from "layouts/Learning";
import logicGame from "components/Cognitive/logicgame.PNG";
import memoryGame from "components/Cognitive/memory.PNG";
import attentionGame from "components/Cognitive/sa.PNG";

const GAMES = [
  ["memory", "1. Memory game", "Find the matching fruit pairs after memorising them.", memoryGame],
  [
    "attention",
    "2. Attention game",
    "Match each picture to its shadow while eye tracking measures focus.",
    attentionGame,
  ],
  ["logic", "3. Logic patterns", "Complete the missing item in 11 picture sequences.", logicGame],
];

/** Landing page of the Learning module (the old one had "Start Game" buttons that did nothing). */
export default function Home({ go }) {
  const { done } = useContext(DataContext);
  const all = GAMES.every(([k]) => done[k]);
  return (
    <MDBox>
      <MDTypography variant="body2" color="text" mb={2}>
        Play the three games in order (about 10 minutes). When all three are done, open{" "}
        <b>Results</b> to get the cognitive profile and suggested activities.
      </MDTypography>
      <Grid container spacing={3}>
        {GAMES.map(([k, title, text, img]) => (
          <Grid item xs={12} md={4} key={k}>
            <Card sx={{ height: "100%", overflow: "hidden" }}>
              <MDBox
                component="img"
                src={img}
                alt=""
                sx={{ width: "100%", height: 160, objectFit: "cover" }}
              />
              <MDBox p={2} display="flex" flexDirection="column" flexGrow={1}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="h6">{title}</MDTypography>
                  {done[k] && (
                    <Chip size="small" color="success" label="Done" icon={<Icon>check</Icon>} />
                  )}
                </MDBox>
                <MDTypography variant="button" color="text" fontWeight="regular" mb={2}>
                  {text}
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="primary"
                  size="small"
                  sx={{ mt: "auto" }}
                  onClick={() => go(k)}
                >
                  {done[k] ? "Play again" : "Start"}
                </MDButton>
              </MDBox>
            </Card>
          </Grid>
        ))}
      </Grid>
      <MDBox mt={3} textAlign="center">
        <MDButton variant="gradient" color="success" disabled={!all} onClick={() => go("results")}>
          <Icon sx={{ mr: 1 }}>analytics</Icon>{" "}
          {all ? "See results" : "Complete all three games to see results"}
        </MDButton>
      </MDBox>
    </MDBox>
  );
}
Home.propTypes = { go: PropTypes.func.isRequired };
