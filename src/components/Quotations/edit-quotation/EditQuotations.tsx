"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { IoMdAdd } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";

import { ClientModal } from "../create-quotation/ClientModal";
import { DownloadPDFButton } from "../create-quotation/DownloadPDFButton";
import { FiSkipBack } from "react-icons/fi";
import Link from "next/link";

import { useGetMyProductsQuery } from "@/redux/service/products";
import {
  useGetQuotationByIdQuery,
  useUpdateQuotationMutation,
} from "@/redux/service/quotation";
import { useGetMyClientsQuery } from "@/redux/service/client";

import { MyEventResponse } from "@/types/product";
import { ClientResponse } from "@/types/client";
import { QuotationCreateRequest } from "@/types/quotation";

type Item = {
  id: number;
  uuid?: string;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
};

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectProducts: (selected: MyEventResponse[]) => void;
  products: MyEventResponse[];
};

const ProductModal = ({
  isOpen,
  onClose,
  onSelectProducts,
  products,
}: ProductModalProps) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set(),
  );

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedProducts);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedProducts(newSet);
  };

  const handleSubmit = () => {
    const selected = products.filter((p) => selectedProducts.has(p.id));
    onSelectProducts(selected);
    setSelectedProducts(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-50 max-h-[80vh] w-[600px] overflow-y-auto rounded-lg border bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Products</h2>
          <button onClick={onClose} className="font-bold text-red-500">
            X
          </button>
        </div>

        <input
          type="text"
          placeholder="Search product..."
          className="mb-3 w-full rounded border p-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="max-h-[300px] space-y-2 overflow-y-auto">
          {products
            .filter((p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((p) => (
              <div
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`flex cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-100 ${selectedProducts.has(p.id) ? "bg-blue-100" : ""}`}
              >
                <span>{p.name}</span>
                <input
                  type="checkbox"
                  checked={selectedProducts.has(p.id)}
                  readOnly
                />
              </div>
            ))}

          {products.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ).length === 0 && (
            <p className="text-center text-gray-500">No products found</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="mt-3 w-full rounded bg-primary py-2 text-white hover:bg-primary/90"
        >
          Add Selected
        </button>
      </div>
    </div>
  );
};

export default function EditQuotation() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = Number(params?.id);

  // Move products query to main scope so we can use it for mapping
  const { data: products = [] } = useGetMyProductsQuery();

  const { data: quotation, isLoading: isQuotationLoading } =
    useGetQuotationByIdQuery(id, {
      skip: isNaN(id),
    });

  const { data: clients = [] } = useGetMyClientsQuery();
  const [updateQuotation, { isLoading: isUpdating }] =
    useUpdateQuotationMutation();

  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(
    null,
  );
  const [items, setItems] = useState<Item[]>([]);
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [expiryDate, setExpiryDate] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceTerms, setInvoiceTerms] = useState("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotationNo, setQuotationNo] = useState<string | number | undefined>(
    undefined,
  );

  // Initialize form with fetched data
  useEffect(() => {
    if (quotation) {
      if (quotation.clientId && clients.length > 0) {
        const foundClient = clients.find((c) => c.id === quotation.clientId);
        if (foundClient) setSelectedClient(foundClient);
      }

      const safeDate = (dateStr?: string) => {
        if (!dateStr) return "";
        try {
          return new Date(dateStr).toISOString().slice(0, 10);
        } catch (e) {
          return "";
        }
      };

      setIssueDate(
        safeDate(quotation.issueDate) ||
        safeDate(quotation.quotationDate) ||
        new Date().toISOString().slice(0, 10)
      );
      setExpiryDate(safeDate(quotation.expiryDate) || safeDate(quotation.quotationExpire) || "");
      setQuotationNo(quotation.quotationNo || quotation.id);

      // Debug logs
      console.log("EditQuotation - Quotation:", quotation);
      console.log("EditQuotation - Products:", products);

      // Initialize Notes and Terms from Quotation first
      if (quotation.notes) setInvoiceNote(quotation.notes);
      if (quotation.terms) setInvoiceTerms(quotation.terms);

      // Load items with robust mapping
      if (quotation.items) {
        const mappedItems: Item[] = quotation.items.map((qItem) => {
           // Try to find the original product to get its ID if missing in qItem
           const originalProduct = products.find(
             (p) =>
               p.id === qItem.productId ||
               p.uuid === qItem.productUuid ||
               p.name === (qItem.productName || qItem.name),
           );
           
           console.log("Mapping Item:", qItem, "Found Product:", originalProduct);

           return {
            id: qItem.productId || originalProduct?.id || 0,
            uuid: qItem.productUuid,
            name: qItem.productName || qItem.name || originalProduct?.name || "Unknown Product",
            qty: qItem.quantity,
            unitPrice: qItem.unitPrice,
            total: qItem.total || qItem.quantity * qItem.unitPrice,
          };
        });
        setItems(mappedItems);
      }
    }
  }, [quotation, clients, products]);

  // Load default settings only if not already set by quotation
  useEffect(() => {
    if (typeof window !== "undefined" && !quotation) {
      const stored = localStorage.getItem("invoice_footer_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.defaultNote && !invoiceNote)
          setInvoiceNote(parsed.defaultNote);
        if (parsed.defaultTerms && !invoiceTerms)
          setInvoiceTerms(parsed.defaultTerms);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation]);

  const handleAddProducts = (selectedProducts: MyEventResponse[]) => {
    const newItems: Item[] = selectedProducts.map((p) => ({
      id: p.id,
      uuid: p.uuid,
      name: p.name,
      qty: 1,
      unitPrice: p.price,
      total: p.price,
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleItemChange = (
    index: number,
    field: "name" | "qty" | "unitPrice",
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated: Item = { ...item };
        if (field === "qty" || field === "unitPrice") {
          updated[field] = Number(value);
        } else {
          // @ts-ignore
          updated[field] = value;
        }
        updated.total = updated.qty * updated.unitPrice;
        return updated;
      }),
    );
  };

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      toast({
        title: "Select client",
        description: "Please select a client.",
        className: "bg-red-600 text-white",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one item.",
        className: "bg-red-600 text-white",
      });
      return;
    }

    const payload: QuotationCreateRequest = {
      userId: 1, // Start with 1, or ideally fetch from user state
      clientId: selectedClient.id,
      quotationNo:
        typeof quotationNo === "string" ? Number(quotationNo) : quotationNo,
      quotationDate: new Date(issueDate).toISOString(),
      quotationExpire: expiryDate
        ? new Date(expiryDate).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      issueDate,
      expiryDate,
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.qty,
        unitPrice: item.unitPrice,
        subtotal: item.total,
      })),
    };

    try {
      await updateQuotation({ id, body: payload }).unwrap();
      toast({
        title: "Quotation Updated",
        description: `QUO-${String(quotationNo).padStart(4, "0")} updated successfully!`,
        className: "bg-green-600 text-white",
      });
      router.push("/quotation");
    } catch (err: any) {
      console.error("Update failed", err);
      toast({
        title: "Update Failed",
        description: err?.data?.message || "Failed to update quotation.",
        className: "bg-red-600 text-white",
      });
    }
  };

  if (isQuotationLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex justify-center space-x-6">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-4xl space-y-8 rounded-xl bg-white p-8"
      >
        <header className="flex items-center justify-between border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Quotation</h1>
          <div className="text-sm">
            <p className="text-gray-500">Quotation No.</p>
            <p className="font-semibold text-gray-700">
              {quotationNo !== undefined
                ? `QUO-${String(quotationNo).padStart(4, "0")}`
                : "Loading..."}
            </p>
          </div>
        </header>

        {/* Address and Date Details Section */}
        <div className="grid gap-6 border-b pb-6 text-sm text-gray-600 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-gray-800">Company Name</p>
            <p>Your Company Address</p>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-semibold text-gray-800">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-gray-800">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="Pick a date"
                  value={expiryDate}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client Selection Section */}
        <div className="border-b pb-6">
          {selectedClient ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* Label and Name */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">
                  Customer:
                </span>
                <span className="font-bold text-gray-900">
                  {selectedClient.name}
                </span>
              </div>

              <div className="hidden h-4 w-px bg-gray-300 md:block" />

              {/* Label and Address */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">
                  Address:
                </span>
                <span className="font-semibold text-gray-700">
                  {selectedClient.address || "N/A"}
                </span>
              </div>

              <div className="hidden h-4 w-px bg-gray-300 md:block" />

              {/* Label and Phone */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">
                  Phone:
                </span>
                <span className="font-semibold text-gray-700">
                  {selectedClient.phoneNumber || "N/A"}
                </span>
              </div>

              {/* Edit Button moved to the end of the line */}
              <button
                type="button"
                onClick={() => setIsClientModalOpen(true)}
                className="ml-auto flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <span className="rounded border bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500">
                  ⌘ K
                </span>
                Edit
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center gap-2 text-lg font-medium text-blue-600 hover:text-blue-700"
            >
              <IoAddCircleOutline className="h-6 w-6" />
              Select Client
              <span className="ml-2 rounded border bg-gray-50 px-2 py-0.5 text-sm text-gray-400">
                ⌘ K
              </span>
            </button>
          )}
        </div>

        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onSelectClient={setSelectedClient}
        />

        {/* Items Table Section */}
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className="transition duration-150 ease-in-out hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      <input
                        className="w-full rounded border-gray-200 bg-slate-100 p-2 focus:border-blue-500 focus:ring-blue-500"
                        value={item.name}
                        disabled
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      <input
                        type="number"
                        className="w-full rounded border-gray-200 bg-slate-100 p-2 focus:border-blue-500 focus:ring-blue-500"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(index, "qty", e.target.value)
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      <input
                        type="number"
                        className="w-full rounded border-gray-200 bg-slate-100 p-2 focus:border-blue-500 focus:ring-blue-500"
                        value={item.unitPrice}
                        disabled
                        onChange={(e) =>
                          handleItemChange(index, "unitPrice", e.target.value)
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {item.total.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      <button
                        type="button"
                        className="rounded-md bg-red-100 px-2 py-1 text-red-600 hover:text-red-900"
                        onClick={() => removeItem(index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-end border-b bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-400 bg-slate-200 px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-slate-100"
              >
                <IoMdAdd className="h-5 w-5" />
                <div className="text-md">Add Item</div>
              </button>
            </div>
          </div>
          <div className="flex justify-end bg-gray-50 p-4">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between font-medium text-gray-700">
                <span>Subtotal</span>
                <span>
                  ${items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-600">
                <span>Grand Total</span>
                <span>
                  ${items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Submission Button */}
        <button
          type="submit"
          disabled={isUpdating}
          className={`w-full rounded-lg py-3 text-lg font-semibold text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isUpdating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isUpdating ? "Updating..." : "Update Quotation"}
        </button>
      </form>

      {/* Invoice Settings Sidebar (Right Column) */}
      <div className="sticky top-6 space-y-6 lg:col-span-1">
        {/* Top action buttons section */}
        <div className="space-y-3 rounded-lg bg-white p-4">
          <Link
                      href="/quotation"
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <FiSkipBack /> Back to List
                    </Link>
          <button className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700">
            <span className="mr-2">+</span> Preview and send
          </button>

          <button
            type="button"
            onClick={() => {
              if (!selectedClient) {
                toast({
                  title: "Select a client",
                  description: "Please select a client first.",
                  variant: "destructive",
                });
                return;
              }
              toast({
                title: "Sending...",
                description: "Quotation will be sent to client.",
                className: "bg-blue-600 text-white",
              });
            }}
            className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700"
          >
            <span className="mr-2">+</span> Send to client
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4 rounded-lg bg-white p-4">
          {/* Accepted Payments */}
          <div>
            <h2 className="mb-2 font-semibold text-gray-800">
              Accepted payments
            </h2>
            <div className="flex items-center justify-between py-1 text-sm">
              <span>Stripe</span>
              <button className="text-purple-600">Connect</button>
            </div>
            <div className="flex items-center justify-between py-1 text-sm">
              <span>Paypal</span>
              <button className="text-purple-600">Setup</button>
            </div>
          </div>

          {/* Late Fees */}
          <div className="border-t pt-4">
            <h2 className="mb-2 font-semibold text-gray-800">Late fees</h2>
            <label className="mb-2 flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox rounded text-purple-600"
                checked
                readOnly
              />
              <span className="text-sm">
                Charge late fees if this invoice becomes past due.
              </span>
            </label>
            <select className="w-full rounded border bg-gray-50 p-2 text-sm">
              <option>Select late fees</option>
            </select>
          </div>

          {/* Reminders */}
          <div className="border-t pt-4">
            <h2 className="mb-2 font-semibold text-gray-800">Reminders</h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-purple-600"
                  checked
                  readOnly
                />
                <span>Reminder 1: 7 days before due date</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-purple-600"
                  checked
                  readOnly
                />
                <span>Reminder 2: 14 days before due date</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-purple-600"
                  checked
                  readOnly
                />
                <span>Reminder 3: 30 days before due date</span>
              </label>
            </div>
            <button className="mt-3 text-sm text-purple-600 hover:underline">
              Add reminder option
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectProducts={handleAddProducts}
        products={products}
      />
    </div>
  );
}
