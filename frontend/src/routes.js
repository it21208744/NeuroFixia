/**
 * NeuroFixia routes. Items with type "collapse" appear in the side navigation.
 * Routes marked `public` are reachable without signing in.
 */
import Dashboard from "layouts/dashboard";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Behavioral from "layouts/Behavioral";
import Learning from "layouts/Learning";
import Sensory from "layouts/Sensory";
import Social from "layouts/Social";

import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">space_dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  { type: "title", title: "Assessments", key: "assessments-title" },
  {
    type: "collapse",
    name: "Behavioural",
    key: "behavioral",
    icon: <Icon fontSize="small">visibility</Icon>,
    route: "/behavioral",
    component: <Behavioral />,
  },
  {
    type: "collapse",
    name: "Social Skills",
    key: "social",
    icon: <Icon fontSize="small">diversity_3</Icon>,
    route: "/social",
    component: <Social />,
  },
  {
    type: "collapse",
    name: "Sensory Processing",
    key: "sensory",
    icon: <Icon fontSize="small">hearing</Icon>,
    route: "/sensory",
    component: <Sensory />,
  },
  {
    type: "collapse",
    name: "Learning Abilities",
    key: "learning",
    icon: <Icon fontSize="small">extension</Icon>,
    route: "/learning",
    component: <Learning />,
  },
  { type: "divider", key: "divider-1" },
  {
    type: "collapse",
    name: "Child Profile",
    key: "profile",
    icon: <Icon fontSize="small">child_care</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "hidden",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
    public: true,
  },
  {
    type: "hidden",
    key: "sign-up",
    route: "/authentication/sign-up",
    component: <SignUp />,
    public: true,
  },
];

export default routes;
