// src/components/AuditoryTherapy.js
import React, { useRef, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Slider, Grid, Button, Box } from "@mui/material";

const AuditoryTherapy = ({ userId }) => {
  const [volume, setVolume] = useState({
    birthdaySong: 0,
    partyChatter: 0,
    kidsLaughing: 0,
    clapping: 0,
    fullParty: 0,
  });

  const [toleranceTime, setToleranceTime] = useState({
    birthdaySong: 0,
    partyChatter: 0,
    kidsLaughing: 0,
    clapping: 0,
    fullParty: 0,
  });

  const [intervals, setIntervals] = useState({});

  const audios = {
    birthdaySong: useRef(new Audio("/sounds/party/birthday_song.mp3")).current,
    partyChatter: useRef(new Audio("/sounds/party/party_chatter.mp3")).current,
    kidsLaughing: useRef(new Audio("/sounds/party/kids_laughing.mp3")).current,
    clapping: useRef(new Audio("/sounds/party/clapping.mp3")).current,
    fullParty: useRef(new Audio("/sounds/party/full_party.mp3")).current,
  };

  const startSound = (key) => {
    const audio = audios[key];
    audio.volume = volume[key];
    audio.loop = true;
    audio.play();

    if (!intervals[key]) {
      const intervalId = setInterval(() => {
        setToleranceTime((prev) => ({
          ...prev,
          [key]: prev[key] + 1,
        }));
      }, 1000);

      setIntervals((prev) => ({
        ...prev,
        [key]: intervalId,
      }));
    }
  };

  const stopSound = async (key) => {
    const audio = audios[key];
    audio.pause();
    audio.currentTime = 0;

    if (intervals[key]) {
      clearInterval(intervals[key]);

      setIntervals((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      try {
        await axios.post("http://localhost:5000/api/sessions", {
          userId: "1",
          sound: key,
          volume: volume[key],
          duration: toleranceTime[key],
        });
      } catch (err) {
        console.error("Logging failed", err);
      }

      setToleranceTime((prev) => ({
        ...prev,
        [key]: 0,
      }));
    }
  };

  const handleVolumeChange = (key, newValue) => {
    setVolume((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" align="center" gutterBottom>
        Auditory Therapy Room
      </Typography>

      <Grid container spacing={3}>
        {Object.keys(volume).map((key) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {key.replace(/([A-Z])/g, " $1")}
                </Typography>

                <Box display="flex" justifyContent="center" mb={2}>
                  <Button
                    variant="contained"
                    onClick={() => startSound(key)}
                    sx={{
                      mr: 1,
                      backgroundColor: "info.main",
                      color: "#ffffff !important",
                      "&:hover": {
                        backgroundColor: "info.dark",
                      },
                    }}
                  >
                    Play
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => stopSound(key)}
                    sx={{
                      borderColor: "error.main",
                      color: "error.main",
                      "&:hover": {
                        borderColor: "error.dark",
                        color: "error.dark",
                      },
                    }}
                  >
                    Stop
                  </Button>
                </Box>

                <Typography gutterBottom>Volume: {Math.round(volume[key] * 100)}%</Typography>

                <Slider
                  value={volume[key]}
                  onChange={(e, val) => handleVolumeChange(key, val)}
                  min={0}
                  max={1}
                  step={0.01}
                  sx={{ mb: 1 }}
                />

                <Typography variant="body2">Tolerated: {toleranceTime[key]}s</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AuditoryTherapy;
