"use client";

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
import { useEffect, useState } from 'react';
import { InvoiceData } from '@/types/invoice';
import type { QuotationData } from '@/types/quotation';

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

interface DashboardData {
  totalQuotes: number;
  totalInvoices: number;
  totalRevenue: number;
  avgQuoteValue: number;
  conversionRate: number;
  monthlyQuotes: number[];
  monthlyInvoices: number[];
  monthlyRevenue: number[];
  topProducts: Array<{ name: string; totalSold: number; revenue: number }>;
  weeklyRevenue: Array<{ weekLabel: string; amount: number; period: string }>; // Added period for description
  recentActivity: string[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      calculateDashboardData();
    }
  }, []);

  // Helper function to format currency in Indian format
  const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format date ranges - FIXED: Now oldest first
  const getWeekLabel = (daysAgoStart: number, daysAgoEnd: number): string => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);
    
    // FIXED: Set dates in chronological order (oldest to newest)
    startDate.setDate(today.getDate() - daysAgoStart);
    endDate.setDate(today.getDate() - daysAgoEnd);
    
    // Make sure startDate is before endDate
    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }
    
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const calculateDashboardData = () => {
    const quotationsStr = localStorage.getItem("quotations");
    const invoicesStr = localStorage.getItem("invoices");
    
    const quotations: QuotationData[] = quotationsStr ? JSON.parse(quotationsStr) : [];
    const invoices: InvoiceData[] = invoicesStr ? JSON.parse(invoicesStr) : [];

    const totalQuotes = quotations.length;
    const totalInvoices = invoices.length;
    
    const totalQuoteAmount = quotations.reduce((sum, quote) => sum + (quote.amount || 0), 0);
    const avgQuoteValue = totalQuotes > 0 ? totalQuoteAmount / totalQuotes : 0;
    
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
    
    const conversionRate = totalQuotes > 0 ? (totalInvoices / totalQuotes) * 100 : 0;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthQuotes = quotations.filter(quote => {
      try {
        const quoteDate = new Date(quote.issueDate);
        return quoteDate.getMonth() === currentMonth && quoteDate.getFullYear() === currentYear;
      } catch {
        return false;
      }
    }).length;

    const currentMonthInvoices = invoices.filter(invoice => {
      try {
        const invoiceDate = new Date(invoice.issueDate);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
      } catch {
        return false;
      }
    }).length;

    const productSales: Record<string, { totalSold: number; revenue: number }> = {};
    
    invoices.forEach(invoice => {
      if (invoice.items && Array.isArray(invoice.items)) {
        invoice.items.forEach(item => {
          const productName = item.name || `Product ${item.id}`;
          const productRevenue = (item.qty || 0) * (item.unitPrice || 0);
          
          if (!productSales[productName]) {
            productSales[productName] = { totalSold: 0, revenue: 0 };
          }
          productSales[productName].totalSold += (item.qty || 0);
          productSales[productName].revenue += productRevenue;
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ 
        name, 
        totalSold: data.totalSold,
        revenue: data.revenue 
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    const weeklyRevenueData = [
      { 
        weekLabel: getWeekLabel(22, 28), 
        amount: 0,
        period: '3 weeks ago'  // Oldest
      },    
      { 
        weekLabel: getWeekLabel(15, 21), 
        amount: 0,
        period: '2 weeks ago'
      },  
      { 
        weekLabel: getWeekLabel(8, 14), 
        amount: 0,
        period: 'Last week'
      },
      { 
        weekLabel: getWeekLabel(0, 7), 
        amount: 0,
        period: 'This week'    // Most recent
      },
    ];
    
    // Calculate revenue for each week
    invoices.forEach(invoice => {
      if (invoice.totalAmount) {
        try {
          const invoiceDate = new Date(invoice.issueDate);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - invoiceDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 7) weeklyRevenueData[3].amount += invoice.totalAmount;      
          else if (diffDays <= 14) weeklyRevenueData[2].amount += invoice.totalAmount; 
          else if (diffDays <= 21) weeklyRevenueData[1].amount += invoice.totalAmount; 
          else if (diffDays <= 28) weeklyRevenueData[0].amount += invoice.totalAmount; 
        } catch {
          weeklyRevenueData[3].amount += invoice.totalAmount || 0; 
        }
      }
    });

    const recentActivity: string[] = [];
    
    quotations.slice(-2).forEach(quote => {
      recentActivity.push(`Quote #Q-${quote.id} created for ${formatINR(quote.amount || 0)}`);
    });
    
    invoices.slice(-2).forEach(invoice => {
      recentActivity.push(`Invoice ${invoice.invoiceNo || `#${invoice.id}`} generated for ${formatINR(invoice.totalAmount || 0)}`);
    });

    const finalRecentActivity = recentActivity.slice(-4);

    const monthlyQuotes = Array(6).fill(0);
    const monthlyInvoices = Array(6).fill(0);
    const monthlyRevenue = Array(6).fill(0);
    
    for (let i = 0; i < 6; i++) {
      const targetMonth = (currentMonth - i + 12) % 12;
      const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      monthlyQuotes[5 - i] = quotations.filter(quote => {
        try {
          const quoteDate = new Date(quote.issueDate);
          return quoteDate.getMonth() === targetMonth && quoteDate.getFullYear() === targetYear;
        } catch {
          return false;
        }
      }).length;
      
      monthlyInvoices[5 - i] = invoices.filter(invoice => {
        try {
          const invoiceDate = new Date(invoice.issueDate);
          return invoiceDate.getMonth() === targetMonth && invoiceDate.getFullYear() === targetYear;
        } catch {
          return false;
        }
      }).length;

      monthlyRevenue[5 - i] = invoices.reduce((sum, invoice) => {
        try {
          const invoiceDate = new Date(invoice.issueDate);
          if (invoiceDate.getMonth() === targetMonth && invoiceDate.getFullYear() === targetYear) {
            return sum + (invoice.totalAmount || 0);
          }
        } catch {
          // Skip invalid dates
        }
        return sum;
      }, 0);
    }

    const data: DashboardData = {
      totalQuotes,
      totalInvoices,
      totalRevenue,
      avgQuoteValue,
      conversionRate,
      monthlyQuotes,
      monthlyInvoices,
      monthlyRevenue,
      topProducts,
      weeklyRevenue: weeklyRevenueData,
      recentActivity: finalRecentActivity
    };

    setDashboardData(data);
    setLoading(false);
  };

  // Prepare chart data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - (5 - i) + 12) % 12;
    return monthNames[monthIndex];
  });

  const monthlyData = {
    labels: last6Months,
    datasets: [
      {
        label: 'Quotes Created',
        data: dashboardData?.monthlyQuotes || [0, 0, 0, 0, 0, 0],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Invoices Generated',
        data: dashboardData?.monthlyInvoices || [0, 0, 0, 0, 0, 0],
        backgroundColor: '#10b981',
      },
    ],
  };

  const productRevenueData = {
    labels: dashboardData?.topProducts.map(p => p.name) || ['No Data'],
    datasets: [
      {
        label: 'Revenue Generated',
        data: dashboardData?.topProducts.map(p => p.revenue) || [0],
        backgroundColor: [
          '#8b5cf6',
          '#06b6d4',
          '#f59e0b',
          '#ef4444',
        ].slice(0, dashboardData?.topProducts.length || 1),
      },
    ],
  };

  const revenueTrendData = {
    labels: dashboardData?.weeklyRevenue.map(w => w.weekLabel) || ['3 weeks ago', '2 weeks ago', 'Last week', 'This week'],
    datasets: [
      {
        label: 'Revenue Earned',
        data: dashboardData?.weeklyRevenue.map(w => w.amount) || [0, 0, 0, 0],
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

  const stats = [
    { 
      title: 'Total Quotes', 
      value: dashboardData?.totalQuotes.toString() || '0', 
      change: '+0%' 
    },
    { 
      title: 'Total Invoices', 
      value: dashboardData?.totalInvoices.toString() || '0', 
      change: '+0%' 
    },
    { 
      title: 'Total Revenue', 
      value: formatINR(dashboardData?.totalRevenue || 0), 
      change: '+0%',
      highlight: true
    },
    { 
      title: 'Avg. Quote Value', 
      value: formatINR(dashboardData?.avgQuoteValue || 0), 
      change: '+0%' 
    },
    { 
      title: 'Conversion Rate', 
      value: `${(dashboardData?.conversionRate || 0).toFixed(0)}%`, 
      change: '+0%' 
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="inline-flex border w-[120px] justify-center dark:text-white rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 px-2 py-1 text-xl text-slate-600">
          Dashboard
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="inline-flex border w-[120px] justify-center dark:text-white rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 px-2 py-1 text-xl text-slate-600">
        Dashboard
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white dark:bg-gray-800 p-5 rounded-xl border ${
              stat.highlight 
                ? 'border-blue-500 dark:border-blue-500 shadow-md' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm`}
          >
            <h3 className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</h3>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-2xl font-bold ${
                stat.highlight 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-800 dark:text-white'
              }`}>
                {stat.value}
              </p>
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
            Monthly Quotes vs Invoices
          </h3>
          <Bar
            data={monthlyData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>

        {/* Top Products by Revenue */}
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

        {/* FIXED: Weekly Revenue Trend - Now shows chronological order */}
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
                      const period = dashboardData?.weeklyRevenue[weekIndex]?.period || '';
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
          
          {/* Weekly Revenue Summary Table - Now shows chronological order */}
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">
              Weekly Revenue Summary 
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboardData?.weeklyRevenue.map((week, index) => (
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
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Recent Activity
        </h3>
        <ul className="space-y-3">
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
            dashboardData.recentActivity.map((activity, idx) => (
              <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                {activity}
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500">No recent activity</li>
          )}
        </ul>
      </div>
    </div>
  );
}