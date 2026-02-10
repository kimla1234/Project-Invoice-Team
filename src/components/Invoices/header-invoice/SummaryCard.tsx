"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // if you have a utility for merging Tailwind classes

interface SummaryCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
}

export default function SummaryCard({
  title,
  count,
  icon: Icon,
  iconBgColor = "bg-blue-100",
  iconTextColor = "text-blue-600",
}: SummaryCardProps) {
  return (
    <div className="flex items-center rounded-lg gap-4 bg-slate-50 p-2 w-full">
      {/* Icon Circle */}
      <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", iconBgColor)}>
        <Icon className={cn("h-6 w-6", iconTextColor)} />
      </div>

      {/* Text Content */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-800">{count}</p>
      </div>
    </div>
  );
}
