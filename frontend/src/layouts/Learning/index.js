import { createContext, useCallback, useMemo, useState } from "react";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PageHeader from "components/common/PageHeader";
import LearningNav from "components/Learning/LearningNav";

export const DataContext = createContext(null);

const formatTime = (seconds) => {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function Learning() {
  // memory game
  const [accuracy, setAccuracy] = useState(0);
  const [memoryScore, setMemoryScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  // logic game
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [completionTimes, setCompletionTimes] = useState([]);
  const totalTime = completionTimes.reduce((acc, t) => acc + t, 0);
  // attention (shadow) game
  const [shadowScore, setShadowScore] = useState(100);
  const [completedPatterns, setCompletedPatterns] = useState([]);
  const [gazeShiftsCount, setGazeShiftsCount] = useState(0);
  const [fixationDuration, setFixationDuration] = useState(0);
  // which of the three assessment games have been completed this session
  const [done, setDone] = useState({});
  const markDone = useCallback((k) => setDone((d) => (d[k] ? d : { ...d, [k]: true })), []);

  const value = useMemo(
    () => ({
      elapsedTime,
      setElapsedTime,
      accuracy,
      setAccuracy,
      memoryScore,
      setMemoryScore,
      formatTime,
      score,
      setScore,
      errors,
      setErrors,
      totalTime,
      completionTimes,
      setCompletionTimes,
      shadowScore,
      setShadowScore,
      completedPatterns,
      setCompletedPatterns,
      gazeShiftsCount,
      setGazeShiftsCount,
      fixationDuration,
      setFixationDuration,
      done,
      markDone,
    }),
    [
      elapsedTime,
      accuracy,
      memoryScore,
      score,
      errors,
      totalTime,
      completionTimes,
      shadowScore,
      completedPatterns,
      gazeShiftsCount,
      fixationDuration,
      done,
      markDone,
    ]
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <PageHeader
          icon="extension"
          title="Learning abilities"
          color="primary"
          subtitle="Memory, attention and logical-thinking games with eye tracking"
        />
        <DataContext.Provider value={value}>
          <LearningNav />
        </DataContext.Provider>
      </MDBox>
    </DashboardLayout>
  );
}
