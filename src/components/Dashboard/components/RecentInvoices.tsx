import React from "react";
import Link from "next/link";

interface Invoice {
  id: number;
  invoiceNo: string;
  issueDate: string;
  grandTotal: number;
  status: string;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
        <Link href="/invoices" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{invoice.invoiceNo}</p>
                <p className="text-sm text-gray-500">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${invoice.grandTotal.toFixed(2)}
                </p>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    invoice.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : invoice.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-gray-500">No invoices yet</p>
        )}
      </div>
    </div>
  );
}
