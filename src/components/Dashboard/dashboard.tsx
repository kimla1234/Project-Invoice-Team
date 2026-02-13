"use client";

import React, { useMemo } from "react";
import { useGetMyInvoicesQuery } from "@/redux/service/invoices";
import { useGetQuotationsQuery } from "@/redux/service/quotation";
import { useGetMyClientsQuery } from "@/redux/service/client";
import { useGetMyProductsQuery } from "@/redux/service/products";
import {
  FileText,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Import separated components
import { StatCard } from "./components/StatCard";
import { StatusCard } from "./components/StatusCard";
import { QuickActionButton } from "./components/QuickActionButton";
import { MonthlyRevenueChart } from "./components/MonthlyRevenueChart";
import { TopProductsChart } from "./components/TopProductsChart";
import { RecentInvoices } from "./components/RecentInvoices";
import { RecentQuotations } from "./components/RecentQuotations";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface MonthlyData {
  month: string;
  revenue: number;
  count: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

export default function Dashboard() {
  // Fetch data
  const { data: invoicesData, isLoading: loadingInvoices } =
    useGetMyInvoicesQuery({
      page: 0,
      size: 100,
    });
  const { data: quotationsData, isLoading: loadingQuotations } =
    useGetQuotationsQuery({
      page: 0,
      size: 100,
    });
  const { data: clients = [], isLoading: loadingClients } =
    useGetMyClientsQuery();
  const { data: products = [], isLoading: loadingProducts } =
    useGetMyProductsQuery();

  const invoices = invoicesData?.content || [];
  const quotations = quotationsData?.content || [];

  // Calculate statistics using useMemo
  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === "pending",
    ).length;
    const paidInvoices = invoices.filter((inv) => inv.status === "paid").length;
    const overdueInvoices = invoices.filter((inv) => {
      const expireDate = new Date(inv.expireDate);
      return inv.status === "pending" && expireDate < new Date();
    }).length;

    return {
      totalRevenue,
      pendingInvoices,
      paidInvoices,
      overdueInvoices,
      totalQuotations: quotations.length,
      totalClients: clients.length,
      totalProducts: products.length,
      lowStockProducts: products.filter((p) => p.status === "LOW_STOCK").length,
    };
  }, [invoices, quotations, clients, products]);

  // Recent invoices
  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [invoices]);

  // Recent quotations
  const recentQuotations = useMemo(() => {
    return [...quotations]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [quotations]);

  // Monthly revenue data
  const monthlyData = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();
    const last6Months: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthInvoices = invoices.filter((inv) => {
        const invMonth = new Date(inv.createdAt).getMonth();
        return invMonth === monthIndex;
      });

      const revenue = monthInvoices.reduce(
        (sum, inv) => sum + inv.grandTotal,
        0,
      );
      const count = monthInvoices.length;

      last6Months.push({
        month: monthNames[monthIndex],
        revenue,
        count,
      });
    }

    return last6Months;
  }, [invoices]);

  // Top products
  const topProducts = useMemo(() => {
    const productRevenue: {
      [key: string]: { name: string; revenue: number; quantity: number };
    } = {};

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const key = item.productId.toString();
        if (!productRevenue[key]) {
          productRevenue[key] = {
            name: item.name || `Product ${item.productId}`,
            revenue: 0,
            quantity: 0,
          };
        }
        productRevenue[key].revenue += item.subtotal;
        productRevenue[key].quantity += item.quantity;
      });
    });

    return Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [invoices]);

  // Loading state
  if (
    loadingInvoices ||
    loadingQuotations ||
    loadingClients ||
    loadingProducts
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          <div className="text-lg text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Dashboard
            </h1>
            {/* Hidden on mobile to save space, visible on tablet+ */}
            <p className="mt-1 hidden text-sm text-gray-500 md:block">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="xs:flex-row flex flex-col gap-2 sm:gap-3">
            <Link
              href="/invoices/create"
              className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-95"
            >
              New Invoice
            </Link>
            <Link
              href="/quotation/create"
              className="flex items-center justify-center rounded-lg border border-purple-600 px-4 py-2.5 text-sm font-semibold text-purple-600 transition-all hover:bg-purple-50 active:scale-95"
            >
              New Quotation
            </Link>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionButton
              href="/invoices/create"
              icon={<FileText className="h-5 w-5" />}
              label="Create Invoice"
              color="bg-blue-50 text-blue-600 hover:bg-blue-100"
            />
            <QuickActionButton
              href="/quotation/create"
              icon={<TrendingUp className="h-5 w-5" />}
              label="Create Quotation"
              color="bg-green-50 text-green-600 hover:bg-green-100"
            />
            <QuickActionButton
              href="/clients/create"
              icon={<Users className="h-5 w-5" />}
              label="Add Client"
              color="bg-purple-50 text-purple-600 hover:bg-purple-100"
            />
            <QuickActionButton
              href="/products/create"
              icon={<Package className="h-5 w-5" />}
              label="Add Product"
              color="bg-orange-50 text-orange-600 hover:bg-orange-100"
            />
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6" />}
            // trend={{ value: "+12.5%", isPositive: true }}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Invoices"
            value={invoices.length.toString()}
            icon={<FileText className="h-6 w-6" />}
            subtitle={`${stats.paidInvoices} paid, ${stats.pendingInvoices} pending`}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Total Clients"
            value={stats.totalClients.toString()}
            icon={<Users className="h-6 w-6" />}
            // trend={{ value: "+8.2%", isPositive: true }}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Products"
            value={stats.totalProducts.toString()}
            icon={<Package className="h-6 w-6" />}
            subtitle={
              stats.lowStockProducts > 0
                ? `${stats.lowStockProducts} low stock`
                : "All in stock"
            }
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>

        {/* Invoice Status Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          <StatusCard
            title="Paid Invoices"
            count={stats.paidInvoices}
            icon={<CheckCircle className="h-5 w-5" />}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatusCard
            title="Pending Invoices"
            count={stats.pendingInvoices}
            icon={<Clock className="h-5 w-5" />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatusCard
            title="Overdue Invoices"
            count={stats.overdueInvoices}
            icon={<AlertCircle className="h-5 w-5" />}
            color="text-red-600"
            bgColor="bg-red-50"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Revenue Chart */}
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Monthly Revenue (Last 6 Months)
            </h2>
            <div className="h-64">
              <MonthlyRevenueChart data={monthlyData} />
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Top Products by Revenue
            </h2>
            <div className="h-64">
              <TopProductsChart data={topProducts} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentInvoices invoices={recentInvoices} />
          <RecentQuotations quotations={recentQuotations} />
        </div>
      </div>
    </div>
  );
}
