import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import attentionI from "components/Cognitive/attentionI.png";
import attentionI1 from "components/Cognitive/attentionI1.jpeg";
import attentionI2 from "components/Cognitive/attentionI2.png";
import attentionI3 from "components/Cognitive/attentionI3.png";
import attentionI4 from "components/Cognitive/attentionI4.jpg";
import memoryI from "components/Cognitive/memoryI.jpg";
import memoryI1 from "components/Cognitive/memoryI1.jpg";
import memoryI2 from "components/Cognitive/memoryI2.jpg";
import memoryI3 from "components/Cognitive/memoryI3.jpg";
import memoryI4 from "components/Cognitive/memoryI4.jpeg";
import logicI from "components/Cognitive/logicI.jpg";
import logicI1 from "components/Cognitive/logicI1.jpeg";
import logicI2 from "components/Cognitive/logicI2.png";
import logicI3 from "components/Cognitive/logicI3.jpg";
import logicI4 from "components/Cognitive/logicI4.png";

import TicTacToe from "./TicTacToe";
import Attention1 from "./Attention1";
import Attention2 from "./Attention2";
import Attention3 from "./Attention3";
import Attention4 from "./Attention4";
import ImageSlider from "./ImageSlider";
import Memory1 from "./Memory1";
import Memory2 from "./Memory2";
import Memory3 from "./Memory3";
import Memory4 from "./Memory4";
import LogicGame from "./LogicGame";
import Logic1 from "./Logic1";
import Logic2 from "./Logic2";
import Logic3 from "./Logic3";
import Logic4 from "./Logic4";

export const ACTIVITY_COMPONENTS = {
  Attention1: <TicTacToe />,
  Attention2: <Attention1 />,
  Attention3: <Attention2 />,
  Attention4: <Attention3 />,
  Attention5: <Attention4 />,
  Memory1: <ImageSlider />,
  Memory2: <Memory1 />,
  Memory3: <Memory2 />,
  Memory4: <Memory3 />,
  Memory5: <Memory4 />,
  Logic1: <LogicGame />,
  Logic2: <Logic1 />,
  Logic3: <Logic2 />,
  Logic4: <Logic3 />,
  Logic5: <Logic4 />,
};

export const GROUPS = [
  [
    "attention",
    "Attention activities",
    [attentionI, attentionI1, attentionI2, attentionI3, attentionI4],
    "Attention",
  ],
  ["memory", "Memory activities", [memoryI, memoryI1, memoryI2, memoryI3, memoryI4], "Memory"],
  ["logic", "Logical thinking activities", [logicI, logicI1, logicI2, logicI3, logicI4], "Logic"],
];

/** Improvement activities. `focus` (from Results) puts the child's weakest area first. */
export default function SubHome({ onSelectActivity, focus }) {
  const groups = focus ? [...GROUPS].sort((a, b) => (b[0] === focus) - (a[0] === focus)) : GROUPS;
  return (
    <MDBox>
      <MDTypography variant="h5" mb={1}>
        Suggested activities
      </MDTypography>
      <MDTypography variant="body2" color="text" mb={3}>
        Short, playful exercises to practise at home. Pick the area your child&apos;s results show
        as Low or Moderate.
      </MDTypography>
      {groups.map(([key, title, images, prefix]) => (
        <MDBox key={key} mb={4}>
          <MDTypography variant="h6" mb={1.5}>
            {title}
          </MDTypography>
          <Grid container spacing={2}>
            {images.map((img, i) => (
              <Grid item xs={6} sm={4} md={2.4} key={i}>
                <Card sx={{ overflow: "hidden", height: "100%" }}>
                  <MDBox
                    component="img"
                    src={img}
                    alt=""
                    sx={{ width: "100%", height: 110, objectFit: "cover" }}
                  />
                  <MDBox p={1.5} textAlign="center">
                    <MDTypography variant="button" fontWeight="medium" display="block" mb={1}>
                      {prefix} {i + 1}
                    </MDTypography>
                    <MDButton
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => onSelectActivity(`${prefix}${i + 1}`)}
                    >
                      Play
                    </MDButton>
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </Grid>
        </MDBox>
      ))}
    </MDBox>
  );
}
SubHome.defaultProps = { focus: null };
SubHome.propTypes = { onSelectActivity: PropTypes.func.isRequired, focus: PropTypes.string };
