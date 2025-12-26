"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { FileText } from "lucide-react";

export default function HeaderClients({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [totalQuotations, setTotalQuotations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = () => {
      try {
        const quotations = JSON.parse(localStorage.getItem("quotations") || "[]");
        setTotalQuotations(quotations.length);
      } catch (err) {
        console.error("Failed to load quotations from localStorage:", err);
        setTotalQuotations(0);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [refreshKey]);

  return (
    <div className="flex justify-around bg-white">
      {loading ? (
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
