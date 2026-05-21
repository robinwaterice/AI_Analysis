// src/components/charts/PieChart.tsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type DataItem = Record<string, any>;

interface PieChartProps {
  data: DataItem[];
}

const COLORS = ["#6366F1", "#34D399", "#F59E0B", "#EF4444", "#10B981", "#3B82F6"];

export const PieChartComponent: React.FC<PieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500">No data to display.</p>;
  }
  // Use first numeric field as value, first field as name
  const keys = Object.keys(data[0]);
  const nameKey = keys[0];
  const valueKey = keys.find((k) => typeof data[0][k] === "number") || keys[1];
  const chartData = data.map((item) => ({ name: item[nameKey], value: Number(item[valueKey]) }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};
