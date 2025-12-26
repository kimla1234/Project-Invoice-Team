"use client";

import { useEffect, useState, useRef } from "react";
import { QuotationData } from "@/types/quotation";
import html2pdf from "html2pdf.js";
import { mockClients } from "@/components/Tables/clients";
import Link from "next/link";
import { FiSkipBack } from "react-icons/fi";

interface ViewQuotationProps {
  id: number;
}

export default function ViewQuotation({ id }: ViewQuotationProps) {
  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const quotationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("quotations") || "[]");
    if (Array.isArray(stored)) {
      const found = stored.find((q: QuotationData) => q.id === id);
      setQuotation(found || null);
    }
  }, [id]);

  const handleDownload = () => {
    if (quotationRef.current) {
      html2pdf().from(quotationRef.current).save(`quotation-${id}.pdf`);
    }
  };

  if (!quotation) return <p className="p-4">Quotation not found.</p>;

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header */}
      <div className="flex w-full max-w-2xl items-center justify-between gap-4 py-2">
        <h3 className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-primary dark:border-dark-3 dark:bg-gray-800 dark:hover:text-blue-400">
          View Quotation
        </h3>

        <Link
          href="/quotation"
          className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-primary transition hover:border-red-400 hover:text-red-400 dark:border-dark-3 dark:bg-gray-800 dark:hover:text-blue-400"
        >
          <FiSkipBack className="mr-2 h-5 w-5" />
          Back to Products
        </Link>
      </div>

      {/* Quotation content */}
      <div
        ref={quotationRef}
        className="w-full max-w-2xl rounded-md border border-gray-200 bg-white p-6 shadow-md dark:border-dark-3 dark:bg-gray-dark"
      >
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Quotation
        </h2>

        <div className="mb-4 space-y-1 text-sm">
          <p>
            <strong>Client:</strong>{" "}
            {mockClients.find((c) => c.id === quotation.clientId)?.name ||
              "Unknown Client"}
          </p>
          <p>
            <strong>Quotation No:</strong> QUO-
            {String(quotation.id).padStart(4, "0")}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(quotation.issueDate).toLocaleDateString("en-GB")}
          </p>
        </div>

        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">No</th>
              <th className="border p-2">Product Name</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Unit Price</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items && quotation.items.length > 0 ? (
              quotation.items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 text-center">{item.name}</td>
                  <td className="border p-2 text-center">{item.qty}</td>
                  <td className="border p-2 text-center">
                    ${Number(item.unitPrice ?? 0).toFixed(2)}
                  </td>
                  <td className="border p-2 text-center">
                    ${Number(item.total ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-dark-3 dark:bg-gray-dark">
            <div className="mb-2 flex justify-between">
              <span className="font-medium text-gray-700 dark:text-white">
                Subtotal:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${Number(quotation.amount ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 dark:border-dark-2">
              <span className="font-medium text-gray-700 dark:text-white">
                Grand Total:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                ${Number(quotation.amount ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Download as PDF
      </button>
    </div>
  );
}
