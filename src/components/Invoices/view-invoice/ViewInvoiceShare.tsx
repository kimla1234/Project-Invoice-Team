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

export default function ViewInvoiceShare({ id }: ViewInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Use Redux RTK Query to fetch invoice data
  const {
    data: invoice,
    isLoading,
    isError,
    error,
  } = useGetInvoiceByIdQuery(id, {
    skip: !id,
  });

  const { data: setting, isLoading: loadingSetting } = useGetMySettingsQuery();

  const { data: client, isLoading: loadingClients } = useGetClientByIdQuery(
    invoice?.clientId ?? 0,
    { skip: !invoice?.clientId },
  );

  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Loading state
  if (isLoading || loadingClients) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="spinner-border mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <p className="text-red-500">
          Error loading invoice: {error?.toString()}
        </p>
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
        <p className="p-4 text-gray-700 dark:text-gray-300">
          Invoice not found.
        </p>
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
    <div className="mx-auto max-w-4xl ">
      {/* Invoice Card */}
      <div
        ref={invoiceRef}
        className="min-h-[87vh] rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        {/* Header Section */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Invoice
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Invoice No:{" "}
                {invoice.invoiceNo ||
                  `INV-${invoice.id.toString().padStart(4, "0")}`}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(invoice.status)}`}
                >
                  {invoice.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
            </div>
            <div className="flex gap-8 sm:block sm:text-right">
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Issue Date
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                  {formatDate(invoice.issueDate)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Due Date
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                  {formatDate(invoice.expireDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company & Client Info */}
        <div className="grid gap-8 border-b border-gray-200 p-4 dark:border-gray-700 sm:p-8 md:grid-cols-2">
          <div className="space-y-1">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              From
            </h3>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {setting?.companyName || "Company Name"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {setting?.companyAddress}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {setting?.companyPhoneNumber}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {setting?.companyEmail}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              Bill To
            </h3>
            <p className="font-semibold text-gray-900 dark:text-white">
              {client?.name || "Unknown Client"}
            </p>
            {client?.address && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {client.address}
              </p>
            )}
            {client?.phoneNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tel: {client.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Items Table Container */}
        <div className="p-4 sm:p-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Invoice Items
          </h3>
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border-b border-gray-200 shadow dark:border-gray-700 sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                        No
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                        Product
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                        Qty
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                        Price
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {invoice.items?.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                          ${Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                          ${Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full space-y-3 sm:w-64">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${Number(invoice.subtotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${Number(invoice.tax).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-200 pt-3 dark:border-gray-600">
                <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                  Grand Total:
                </span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  ${Number(invoice.grandTotal).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-700">
            <div className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Note *
            </div>
            <div
              className="mt-2 text-sm text-gray-600 dark:text-gray-400"
              dangerouslySetInnerHTML={{ __html: setting?.invoiceNote || "" }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <DownloadPDFButton id={invoice.id}  />
      </div>
    </div>
  );
}
