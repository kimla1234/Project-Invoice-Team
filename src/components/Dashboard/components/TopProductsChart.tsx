import React from "react";
import { Bar } from "react-chartjs-2";

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
}

export const TopProductsChart = React.memo(({ data }: TopProductsChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No product data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((p) => p.name),
    datasets: [
      {
        label: "Revenue",
        data: data.map((p) => p.revenue),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",   // blue-500
          "rgba(147, 51, 234, 0.8)",   // purple-600
          "rgba(236, 72, 153, 0.8)",   // pink-500
          "rgba(34, 197, 94, 0.8)",    // green-500
          "rgba(251, 146, 60, 0.8)",   // orange-400
        ],
        // borderColor: [
        //   "rgba(59, 130, 246, 1)",
        //   "rgba(147, 51, 234, 1)",
        //   "rgba(236, 72, 153, 1)",
        //   "rgba(34, 197, 94, 1)",
        //   "rgba(251, 146, 60, 1)",
        // ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options: any = {
    indexAxis: "y" as const,
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
        callbacks: {
          label: function (context: any) {
            const product = data[context.dataIndex];
            return [
              `Revenue: $${context.parsed.x.toLocaleString()}`,
              `Quantity: ${product.quantity} sold`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
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
      y: {
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

TopProductsChart.displayName = "TopProductsChart";
