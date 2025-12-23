"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";

import { FileText, Wrench, ShoppingBag } from "lucide-react";
import { fetchProductSummary } from "@/components/Tables/fetch";

export default function HeaderProducts({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalProducts: 0,
    totalServices: 0,
  });
  const [loading, setLoading] = useState(true);



  useEffect(() => {
  const loadSummary = async () => {
    try {
      const data = await fetchProductSummary();
      setSummary(data);
    } finally {
      setLoading(false);
    }
  };

  loadSummary();
}, [refreshKey]); // 👈 KEY LINE



  return (
    <div className="flex justify-around bg-white">
      {loading ? (
        <>
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </>
      ) : (
        <>
          <SummaryCard
            title="Total Items"
            count={summary.totalItems}
            icon={FileText}
            iconBgColor="bg-blue-100"
            iconTextColor="text-blue-600"
          />

          <SummaryCard
            title="Total Services"
            count={summary.totalServices}
            icon={Wrench}
            iconBgColor="bg-green-100"
            iconTextColor="text-green-500"
          />

          <SummaryCard
            title="Total Products"
            count={summary.totalProducts}
            icon={ShoppingBag}
            iconBgColor="bg-gray-200"
            iconTextColor="text-gray-600"
          />
        </>
      )}
    </div>
  );
}


 function SummaryCardSkeleton() {
  return (
    <div className="flex w-[220px] items-center gap-4 rounded-lg border bg-white p-4 animate-pulse">
      {/* Icon skeleton */}
      <div className="h-12 w-12 rounded-full bg-gray-200" />

      {/* Text skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-6 w-16 rounded bg-gray-300" />
      </div>
    </div>
  );
}