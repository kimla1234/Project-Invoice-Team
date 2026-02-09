"use client";

import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";

import { FileText, Wrench, ShoppingBag } from "lucide-react";
import { useGetMyProductsQuery } from "@/redux/service/products";
import { useMemo } from "react";

export default function HeaderProducts({ refreshKey }: { refreshKey: number }) {
  const { data: products = [], isLoading } = useGetMyProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  // ✅ គណនា summary ពី products
  const summary = useMemo(() => {
    let totalItems = products.length;
    let outOfStock = 0;
    let lowStock = 0;

    products.forEach((p) => {
      if (p.status === "OUT_STOCK") outOfStock++;
      else if (p.status === "LOW_STOCK") lowStock++;
    });

    return {
      totalItems,
      totalProducts: totalItems,
      outOfStock,
      lowStock,
    };
  }, [products, refreshKey]);

  const inStock = Math.max(
    summary.totalItems - summary.outOfStock - summary.lowStock,
    0
  );

  return (
    <div className="flex justify-around bg-white">
      {isLoading ? (
        <>
          <SummaryCardSkeleton />
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
            title="In Stock"
            count={inStock}
            icon={ShoppingBag}
            iconBgColor="bg-green-100"
            iconTextColor="text-green-600"
          />

          <SummaryCard
            title="Out of Stock"
            count={summary.outOfStock}
            icon={ShoppingBag}
            iconBgColor="bg-red-100"
            iconTextColor="text-red-600"
          />

          <SummaryCard
            title="Low Stock"
            count={summary.lowStock}
            icon={Wrench}
            iconBgColor="bg-yellow-100"
            iconTextColor="text-yellow-600"
          />
        </>
      )}
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="flex w-[220px] animate-pulse items-center gap-4 rounded-lg border bg-white p-4">
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
