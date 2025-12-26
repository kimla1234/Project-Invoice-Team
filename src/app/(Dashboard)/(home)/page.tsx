"use client"; // ← ADD THIS LINE

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

export default function Home() {
  // Sample data for receipts/quotes
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Quotes Created',
        data: [12, 19, 8, 15, 22, 18],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Receipts Generated',
        data: [8, 15, 5, 12, 18, 14],
        backgroundColor: '#10b981',
      },
    ],
  };

  const productSalesData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    datasets: [
      {
        label: 'Units Sold',
        data: [35, 28, 42, 19],
        backgroundColor: [
          '#8b5cf6',
          '#06b6d4',
          '#f59e0b',
          '#ef4444',
        ],
      },
    ],
  };

  const revenueTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [45000, 52000, 48000, 61000],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const stats = [
    { title: 'Total Quotes', value: '142', change: '+12%' },
    { title: 'Total Receipts', value: '98', change: '+8%' },
    { title: 'Avg. Quote Value', value: '₹2,850', change: '+5%' },
    { title: 'Conversion Rate', value: '69%', change: '+3%' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="inline-flex border w-[120px] justify-center dark:text-white rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 px-2 py-1 text-xl text-slate-600">
        Dashboard
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <h3 className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Monthly Quotes vs Receipts
          </h3>
          <Bar
            data={monthlyData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
              },
            }}
          />
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Top Selling Products
          </h3>
          <div className="h-64">
            <Doughnut
              data={productSalesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
            />
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Monthly Revenue Trend
          </h3>
          <Line
            data={revenueTrendData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Recent Activity
        </h3>
        <ul className="space-y-3">
          {[
            'Quote #Q-1024 created for ₹8,500',
            'Receipt #R-895 generated from Quote #Q-1020',
            'Product "Premium Service" added to catalog',
            'Quote #Q-1023 converted to receipt',
          ].map((activity, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              {activity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}