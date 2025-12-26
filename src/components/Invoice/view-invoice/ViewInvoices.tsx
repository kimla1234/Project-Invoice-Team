"use client";

import { useEffect, useState, useRef } from "react";
import { InvoiceData } from "@/types/invoice";
import html2pdf from "html2pdf.js";
import { mockClients } from "@/components/Tables/clients";
import Link from "next/link";
import { FiSkipBack } from "react-icons/fi";

interface ViewInvoiceProps {
  id: number;
}

export default function ViewInvoice({ id }: ViewInvoiceProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("invoices") || "[]");
    if (Array.isArray(stored)) {
      const found = stored.find((i: InvoiceData) => i.id === id);
      setInvoice(found || null);
    }
  }, [id]);

  const handleDownload = () => {
    if (invoiceRef.current) {
      html2pdf().from(invoiceRef.current).save(`invoice-${id}.pdf`);
    }
  };

  if (!invoice) return <p className="p-4">Invoice not found.</p>;

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header */}
      <div className="flex w-full max-w-2xl items-center justify-between gap-4 py-2">
        <h3 className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-primary dark:border-dark-3 dark:bg-gray-800 dark:hover:text-blue-400">
          View Invoice
        </h3>

        <Link
          href="/invoices"
          className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-primary transition hover:border-red-400 hover:text-red-400 dark:border-dark-3 dark:bg-gray-800 dark:hover:text-blue-400"
        >
          <FiSkipBack className="mr-2 h-5 w-5" />
          Back to Invoice
        </Link>
      </div>

      {/* Invoice content */}
      <div
        ref={invoiceRef}
        className="w-full max-w-2xl rounded-md border border-gray-200 bg-white p-6 shadow-md dark:border-dark-3 dark:bg-gray-dark"
      >
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Invoice
        </h2>

        <div className="mb-4 space-y-1 text-sm">
          <p>
            <strong>Client:</strong>{" "}
            {mockClients.find((c) => c.id === invoice.clientId)?.name ||
              "Unknown Client"}
          </p>
          <p>
            <strong>Invoice No:</strong> {invoice.invoiceNo}
          </p>
          <p>
            <strong>Issue Date:</strong>{" "}
            {invoice.issueDate
              ? new Date(invoice.issueDate).toLocaleDateString("en-GB")
              : "N/A"}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {invoice.dueDate
              ? new Date(invoice.dueDate).toLocaleDateString("en-GB")
              : "N/A"}
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
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, index) => (
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
                ${Number(invoice.subtotal ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="font-medium text-gray-700 dark:text-white">
                Tax:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${Number(invoice.tax ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 dark:border-dark-2">
              <span className="font-medium text-gray-700 dark:text-white">
                Grand Total:
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                ${Number(invoice.totalAmount ?? 0).toFixed(2)}
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
