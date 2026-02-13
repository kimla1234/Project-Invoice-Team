"use client";

import React from "react";
import SummaryCard from "./SummaryCard";
import { FileText } from "lucide-react";
import { useGetQuotationsQuery } from "@/redux/service/quotation";

export default function HeaderQuotations() {
  const { data: quotationData, isLoading } = useGetQuotationsQuery({ page: 0, size: 100 });
  
  const totalQuotations = quotationData?.content?.length || 0;

  return (
    <div className="flex justify-around bg-white">
      {isLoading ? (
        <SummaryCardSkeleton />
      ) : (
        <SummaryCard
          title="Total Quotations"
          count={totalQuotations}
          icon={FileText}
          iconBgColor="bg-blue-100"
          iconTextColor="text-blue-600"
        />
      )}
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="flex w-[220px] items-center gap-4 rounded-lg border bg-white p-4 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-6 w-16 rounded bg-gray-300" />
      </div>
    </div>
  );
}
