import React from "react";
import { Bar } from "react-chartjs-2";

interface MonthlyData {
  month: string;
  revenue: number;
  count: number;
}

interface MonthlyRevenueChartProps {
  data: MonthlyData[];
}

export const MonthlyRevenueChart = React.memo(({ data }: MonthlyRevenueChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Revenue",
        data: data.map((d) => d.revenue),
        backgroundColor: "rgba(147, 51, 234, 0.8)", // purple-600
        borderColor: "rgba(147, 51, 234, 1)",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(147, 51, 234, 1)",
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: any) {
            return `Revenue: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "$" + (value / 1000).toFixed(0) + "k";
          },
          font: {
            size: 12,
          },
          color: "#6b7280", // gray-500
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
          color: "#6b7280", // gray-500
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
});

MonthlyRevenueChart.displayName = "MonthlyRevenueChart";
