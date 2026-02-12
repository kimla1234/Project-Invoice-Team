"use client";

import { useRef } from "react";
import Link from "next/link";
import { FiSkipBack } from "react-icons/fi";
import { useGetInvoiceByIdQuery } from "@/redux/service/invoices";
import { useGetClientByIdQuery } from "@/redux/service/client";
import { useGetMySettingsQuery } from "@/redux/service/setting";
import DownloadPDFButton from "../create-invoice/DownloadPDFButton";

interface ViewInvoiceProps {
  id: number;
}

export default function ViewInvoice({ id }: ViewInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Use Redux RTK Query to fetch invoice data
  const { 
    data: invoice, 
    isLoading, 
    isError, 
    error 
  } = useGetInvoiceByIdQuery(id, {
    skip: !id,
  });

  const { data: setting, isLoading: loadingSetting } = useGetMySettingsQuery();
  

  const { data: client, isLoading: loadingClients } = useGetClientByIdQuery(
    invoice?.clientId ?? 0,
    { skip: !invoice?.clientId }
  );

  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Loading state
  if (isLoading || loadingClients) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="spinner-border mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <p className="text-red-500">Error loading invoice: {error?.toString()}</p>
        <Link
          href="/invoices"
          className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-purple-600 transition hover:border-purple-400 hover:text-purple-700 dark:border-dark-3 dark:bg-gray-800"
        >
          <FiSkipBack className="mr-2 h-5 w-5" />
          Back to Invoices
        </Link>
      </div>
    );
  }

  // No invoice found
  if (!invoice) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6">
        <p className="p-4 text-gray-700 dark:text-gray-300">Invoice not found.</p>
        <Link
          href="/invoices"
          className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-purple-600 transition hover:border-purple-400 hover:text-purple-700 dark:border-dark-3 dark:bg-gray-800"
        >
          <FiSkipBack className="mr-2 h-5 w-5" />
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/invoices"
          className="flex w-fit items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-purple-600 transition hover:border-purple-400 hover:text-purple-700 dark:border-dark-3 dark:bg-gray-800"
        >
          <FiSkipBack className="mr-2 h-5 w-5" />
          Back to Invoices
        </Link>
      </div>

      {/* Invoice Card */}
      <div
        ref={invoiceRef}
        className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        {/* Header Section */}
        <div className="border-b border-gray-200 p-8 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Invoice
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Invoice No: {invoice.invoiceNo || `INV-${invoice.id.toString().padStart(4, "0")}`}
              </p>
              <div className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                  {invoice.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Issue Date</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {formatDate(invoice.issueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {formatDate(invoice.expireDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company & Client Info */}
        <div className="grid gap-8 border-b border-gray-200 p-8 dark:border-gray-700 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              From
            </h3>
             <div>
            <p className="text-lg font-semibold text-gray-800">
              {setting?.companyName || "Company Name"}
            </p>
            <p>{`${setting?.companyAddress || ""}, ${setting?.companyPhoneNumber || ""}`}</p>
            <p className="text-gray-500">{setting?.companyEmail}</p>
          </div>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              Bill To
            </h3>
            <p className="font-semibold text-gray-900 dark:text-white">
              {client?.name || "Unknown Client"}
            </p>
            {client?.address && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Address: {client.address}
              </p>
            )}
            {client?.phoneNumber && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Phone: {client.phoneNumber}
              </p>
            )}
            
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Invoice Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                  <th className="p-3 text-left text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    No
                  </th>
                  <th className="p-3 text-left text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Product Name
                  </th>
                  <th className="p-3 text-right text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Qty
                  </th>
                  <th className="p-3 text-right text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Unit Price ($)
                  </th>
                  <th className="p-3 text-right text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Total ($)
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="p-3 text-right text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right text-sm text-gray-600 dark:text-gray-400">
                        ${Number(item.unitPrice ?? 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        ${Number(item.subtotal ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${Number(invoice.subtotal ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${Number(invoice.tax ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 pt-2 dark:border-gray-600">
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  Grand Total:
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  ${Number(invoice.grandTotal ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="border-t border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Invoice Details
          </h3>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Invoice ID:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {invoice.id}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">User ID:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {invoice.userId}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Client ID:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {invoice.clientId}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created At:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {formatDate(invoice.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {formatDate(invoice.updatedAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                {invoice.status?.toUpperCase() || "PENDING"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <DownloadPDFButton id={invoice.id} />
        <Link
          href={`/invoices/${invoice.id}/edit`}
          className="flex items-center justify-center rounded-lg bg-purple-600 px-6 py-3 text-white transition hover:bg-purple-700"
        >
          Edit Invoice
        </Link>
      </div>
    </div>
  );
}