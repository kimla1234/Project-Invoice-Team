import React from "react";
import Link from "next/link";

interface Quotation {
  id: number;
  quotationNo: string;
  issueDate?: string;
  expiryDate?: string;
  amount?: number;
  totalAmount?: number;
}

interface RecentQuotationsProps {
  quotations: Quotation[];
}

export function RecentQuotations({ quotations }: RecentQuotationsProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Quotations</h2>
        <Link href="/quotation" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {quotations.length > 0 ? (
          quotations.map((quotation) => (
            <div
              key={quotation.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{quotation.quotationNo}</p>
                <p className="text-sm text-gray-500">
                  {quotation.issueDate
                    ? new Date(quotation.issueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${(quotation.amount || quotation.totalAmount || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Expires:{" "}
                  {quotation.expiryDate
                    ? new Date(quotation.expiryDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-gray-500">No quotations yet</p>
        )}
      </div>
    </div>
  );
}
