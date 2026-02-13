"use client";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
//import { DashboardData } from '../DashboardCalculation';
import { getLast6Months } from '../formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

interface MonthlyChartProps {
  data: "" | null;
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const monthlyData = {
    labels: getLast6Months(),
    datasets: [
      {
        label: 'Quotes Created',
       // data: data?.monthlyQuotes || [0, 0, 0, 0, 0, 0],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Invoices Generated',
       // data: data?.monthlyInvoices || [0, 0, 0, 0, 0, 0],
        backgroundColor: '#10b981',
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Monthly Quotes vs Invoices
      </h3>
      
    </div>
  );
}