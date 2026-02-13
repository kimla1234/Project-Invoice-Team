"use client";

import { useEffect, useState } from 'react';
//import { calculateDashboardData } from '../Dashboard/components/DashboardCalculation';

import MonthlyChart from '../Dashboard/components/charts/MonthlyChart';
//import ProductsChart from '../Dashboard/components/charts/ProductsChart';
import WeeklyRevenueChart from '../Dashboard/components/WeeklyRevenue';
//import RecentActivity from '../Dashboard/components/RecentActivity';

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
    weeklyRevenue: Array<{ weekLabel: string; amount: number; period: string }>;
    recentActivity: string[];
  }

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
     // const data = calculateDashboardData();
     // setDashboardData(data);
      setLoading(false);
    }
  }, []);

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


      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
       

      </div>

      
    </div>
  );
}