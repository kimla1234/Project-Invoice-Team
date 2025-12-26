"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { FileText } from "lucide-react";

export default function HeaderInvoices({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = () => {
      try {
        const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
        setTotalInvoices(Array.isArray(invoices) ? invoices.length : 0);
      } catch (err) {
        console.error("Failed to load invoices from localStorage:", err);
        setTotalInvoices(0);
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
