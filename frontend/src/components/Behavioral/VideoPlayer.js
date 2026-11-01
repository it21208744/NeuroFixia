/*
 * Behavioural assessment: calibrate eye tracking -> watch 4 emotion clips while the webcam
 * records body movement and WebGazer records gaze -> name each emotion -> analyse.
 *
 * Fixes vs. the original component:
 *  - the recorded video and gaze image were *downloaded to the parent's computer* and never sent;
 *    the server then analysed whatever file a developer had left in testFiles/video
 *  - a new MuiPlayer instance was stacked on every clip change and WebGazer was never stopped
 *  - "Next video" could skip clips and send empty answers, which crashed the Python encoder
 *  - gaze samples were pushed into React state ~60 times/second (very slow re-renders)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import video1 from "assets/behavioral/videos/sad.mp4";
import video2 from "assets/behavioral/videos/angry.mp4";
import video3 from "assets/behavioral/videos/happy.mp4";
import video4 from "assets/behavioral/videos/surprised.mp4";
import api, { errorMessage } from "api/client";
import { startGaze, stopGaze } from "utils/webgazer";
import { cameraSupported, startRecording, cameraErrorMessage, extFor } from "utils/media";
import { drawScanpath, canvasToBlob, W, H } from "./scanpath";
import Calibration from "./Calibration";
import ResultsCard from "./ResultsModal";
import TestResultsChart from "./TestResultsChart";
import FacialExpressionGame from "./DraggableExpression";

// Order matters: matches Q1..Q4 of the expression model's training data (sad, angry, happy, surprised)
const CLIPS = [video1, video2, video3, video4];
const CHOICES = [
  ["Happy", "😊"],
  ["Sad", "😢"],
  ["Angry", "😠"],
  ["Surprised", "😲"],
  ["Scared", "😨"],
  ["No answer", "🤐"],
];

export default function VideoPlayer() {
  const [tab, setTab] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro | calibrate | watching | asking | review | analysing | done
  const [clip, setClip] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [gazeCount, setGazeCount] = useState(0);
  const [fixCount, setFixCount] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const gazeRef = useRef([]);
  const collectingRef = useRef(false);
  const recorderRef = useRef(null);

  const cleanup = useCallback(() => {
    collectingRef.current = false;
    recorderRef.current?.cancel();
    recorderRef.current = null;
    stopGaze();
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const onGaze = useCallback((data) => {
    if (!data || !collectingRef.current || !videoRef.current) return;
    const r = videoRef.current.getBoundingClientRect();
    if (!r.width) return;
    // normalise to the stimulus area so the image is independent of screen size
    const x = ((data.x - r.left) / r.width) * W;
    const y = ((data.y - r.top) / r.height) * H;
    if (x < -W * 0.25 || x > W * 1.25 || y < -H * 0.25 || y > H * 1.25) return;
    gazeRef.current.push({
      x: Math.max(0, Math.min(W, x)),
      y: Math.max(0, Math.min(H, y)),
      t: performance.now(),
    });
  }, []);

  const begin = async () => {
    setError("");
    if (!cameraSupported()) {
      setError(
        "This browser cannot record video. Please use a recent Chrome, Edge or Firefox on a computer with a webcam."
      );
      return;
    }
    try {
      await startGaze(onGaze, { showVideo: true });
      setPhase("calibrate");
    } catch (e) {
      setError(cameraErrorMessage(e));
    }
  };

  const afterCalibration = async () => {
    try {
      window.webgazer?.showVideoPreview(false).showPredictionPoints(false);
      recorderRef.current = await startRecording({ audio: false });
      gazeRef.current = [];
      setAnswers([]);
      setClip(0);
      setPhase("watching");
    } catch (e) {
      setError(cameraErrorMessage(e));
      setPhase("intro");
    }
  };

  useEffect(() => {
    if (phase !== "watching" || !videoRef.current) return;
    const v = videoRef.current;
    v.currentTime = 0;
    collectingRef.current = true;
    v.play().catch(() =>
      setError("Press play on the video to continue (your browser blocked autoplay).")
    );
  }, [phase, clip]);

  const onClipEnded = () => {
    collectingRef.current = false;
    setPhase("asking");
  };

  const answer = async (value) => {
    const next = [...answers, value];
    setAnswers(next);
    if (clip < CLIPS.length - 1) {
      setClip(clip + 1);
      setPhase("watching");
      return;
    }
    // all clips done
    const blob = await recorderRef.current?.stop();
    recorderRef.current = null;
    stopGaze();
    setVideoBlob(blob || null);
    setGazeCount(gazeRef.current.length);
    setPhase("review");
  };

  useEffect(() => {
    if (phase === "review" && canvasRef.current)
      setFixCount(drawScanpath(canvasRef.current, gazeRef.current));
  }, [phase]);

  const analyse = async () => {
    setPhase("analysing");
    setError("");
    try {
      const fd = new FormData();
      if (videoBlob && videoBlob.size > 0)
        fd.append("video", videoBlob, `behaviour.${extFor(videoBlob.type)}`);
      if (fixCount >= 2)
        fd.append("scanpath", await canvasToBlob(canvasRef.current), "scanpath.png");
      fd.append("expressions", JSON.stringify(answers));
      fd.append("gazePoints", String(gazeCount));
      const { data } = await api.post("/behavioral/analyze", fd);
      setResult(data);
      setHistoryKey((k) => k + 1);
      setPhase("done");
    } catch (e) {
      setError(errorMessage(e, "Analysis failed"));
      setPhase("review");
    }
  };

  const restart = () => {
    cleanup();
    setResult(null);
    setVideoBlob(null);
    setAnswers([]);
    setClip(0);
    setPhase("intro");
  };

  const progress = ((clip + (phase === "asking" ? 1 : 0)) / CLIPS.length) * 100;

  return (
    <Box>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Assessment" icon={<Icon>play_circle</Icon>} iconPosition="start" />
        <Tab label="History" icon={<Icon>insights</Icon>} iconPosition="start" />
        <Tab label="Emotion game" icon={<Icon>sentiment_satisfied</Icon>} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ p: { xs: 2, md: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {phase === "intro" && (
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <MDTypography variant="h5" mb={1}>
                  How it works (about 3 minutes)
                </MDTypography>
                {[
                  [
                    "center_focus_strong",
                    "Calibrate",
                    "Your child clicks 9 dots so the webcam can learn where they are looking.",
                  ],
                  [
                    "movie",
                    "Watch 4 short clips",
                    "We record eye-gaze and body movement through the webcam while they watch.",
                  ],
                  [
                    "emoji_emotions",
                    "Name the feeling",
                    "After each clip, ask your child which emotion the person showed.",
                  ],
                  [
                    "analytics",
                    "Get results",
                    "Three models (movement, gaze path, emotion answers) are combined into one score.",
                  ],
                ].map(([icon, t, d], i) => (
                  <MDBox key={t} display="flex" mb={1.5}>
                    <MDBox mr={1.5} mt={0.25} color="info">
                      <Icon>{icon}</Icon>
                    </MDBox>
                    <MDBox>
                      <MDTypography variant="button" fontWeight="bold">
                        {i + 1}. {t}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        {d}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                ))}
              </Grid>
              <Grid item xs={12} md={5}>
                <Alert severity="info" sx={{ mb: 2, fontSize: "0.85rem" }}>
                  Sit your child about an arm&apos;s length from the screen in a well-lit room, with
                  their face and upper body visible to the camera. The recording is sent only for
                  analysis and is not stored.
                </Alert>
                <MDButton variant="gradient" color="info" fullWidth onClick={begin}>
                  <Icon sx={{ mr: 1 }}>videocam</Icon> Allow camera & start
                </MDButton>
              </Grid>
            </Grid>
          )}

          {phase === "calibrate" && <Calibration onDone={afterCalibration} />}

          {(phase === "watching" || phase === "asking") && (
            <MDBox>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="h6">
                  Clip {clip + 1} of {CLIPS.length}
                </MDTypography>
                <MDBox display="flex" alignItems="center" color="error">
                  <Icon fontSize="small" sx={{ mr: 0.5, animation: "nfblink 1.2s infinite" }}>
                    fiber_manual_record
                  </Icon>
                  <MDTypography variant="caption" color="error">
                    Recording
                  </MDTypography>
                </MDBox>
              </MDBox>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 2, height: 6 }} />
              <video
                ref={videoRef}
                src={CLIPS[clip]}
                onEnded={onClipEnded}
                playsInline
                controls={false}
                style={{ width: "100%", maxHeight: "65vh", background: "#000", borderRadius: 12 }}
              />
              <style>{"@keyframes nfblink{50%{opacity:.2}}"}</style>
            </MDBox>
          )}

          <Dialog open={phase === "asking"} maxWidth="sm" fullWidth>
            <DialogTitle>How was the person feeling?</DialogTitle>
            <DialogContent>
              <MDTypography variant="body2" color="text" mb={2}>
                Ask your child and click the answer <b>they</b> give.
              </MDTypography>
              <Grid container spacing={1.5}>
                {CHOICES.map(([c, emoji]) => (
                  <Grid item xs={6} sm={4} key={c}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => answer(c)}
                      sx={{
                        py: 1.5,
                        flexDirection: "column",
                        color: "text.primary",
                        borderColor: "grey.400",
                      }}
                    >
                      <span style={{ fontSize: 30 }}>{emoji}</span>
                      {c}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions />
          </Dialog>

          {(phase === "review" || phase === "analysing") && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6" mb={1}>
                  Gaze path
                </MDTypography>
                <canvas
                  ref={canvasRef}
                  style={{ width: "100%", borderRadius: 8, background: "#000" }}
                />
                <MDTypography variant="caption" color="text">
                  {gazeCount} gaze samples · {fixCount} fixations
                  {fixCount < 2 &&
                    " - eye tracking did not pick up enough data; the gaze model will be skipped."}
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6" mb={1}>
                  Answers
                </MDTypography>
                {answers.map((a, i) => (
                  <MDTypography key={i} variant="body2">
                    Clip {i + 1}: <b>{a}</b>
                  </MDTypography>
                ))}
                <MDTypography variant="body2" mt={1} color="text">
                  Webcam recording:{" "}
                  {videoBlob ? `${(videoBlob.size / 1e6).toFixed(1)} MB` : "not available"}
                </MDTypography>
                <MDBox mt={3} display="flex" gap={1} flexWrap="wrap">
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={analyse}
                    disabled={phase === "analysing"}
                  >
                    <Icon sx={{ mr: 1 }}>analytics</Icon> Analyse
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="secondary"
                    onClick={restart}
                    disabled={phase === "analysing"}
                  >
                    Start over
                  </MDButton>
                </MDBox>
                {phase === "analysing" && (
                  <MDBox mt={2}>
                    <LinearProgress />
                    <MDTypography variant="caption" color="text">
                      Analysing movement, gaze and answers - this can take up to a minute…
                    </MDTypography>
                  </MDBox>
                )}
              </Grid>
            </Grid>
          )}

          {phase === "done" && result && (
            <MDBox>
              <ResultsCard data={result} />
              <MDBox mt={2} display="flex" gap={1}>
                <MDButton variant="outlined" color="info" onClick={() => setTab(1)}>
                  See history
                </MDButton>
                <MDButton variant="outlined" color="secondary" onClick={restart}>
                  Take again
                </MDButton>
              </MDBox>
            </MDBox>
          )}
        </Card>
      )}

      {tab === 1 && (
        <Card sx={{ p: 3 }}>
          <TestResultsChart key={historyKey} />
        </Card>
      )}

      {tab === 2 && <FacialExpressionGame />}
    </Box>
  );
}
