// Auditory therapy room: gradual exposure to party sounds with volume control.
// Fixes: sessions were logged for a hard-coded user "1"; changing the slider did not change
// the volume of a playing sound; sounds kept playing after leaving the page.
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Grid,
  Button,
  Box,
  Alert,
  Chip,
} from "@mui/material";
import api from "api/client";

const SOUNDS = {
  birthdaySong: ["Birthday song", "/sounds/party/birthday_song.mp3", "🎂"],
  partyChatter: ["Party chatter", "/sounds/party/party_chatter.mp3", "🗣️"],
  kidsLaughing: ["Kids laughing", "/sounds/party/kids_laughing.mp3", "😂"],
  clapping: ["Clapping", "/sounds/party/clapping.mp3", "👏"],
  fullParty: ["Full party", "/sounds/party/full_party.mp3", "🎉"],
};
const keys = Object.keys(SOUNDS);
const zero = () => Object.fromEntries(keys.map((k) => [k, 0]));

export default function AuditoryTherapy() {
  const [volume, setVolume] = useState(() => Object.fromEntries(keys.map((k) => [k, 0.2])));
  const [seconds, setSeconds] = useState(zero);
  const [playing, setPlaying] = useState({});
  const [saved, setSaved] = useState("");
  const audios = useRef(null);
  const timers = useRef({});
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;

  if (!audios.current) {
    audios.current = Object.fromEntries(
      keys.map((k) => {
        const a = new Audio(SOUNDS[k][1]);
        a.loop = true;
        return [k, a];
      })
    );
  }

  useEffect(
    () => () => {
      Object.values(audios.current).forEach((a) => a.pause());
      Object.values(timers.current).forEach(clearInterval);
    },
    []
  );

  const start = (k) => {
    const a = audios.current[k];
    a.volume = volume[k];
    a.play().catch(() => {});
    if (!timers.current[k]) {
      timers.current[k] = setInterval(() => setSeconds((s) => ({ ...s, [k]: s[k] + 1 })), 1000);
    }
    setPlaying((p) => ({ ...p, [k]: true }));
    setSaved("");
  };

  const stop = async (k) => {
    const a = audios.current[k];
    a.pause();
    a.currentTime = 0;
    if (!timers.current[k]) return;
    clearInterval(timers.current[k]);
    delete timers.current[k];
    setPlaying((p) => ({ ...p, [k]: false }));
    const duration = secondsRef.current[k];
    setSeconds((s) => ({ ...s, [k]: 0 }));
    if (duration > 0) {
      try {
        await api.post("/sensory/sessions", { sound: k, volume: volume[k], duration });
        setSaved(
          `Saved: ${SOUNDS[k][0]} tolerated for ${duration}s at ${Math.round(
            volume[k] * 100
          )}% volume.`
        );
      } catch (e) {
        setSaved("Could not save the session - check your connection.");
      }
    }
  };

  const changeVolume = (k, v) => {
    setVolume((prev) => ({ ...prev, [k]: v }));
    audios.current[k].volume = v;
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2, fontSize: "0.875rem" }}>
        Start each sound at a low volume and raise it slowly while your child stays calm. Press{" "}
        <b>Stop</b> as soon as they show discomfort - the time they tolerated is saved to Session
        History so you can see progress.
      </Alert>
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {saved}
        </Alert>
      )}
      <Grid container spacing={3}>
        {keys.map((k) => (
          <Grid item xs={12} sm={6} md={4} key={k}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6">
                    {SOUNDS[k][2]} {SOUNDS[k][0]}
                  </Typography>
                  {playing[k] && <Chip size="small" color="success" label={`${seconds[k]}s`} />}
                </Box>
                <Box display="flex" gap={1} mb={2}>
                  <Button
                    variant="contained"
                    onClick={() => start(k)}
                    disabled={!!playing[k]}
                    sx={{
                      backgroundColor: "info.main",
                      color: "#fff !important",
                      "&:hover": { backgroundColor: "info.dark" },
                    }}
                  >
                    Play
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => stop(k)}
                    disabled={!playing[k]}
                    sx={{ borderColor: "error.main", color: "error.main" }}
                  >
                    Stop
                  </Button>
                </Box>
                <Typography variant="body2" gutterBottom>
                  Volume: {Math.round(volume[k] * 100)}%
                </Typography>
                <Slider
                  value={volume[k]}
                  onChange={(e, v) => changeVolume(k, v)}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
