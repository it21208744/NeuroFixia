import { useState } from "react";
import { Tabs, Tab, Box, Icon } from "@mui/material";
import Card from "@mui/material/Card";

import Home from "./Home";
import MemoryCard from "./MemoryCard";
import Lo from "./Lo";
import ShadowGame from "./ShadowGame";
import AllResults from "./AllResults";
import SubHome, { ACTIVITY_COMPONENTS } from "./SubHome";

const TABS = [
  ["home", "Start", "home"],
  ["memory", "Memory", "style"],
  ["attention", "Attention", "center_focus_strong"],
  ["logic", "Logic", "psychology"],
  ["results", "Results", "analytics"],
  ["activities", "Activities", "sports_esports"],
];

export default function LearningNav() {
  const [value, setValue] = useState("home");
  const activity = ACTIVITY_COMPONENTS[value];
  const tab = activity ? "activities" : value;

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={tab}
        onChange={(e, v) => setValue(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3 }}
      >
        {TABS.map(([v, label, icon]) => (
          <Tab key={v} value={v} label={label} icon={<Icon>{icon}</Icon>} iconPosition="start" />
        ))}
      </Tabs>
      <Card sx={{ p: { xs: 1.5, md: 3 }, overflowX: "auto" }} className="nf-learning">
        {value === "home" && <Home go={setValue} />}
        {value === "memory" && <MemoryCard />}
        {value === "attention" && <ShadowGame />}
        {value === "logic" && <Lo />}
        {value === "results" && <AllResults go={setValue} />}
        {value === "activities" && <SubHome onSelectActivity={setValue} />}
        {activity}
      </Card>
    </Box>
  );
}
