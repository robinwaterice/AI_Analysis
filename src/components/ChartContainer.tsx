// src/components/ChartContainer.tsx
import React, { useState } from "react";
import { LineChartComponent } from "./charts/LineChart";
import { BarChartComponent } from "./charts/BarChart";
import { PieChartComponent } from "./charts/PieChart";
import { parseCsvToData } from "../utils/chartData";

type ChartType = "line" | "bar" | "pie";

interface ChartContainerProps {
  csvText: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ csvText }) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const data = parseCsvToData(csvText);

  return (
    <div className="mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
      {/* Tab selector */}
      <div className="flex gap-2 mb-4">
        {(["line", "bar", "pie"] as ChartType[]).map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded-md transition-colors ${
              chartType === type
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setChartType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      {/* Chart rendering */}
      <div className="w-full h-64">
        {chartType === "line" && <LineChartComponent data={data} />}
        {chartType === "bar" && <BarChartComponent data={data} />}
        {chartType === "pie" && <PieChartComponent data={data} />}
      </div>
    </div>
  );
};
