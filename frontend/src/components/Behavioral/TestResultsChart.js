import React from "react";
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

const dummyData = [
  {
    testDate: "2025-05-01",
    combined_confidence: 0.799,
    behavior_confidence: 0.998,
    facial_confidence: 0.813,
    heatmap_confidence: 1.3e-9,
    final_prediction: "autism",
  },
  {
    testDate: "2025-05-10",
    combined_confidence: 0.651,
    behavior_confidence: 0.912,
    facial_confidence: 0.702,
    heatmap_confidence: 3.5e-8,
    final_prediction: "non-autism",
  },
  {
    testDate: "2025-05-20",
    combined_confidence: 0.887,
    behavior_confidence: 0.991,
    facial_confidence: 0.845,
    heatmap_confidence: 2.9e-9,
    final_prediction: "autism",
  },
];

const TestResultsChart = () => {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={dummyData}>
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
