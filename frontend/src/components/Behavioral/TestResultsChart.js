import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const TestResultsChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/predictions");

        // Transform API response to match chart format
        const formattedData = response.data.map((item) => ({
          testDate: new Date(item.createdAt).toISOString().split("T")[0],
          combined_confidence: item.combined_confidence,
          behavior_confidence: item.details.behavior.confidence,
          facial_confidence: item.details.facial_expressions_recognition.confidence,
          heatmap_confidence: item.details.heatmap.confidence,
          final_prediction: item.final_prediction,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching prediction data:", error);
      }
    };

    fetchPredictions();
  }, []);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="testDate" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="combined_confidence"
            stroke="#8884d8"
            name="Combined Confidence"
          />
          <Line
            type="monotone"
            dataKey="behavior_confidence"
            stroke="#82ca9d"
            name="Behavior Confidence"
          />
          <Line
            type="monotone"
            dataKey="facial_confidence"
            stroke="#ffc658"
            name="Facial Confidence"
          />
          <Line
            type="monotone"
            dataKey="heatmap_confidence"
            stroke="#ff7300"
            name="Heatmap Confidence"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TestResultsChart;
