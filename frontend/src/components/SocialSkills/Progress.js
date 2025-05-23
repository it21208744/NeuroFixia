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
  Label,
} from "recharts";

const questionLabels = {
  q1: 1,
  q2: 2,
  q3: 3,
  q4: 4,
  q5: 5,
  q6: 6,
  q7: 7,
  q8: 8,
  q9: 9,
  q10: 10,
};

function Progress() {
  const [data, setData] = useState([]);
  const [topThree, setTopThree] = useState([]);
  const [riskDetected, setRiskDetected] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8070/Sroute/")
      .then((res) => {
        const latest = res.data[res.data.length - 1]; // Get most recent entry
        setRiskDetected(latest.risk_prediction === "Risk Detected");
        setTopThree(latest.top_3_features || []);

        const chartData = res.data.map((entry) => {
          const date = new Date(entry.date).toLocaleDateString();
          const point = {
            date,
            qLabel: [],
            ...Object.fromEntries(Object.entries(entry).filter(([key]) => key.startsWith("q"))),
          };

          (entry.top_3_features || []).forEach((f) => {
            point.qLabel.push(questionLabels[f.feature]);
          });

          return point;
        });

        setData(chartData);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-3">Risk Analysis</h2>
      <p
        className={`text-lg font-semibold mb-4 ${riskDetected ? "text-red-600" : "text-green-600"}`}
      >
        {riskDetected ? "⚠️ Risk Detected" : "✅ No Risk Detected"}
      </p>

      {riskDetected && topThree.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Top three critical areas to improve:</h3>
          <ul className="list-disc list-inside">
            {topThree.map((item, index) => (
              <li key={index}>
                <span className="font-medium text-gray-800">{item.feature.toUpperCase()}</span>:{" "}
                {item.score_percent}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {riskDetected && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Visual Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="date">
                <Label value="Date" offset={0} position="insideBottom" />
              </XAxis>
              <YAxis
                type="number"
                domain={[1, 10]}
                allowDecimals={false}
                label={{ value: "Question Number", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="qLabel[0]"
                stroke="#ff7300"
                name="Top Feature 1"
                connectNulls
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="qLabel[1]"
                stroke="#387908"
                name="Top Feature 2"
                connectNulls
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="qLabel[2]"
                stroke="#8884d8"
                name="Top Feature 3"
                connectNulls
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Progress;
