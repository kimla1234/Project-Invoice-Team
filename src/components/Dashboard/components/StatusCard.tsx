import { formatINR } from '../components/formatters';
import { DashboardData } from '../components/DashboardCalculation';

interface StatsCardsProps {
  data: DashboardData | null;
}

export default function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    { 
      title: 'Total Quotes', 
      value: data?.totalQuotes.toString() || '0', 
      change: '+0%' 
    },
    { 
      title: 'Total Invoices', 
      value: data?.totalInvoices.toString() || '0', 
      change: '+0%' 
    },
    { 
      title: 'Total Revenue', 
      value: formatINR(data?.totalRevenue || 0), 
      change: '+0%',
      highlight: true
    },
    { 
      title: 'Avg. Quote Value', 
      value: formatINR(data?.avgQuoteValue || 0), 
      change: '+0%' 
    },
    { 
      title: 'Conversion Rate', 
      value: `${(data?.conversionRate || 0).toFixed(0)}%`, 
      change: '+0%' 
    },
  ];

  return (
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
  );
}