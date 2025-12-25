import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have this utility function for Tailwind merging

interface SummaryCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, count, icon: Icon, iconBgColor, iconTextColor }) => {
  return (
    <div className="flex items-center rounded-lg gap-4  bg-slate-50 p-2 w-full">
      {/* Icon Circle */}
      <div className={cn("flex size-14 items-center justify-center rounded-full", iconBgColor)}>
        <Icon className={cn("size-6", iconTextColor)} />
      </div>
      
      {/* Text Content */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-800">{count}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
