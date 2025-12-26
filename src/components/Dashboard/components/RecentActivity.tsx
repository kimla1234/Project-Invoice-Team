import { DashboardData } from '../components/DashboardCalculation';

interface RecentActivityProps {
  data: DashboardData | null;
}

export default function RecentActivity({ data }: RecentActivityProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Recent Activity
      </h3>
      <ul className="space-y-3">
        {data?.recentActivity && data.recentActivity.length > 0 ? (
          data.recentActivity.map((activity, idx) => (
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
  );
}