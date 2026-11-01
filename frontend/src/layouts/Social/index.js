import { createContext, useMemo, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PageHeader from "components/common/PageHeader";
import InitialQuestion from "components/SocialSkills/InitialQuestion";
import Questionnaire from "components/SocialSkills/Questionnaire";
import MyResponses from "components/SocialSkills/MyResponses";
import Simon from "components/SocialSkills/Simon";
import Progress from "components/SocialSkills/Progress";

export const LangContext = createContext({});

export default function Social() {
  const [value, setValue] = useState("one");
  const [lang, setLang] = useState("english");
  const ctx = useMemo(() => ({ value, setValue, lang, setLang }), [value, lang]);
  // the questionnaire ("two") lives under the first tab
  const tab = value === "two" ? "one" : value;

  return (
    <LangContext.Provider value={ctx}>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <PageHeader
            icon="diversity_3"
            title="Social skills"
            color="success"
            subtitle="Parent questionnaire (English / සිංහල / தமிழ்) with NLP analysis"
          />
          <Tabs
            value={tab}
            onChange={(e, v) => setValue(v)}
            sx={{ mb: 3 }}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab value="one" label="Questionnaire" icon={<Icon>quiz</Icon>} iconPosition="start" />
            <Tab
              value="three"
              label="My responses"
              icon={<Icon>history</Icon>}
              iconPosition="start"
            />
            <Tab value="five" label="Progress" icon={<Icon>insights</Icon>} iconPosition="start" />
            <Tab
              value="four"
              label="Improvement activity"
              icon={<Icon>sports_esports</Icon>}
              iconPosition="start"
            />
          </Tabs>
          {value === "one" && <InitialQuestion />}
          {value === "two" && <Questionnaire />}
          {value === "three" && <MyResponses />}
          {value === "four" && <Simon />}
          {value === "five" && <Progress />}
        </MDBox>
      </DashboardLayout>
    </LangContext.Provider>
  );
}
