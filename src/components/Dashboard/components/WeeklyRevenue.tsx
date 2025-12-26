"use client";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DashboardData } from '../components/DashboardCalculation';
import { formatINR } from '../components/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

interface WeeklyRevenueChartProps {
  data: DashboardData | null;
}

export default function WeeklyRevenueChart({ data }: WeeklyRevenueChartProps) {
  const revenueTrendData = {
    labels: data?.weeklyRevenue.map(w => w.weekLabel) || ['3 weeks ago', '2 weeks ago', 'Last week', 'This week'],
    datasets: [
      {
        label: 'Revenue Earned',
        data: data?.weeklyRevenue.map(w => w.amount) || [0, 0, 0, 0],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Weekly Revenue Trend (Oldest → Newest)
        </h3>
        <div className="text-sm text-gray-500">
          Showing last 4 weeks
        </div>
      </div>
      <Line
        data={revenueTrendData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Earned: ${formatINR(context.raw as number)}`;
                },
                title: function(context) {
                  const weekLabel = context[0].label;
                  const weekIndex = context[0].dataIndex;
                  const period = data?.weeklyRevenue[weekIndex]?.period || '';
                  return `${period} (${weekLabel})`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Week Period (dd/mm) →',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              },
              ticks: {
                callback: function(value) {
                  return formatINR(Number(value));
                }
              }
            }
          }
        }}
      />
      
      {/* Weekly Revenue Summary Table */}
      <div className="mt-6">
        <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Weekly Revenue Summary 
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data?.weeklyRevenue.map((week, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                week.amount > 0 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {week.weekLabel}
              </div>
              <div className={`text-lg font-bold ${
                week.amount > 0 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {formatINR(week.amount)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {week.period}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}