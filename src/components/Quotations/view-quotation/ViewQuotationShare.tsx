"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { FiSkipBack, FiMail, FiEdit, FiCheckCircle } from "react-icons/fi";
import {
  useGetQuotationByIdQuery,
  useUpdateQuotationMutation,
} from "@/redux/service/quotation";
import { useGetClientByIdQuery } from "@/redux/service/client";
import { useGetMyProductsQuery } from "@/redux/service/products";
import { DownloadPDFButton } from "../create-quotation/DownloadPDFButton";
import { useCreateInvoiceMutation } from "@/redux/service/invoices";
import { useToast } from "@/hooks/use-toast";
import { ProductNameByUuid } from "./ProductNameByUuid";

interface ViewQuotationProps {
  id: number;
}

export default function ViewQuotationShare({ id }: ViewQuotationProps) {
  const quotationRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // --- ១. ហៅ Hooks ទាំងអស់នៅផ្នែកខាងលើបង្អស់ ---
  const {
    data: quotation,
    isLoading,
    isError,
    error,
  } = useGetQuotationByIdQuery(id);

  const { data: client, isLoading: loadingClient } = useGetClientByIdQuery(
    quotation?.clientId ?? 0,
    { skip: !quotation?.clientId },
  );

  const [updateQuotation, { isLoading: isUpdating }] =
    useUpdateQuotationMutation();
  const [createInvoice, { isLoading: isCreatingInvoice }] =
    useCreateInvoiceMutation();
  const {
    data: products = [],
    isLoading: loadingProducts,
    isError: isProductsError,
  } = useGetMyProductsQuery();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (quotation?.items && products.length > 0) {
      console.log("Item UUID from API:", quotation.items[0]?.productUuid);
      console.log(
        "Available UUIDs in Products:",
        products.map((p) => p.id),
      );
    }
  }, [quotation, products]);

  const productIdMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  // --- ២. បន្ទាប់មកទើប Check Loading ឬ Error (Hooks មិនត្រូវនៅក្រោមនេះទេ) ---
  if (isLoading || loadingClient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !quotation) {
    const errorMsg = (error as any)?.data?.message || error?.toString();
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <p className="font-semibold text-red-500">
          Error loading quotation: {errorMsg}
        </p>
        <Link
          href="/quotation"
          className="flex items-center text-purple-600 hover:underline"
        >
          <FiSkipBack className="mr-2" /> Back to List
        </Link>
      </div>
    );
  }

  // --- ៣. បន្ទាប់មកទើបដាក់ Helper functions និង Logic ធម្មតា ---
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const calculatedTotal = (quotation?.items ?? []).reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const handleApproveAndConvert = async () => {
    const formatDateForInvoice = (dateStr?: string) => {
      const dateObj = dateStr ? new Date(dateStr) : new Date();
      return isNaN(dateObj.getTime())
        ? new Date().toISOString().slice(0, 19)
        : dateObj.toISOString().slice(0, 19);
    };

    try {
      // Step 1: បង្កើត Invoice
      await createInvoice({
        issueDate: formatDateForInvoice(
          quotation.issueDate || quotation.quotationDate,
        ),
        expireDate: formatDateForInvoice(
          quotation.expiryDate || quotation.quotationExpire,
        ),
        clientId: quotation.clientId,
        subtotal: calculatedTotal,
        tax: 0,
        grandTotal: calculatedTotal,
        status: "PENDING",
        items: (quotation.items ?? []).map((item) => ({
          productId: item.productId || item.id,
          unitPrice: Number(item.unitPrice) || 0,
          quantity: Number(item.quantity) || 0,
          subtotal: Number(item.unitPrice) * Number(item.quantity) || 0,
          name: item.productName || item.name || "Unknown Product",
        })),
      } as any).unwrap();

      // Step 2: Approve Quotation
      await updateQuotation({
        id: quotation.id,
        body: {
          ...quotation,
          status: "APPROVED",
          quotationStatus: "APPROVED",
        } as any,
      }).unwrap();

      toast({
        title: "Success!",
        description: "Quotation approved and converted to invoice.",
        className: "bg-green-600 text-white",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || loadingClient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="spinner-border h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Main Quotation Card - ដូច ViewInvoiceShare បេះបិទ */}
      <div
        ref={quotationRef}
        className="h-[87vh] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        {/* Header Section */}
        <div className="border-b border-gray-200 p-8 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Quotation
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                No:{" "}
                {quotation.quotationNo
                  ? `QUO-${String(quotation.quotationNo).padStart(4, "0")}`
                  : `QUO-${String(quotation.id).padStart(4, "0")}`}
              </p>
              <div className="mt-2">
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Active
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Issue Date
                </p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {formatDate(quotation.quotationDate ?? quotation.issueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Due Date
                </p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {formatDate(
                    quotation.expiryDate ?? quotation.quotationExpire,
                  )}
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
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {user?.companyName || "Company Name"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{`${user?.houseNo || ""} ${user?.street || ""}`}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{`${user?.province || ""}, ${user?.companyPhone || ""}`}</p>
              <p className="text-sm text-gray-500">{user?.companyEmail}</p>
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
            Quotation Items
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
                {(quotation.items ?? []).map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="p-3 text-sm text-gray-900 dark:text-white">
                      {(() => {
                        const productFromMap = productIdMap.get(item.productId);
                        if (productFromMap) return productFromMap.name;

                        if (item.productName || item.name)
                          return item.productName || item.name;

                        return (
                          <ProductNameByUuid
                            id={item.productId}
                            fallback={`Product (ID: ${item.productId})`}
                          />
                        );
                      })()}
                    </td>

                    <td className="p-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-8 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${calculatedTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-300 pt-2 dark:border-gray-600">
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  Grand Total:
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  ${calculatedTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Note Section ដូច ViewInvoiceShare */}
          <div className="mt-6">
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              Note *
            </div>
            <div
              className="text-sm text-gray-600 dark:text-gray-400"
              dangerouslySetInnerHTML={{ __html: quotation?.notes || "" }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons - ដូច ViewInvoiceShare */}
      <div className="mt-6 flex gap-4">
        <DownloadPDFButton
          quotation={{
            quotationNo: quotation.quotationNo || "",
            issueDate: (quotation.quotationDate ?? quotation.issueDate) || "",
            expiryDate:
              (quotation.expiryDate ?? quotation.quotationExpire) || "",

            items: quotation.items.map((item) => ({
              id: item.id,
              uuid: item.productUuid || "",
              name: item.productName || item.name || "",
              price: item.unitPrice,
              image_url: "",
              status: "IN_STOCK",
              productTypeId: 0,
              productTypeName: "",
              stockQuantity: item.quantity,
              low_stock: 0,
              userId: 0,
              currency_type: "USD",
            })),
            amount: calculatedTotal,
            notes: quotation.notes || "",
            terms: quotation.terms || "",
          }}
          client={client || null}
          taxRate={0}
        />
        {quotation?.status !== "APPROVED" && (
          <button
            onClick={handleApproveAndConvert}
            disabled={isUpdating || isCreatingInvoice}
            className="flex items-center justify-center rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            <FiCheckCircle className="mr-2" />
            {isUpdating || isCreatingInvoice ? "Processing..." : "Approve"}
          </button>
        )}
      </div>
    </div>
  );
}
