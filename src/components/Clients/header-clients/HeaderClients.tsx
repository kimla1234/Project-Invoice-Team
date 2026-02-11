"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { useGetMyClientsQuery } from "@/redux/service/client";
import { FileText, Wrench, ShoppingBag } from "lucide-react";


export default function HeaderClients({ refreshKey = 0 }: { refreshKey?: number }) {
  const { data: clients = [], isLoading } = useGetMyClientsQuery();
  const totalClients = clients.length;
  

  return (
    <div className="bg-white">
      {isLoading ? (
        <>
          <SummaryCardSkeleton />
         
        </>
      ) : (
        <>
          <SummaryCard
            title="Total Clients"
            count={totalClients}
            icon={FileText}
            iconBgColor="bg-blue-100"
            iconTextColor="text-blue-600"
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