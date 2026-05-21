// src/components/charts/BarChart.tsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

type DataItem = Record<string, any>;

interface BarChartProps {
  data: DataItem[];
}

export const BarChartComponent: React.FC<BarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500">No data to display.</p>;
  }
  const keys = Object.keys(data[0]);
  const xKey = keys[0];
  const barKey = keys.find((k) => typeof data[0][k] === "number") || keys[1];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={barKey} fill="#34D399" />
      </BarChart>
    </ResponsiveContainer>
  );
};
