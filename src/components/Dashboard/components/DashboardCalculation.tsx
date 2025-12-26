// src/app/(Dashboard)/dashboard/components/utils/dashboardCalculations.ts
import { InvoiceData } from '@/types/invoice';
import type { QuotationData } from '@/types/quotation';
import { getWeekLabel } from './formatters';

export interface DashboardData {
  totalQuotes: number;
  totalInvoices: number;
  totalRevenue: number;
  avgQuoteValue: number;
  conversionRate: number;
  monthlyQuotes: number[];
  monthlyInvoices: number[];
  monthlyRevenue: number[];
  topProducts: Array<{ name: string; totalSold: number; revenue: number }>;
  weeklyRevenue: Array<{ weekLabel: string; amount: number; period: string }>; // Make sure this includes period
  recentActivity: string[];
}

export const calculateDashboardData = (): DashboardData => {
  const quotationsStr = localStorage.getItem("quotations") || '[]';
  const invoicesStr = localStorage.getItem("invoices") || '[]';
  
  const quotations: QuotationData[] = JSON.parse(quotationsStr);
  const invoices: InvoiceData[] = JSON.parse(invoicesStr);

  const totalQuotes = quotations.length;
  const totalInvoices = invoices.length;
  
  const totalQuoteAmount = quotations.reduce((sum, quote) => sum + (quote.amount || 0), 0);
  const avgQuoteValue = totalQuotes > 0 ? totalQuoteAmount / totalQuotes : 0;
  
  const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
  
  const conversionRate = totalQuotes > 0 ? (totalInvoices / totalQuotes) * 100 : 0;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate product sales
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

  // Calculate weekly revenue WITH period property
  const weeklyRevenueData = [
    { weekLabel: getWeekLabel(22, 28), amount: 0, period: '3 weeks ago' },
    { weekLabel: getWeekLabel(15, 21), amount: 0, period: '2 weeks ago' },
    { weekLabel: getWeekLabel(8, 14), amount: 0, period: 'Last week' },
    { weekLabel: getWeekLabel(0, 7), amount: 0, period: 'This week' },
  ];
  
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

  // Calculate recent activity with proper formatting
  const recentActivity: string[] = [];
  
  quotations.slice(-2).forEach(quote => {
    recentActivity.push(`Quote #Q-${quote.id} created for ₹${quote.amount || 0}`);
  });
  
  invoices.slice(-2).forEach(invoice => {
    recentActivity.push(`Invoice ${invoice.invoiceNo || `#${invoice.id}`} generated for ₹${invoice.totalAmount || 0}`);
  });

  // Calculate monthly data
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

  return {
    totalQuotes,
    totalInvoices,
    totalRevenue,
    avgQuoteValue,
    conversionRate,
    monthlyQuotes,
    monthlyInvoices,
    monthlyRevenue,
    topProducts,
    weeklyRevenue: weeklyRevenueData, // Now includes period property
    recentActivity: recentActivity.slice(-4)
  };
};