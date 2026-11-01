// src/components/SessionHistory.js
import React, { useEffect, useState, useRef } from "react";
import api, { errorMessage } from "api/client";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const contentRef = useRef();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/sensory/sessions");
        // volume stored 0-1; show as % so it shares the axis with seconds
        const sorted = res.data
          .map((s) => ({ ...s, volumePct: Math.round(s.volume * 100) }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setSessions(sorted);
        setFilteredSessions(sorted);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const filterByDateRange = () => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // bug fix: sessions on the end date were excluded
    const filtered = sessions.filter((session) => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= start && sessionDate <= end;
    });
    setFilteredSessions(filtered);
  };

  const handleExport = async (type) => {
    const element = contentRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");

    if (type === "image") {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "session-history.png";
      link.click();
    } else if (type === "pdf") {
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      pdf.save("session-history.pdf");
    }
  };

  const groupBySound = (data) => {
    return data.reduce((acc, session) => {
      const sound = session.sound || "Unknown";
      if (!acc[sound]) acc[sound] = [];
      acc[sound].push(session);
      return acc;
    }, {});
  };

  const sessionsBySound = groupBySound(filteredSessions);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;

  if (!sessions.length)
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="body2">
          No therapy sessions yet. Use the Auditory Therapy room - each time you stop a sound, the
          session is saved here.
        </Typography>
      </Card>
    );

  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Session History
      </Typography>

      <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{
              mr: 1,
              backgroundColor: "info.main",
              color: "#ffffff !important",
              "&:hover": {
                backgroundColor: "info.dark",
              },
            }}
            onClick={filterByDateRange}
          >
            Filter
          </Button>
          <Button variant="text" onClick={() => setFilteredSessions(sessions)}>
            Clear
          </Button>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            sx={{
              mr: 1,
              backgroundColor: "info.main",
              color: "#ffffff !important",
              "&:hover": {
                backgroundColor: "info.dark",
              },
            }}
            onClick={() => handleExport("image")}
          >
            Export Image
          </Button>
          <Button
            variant="contained"
            sx={{
              mr: 1,
              backgroundColor: "info.main",
              color: "#ffffff !important",
              "&:hover": {
                backgroundColor: "info.dark",
              },
            }}
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      <div ref={contentRef}>
        {Object.entries(sessionsBySound).map(([sound, sessions], index) => (
          <Box key={index} mb={6}>
            <Typography variant="h5" gutterBottom>
              {sound.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
            </Typography>

            <Box mb={2} mt={1}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sessions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
                  <Legend />
                  <Line type="monotone" dataKey="volumePct" name="Volume (%)" stroke="#1976d2" />
                  <Line type="monotone" dataKey="duration" name="Tolerated (s)" stroke="#2e7d32" />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Grid container spacing={3}>
              {sessions.map((session, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Sound: {session.sound}</Typography>
                      <Typography>Volume: {Math.round(session.volume * 100)}%</Typography>
                      <Typography>Duration: {session.duration}s</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(session.timestamp).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </div>
    </Card>
  );
};

export default SessionHistory;
