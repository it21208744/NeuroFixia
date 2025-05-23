import * as React from "react";
import { Tabs, Tab, Box, Button, Menu, MenuItem } from "@mui/material";

// Import your components
import Calibrator from "./Calibrator";
import MemoryCard from "./MemoryCard";
import Lo from "./Lo";
import ShadowGame from "./ShadowGame";
import AllResults from "./AllResults";
import SubHome from "./SubHome";
import TestComponent1 from "./TestComponent1";
import TestComponent2 from "./TestComponent2";

//attention
import TicTacToe from "./TicTacToe";
import Attention1 from "./Attention1";
import Attention2 from "./Attention2";
import Attention3 from "./Attention3";
import Attention4 from "./Attention4";

//Memory
import ImageSlider from "./ImageSlider";
import Memory1 from "./Memory1";
import Memory2 from "./Memory2";
import Memory3 from "./Memory3";
import Memory4 from "./Memory4";

//Logical
import LogicGame from "./LogicGame";
import Logic1 from "./Logic1";
import Logic2 from "./Logic2";
import Logic3 from "./Logic3";
import Logic4 from "./Logic4";

// Use TestComponent1 for all activities for now
const AttentionComponents = {
  Attention1: <TicTacToe />,
  Attention2: <Attention1 />,
  Attention3: <Attention2 />,
  Attention4: <Attention3 />,
  Attention5: <Attention4 />,
};

const MemoryComponents = {
  Memory1: <ImageSlider />,
  Memory2: <Memory1 />,
  Memory3: <Memory2 />,
  Memory4: <Memory3 />,
  Memory5: <Memory4 />,
};

const LogicComponents = {
  Logic1: <LogicGame />,
  Logic2: <Logic1 />,
  Logic3: <Logic2 />,
  Logic4: <Logic3 />,
  Logic5: <Logic4 />,
};

export default function LearningNav() {
  const [value, setValue] = React.useState("home");

  // Dropdown state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [submenu, setSubmenu] = React.useState(null);

  const open = Boolean(anchorEl);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSubmenu(null);
  };

  const handleSubMenu = (type) => {
    setSubmenu(type);
  };

  const handleSubItemClick = (page) => {
    setValue(page);
    handleMenuClose();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={value} onChange={handleTabChange}>
        <Tab value="home" label="Home" />
        <Tab value="memory" label="Memory Activity" />
        <Tab value="shadow" label="ShadowGame" />
        <Tab value="logic" label="Logical Thinking" />
        {/* <Tab value="shadow" label="ShadowGame" /> */}
        <Tab value="results" label="AllResults" />
        <Tab value="subhome" label="SubHome" />
        <Button
          sx={{
            ml: 2,
            color: "black",
            borderColor: "black",
            "&:hover": {
              color: "black",
              borderColor: "black",
              backgroundColor: "transparent", // Optional: avoid gray hover background
            },
          }}
          aria-controls="activity-menu"
          aria-haspopup="true"
          onClick={handleMenuClick}
          variant="outlined"
        >
          {/* Activity */}
          <span style={{ color: "black" }}>Activity</span>
        </Button>
      </Tabs>

      {/* Dropdown Menu */}
      <Menu id="activity-menu" anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleSubMenu("attention")}>Attention</MenuItem>
        <MenuItem onClick={() => handleSubMenu("memory")}>Memory</MenuItem>
        <MenuItem onClick={() => handleSubMenu("logic")}>Logic</MenuItem>

        {/* Render submenu items inside the main Menu */}
        {submenu === "attention" &&
          Object.keys(AttentionComponents).map((item) => (
            <MenuItem key={item} onClick={() => handleSubItemClick(item)}>
              {item}
            </MenuItem>
          ))}
        {submenu === "memory" &&
          Object.keys(MemoryComponents).map((item) => (
            <MenuItem key={item} onClick={() => handleSubItemClick(item)}>
              {item}
            </MenuItem>
          ))}
        {submenu === "logic" &&
          Object.keys(LogicComponents).map((item) => (
            <MenuItem key={item} onClick={() => handleSubItemClick(item)}>
              {item}
            </MenuItem>
          ))}
      </Menu>

      {/* Component Renderer */}
      <Box sx={{ mt: 2 }}>
        {value === "home" && <Calibrator />}
        {value === "memory" && <MemoryCard />}
        {value === "shadow" && <ShadowGame />}
        {value === "logic" && <Lo />}
        {/* {value === "shadow" && <ShadowGame />} */}
        {value === "results" && <AllResults />}
        {/* {value === "subhome" && <SubHome />} */}
        {value === "subhome" && <SubHome onSelectActivity={setValue} />}

        {/* Render test activity components */}
        {AttentionComponents[value]}
        {MemoryComponents[value]}
        {LogicComponents[value]}
      </Box>
    </Box>
  );
}
