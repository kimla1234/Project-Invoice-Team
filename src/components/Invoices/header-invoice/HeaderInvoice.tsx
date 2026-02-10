"use client";

import React from "react";
import SummaryCard from "./SummaryCard";
import { FileText } from "lucide-react";
import { useGetMyInvoicesQuery } from "@/redux/service/invoices";

export default function HeaderInvoices() {
  // Fetch only first page to get total count
  const { data, isLoading } = useGetMyInvoicesQuery({ page: 0, size: 1 });
  
  const totalInvoices = data?.totalElements ?? 0;

  return (
    <div className="flex justify-around bg-white">
      {isLoading ? (
        <SummaryCardSkeleton />
      ) : (
        <SummaryCard
          title="Total Invoices"
          count={totalInvoices}
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