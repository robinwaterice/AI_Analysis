// src/components/charts/LineChart.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DataItem = Record<string, any>;

interface LineChartProps {
  data: DataItem[];
}

export const LineChartComponent: React.FC<LineChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500">No data to display.</p>;
  }
  // Assume first numeric column as value, first column as X axis
  const keys = Object.keys(data[0]);
  const xKey = keys[0];
  const yKey = keys.find((k) => typeof data[0][k] === "number") || keys[1];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={yKey} stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
