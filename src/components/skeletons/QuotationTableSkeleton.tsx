"use client";

import { MoreHorizontal, SearchX } from "lucide-react";

export default function QuotationTableSkeleton() {
  const skeletonRows = 7; // Number of skeleton rows to show

  return (
    <div className="rounded-[10px] border bg-white dark:border-dark-3 dark:bg-gray-dark">
      <table className="w-full text-sm">
        <thead className="border-b bg-[#F7F9FC] dark:bg-dark-2">
          <tr>
            <th className="xl:pl-7.5 text-left py-3">Quotation No.</th>
            <th className="text-left py-3">Client</th>
            <th className="text-left py-3">Amount</th>
            <th className="text-left py-3">Issue Date</th>
            <th className="text-right xl:pr-7.5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: skeletonRows }).map((_, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-6 py-4">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="h-4 w-4 bg-gray-200 rounded ml-auto animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-6 py-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-1">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* No data fallback */}
      <div className="hidden text-center py-6 text-gray-500">
        <SearchX className="mx-auto size-8 text-gray-400" />
        <p className="mt-2 text-lg font-semibold">No quotations found</p>
        <p className="text-sm">You haven&apos;t created any quotations yet.</p>
      </div>
    </div>
  );
}
