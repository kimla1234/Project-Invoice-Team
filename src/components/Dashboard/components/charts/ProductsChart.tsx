"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { DashboardData } from '../DashboardCalculation';
import { formatINR } from '../formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProductsChartProps {
  data: DashboardData | null;
}

export default function ProductsChart({ data }: ProductsChartProps) {
  const productRevenueData = {
    labels: data?.topProducts.map(p => p.name) || ['No Data'],
    datasets: [
      {
        label: 'Revenue Generated',
        data: data?.topProducts.map(p => p.revenue) || [0],
        backgroundColor: [
          '#8b5cf6',
          '#06b6d4',
          '#f59e0b',
          '#ef4444',
        ].slice(0, data?.topProducts.length || 1),
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Top Products by Revenue
      </h3>
      <div className="h-64">
        <Doughnut
          data={productRevenueData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Revenue: ${formatINR(context.raw as number)}`;
                  }
                }
              }
            },
          }}
        />
      </div>
    </div>
  );
}