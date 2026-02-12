"use client";
import React, { useState, useEffect } from "react";
import { useCreateInvoiceMutation } from "@/redux/service/invoices";
import { useGetMyProductsQuery } from "@/redux/service/products";        
import { useGetMyClientsQuery } from "@/redux/service/client";        
import { useToast } from "@/hooks/use-toast";
import { InvoiceItemRequest } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ClientModal } from "@/components/Invoices/create-invoice/ClientModal";
import { ProductModal } from "../create-invoice/ProductModal";

//import { mockClients } from "@/components/Tables/clients";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import  DownloadPDFButton  from "../create-invoice/DownloadPDFButton"
import { ClientResponse } from "@/types/client";

type ExtendedItem = InvoiceItemRequest & {
  id: number;
  total: number;
};

export default function CreateInvoiceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: products = [], isLoading: loadingProducts } = useGetMyProductsQuery();
  const { data: clients = [], isLoading: loadingClients } = useGetMyClientsQuery();
  const [createInvoice, { isLoading: creating }] = useCreateInvoiceMutation();

//   const [clients, setClients] = useState<ClientResponse[]>([]);


  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(null);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [taxPercentage, setTaxPercentage] = useState<number>(10);
  const [items, setItems] = useState<ExtendedItem[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [issueDate, setIssueDate] = useState("");
  const [expireDate, setExpireDate] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("registered_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("invoice_footer_settings");
    if (stored) {
      const parsed = JSON.parse(stored);
    }
  }, []);

  // Initialize invoice number
  useEffect(() => {
    const oldInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const maxId = oldInvoices.length > 0 ? Math.max(...oldInvoices.map((i: any) => i.id)) : 0;
    setInvoiceNo(`INV-${String(maxId + 1).padStart(4, "0")}`);
  }, []);

  
  // Handle modal scroll
  useEffect(() => {
    if (isProductModalOpen || isClientModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isProductModalOpen, isClientModalOpen]);

  // Add products to items list - FIXED THIS FUNCTION
  const handleAddProducts = (selectedProducts: any[]) => {
    const newItems: ExtendedItem[] = selectedProducts.map((p) => ({
      id: p.id,
      productId: p.id,
      name: p.name,
      quantity: 1,
      unitPrice: p.price,
      subtotal: p.price,
      total: p.price,
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  // Update item quantity
  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const subtotal = quantity * item.unitPrice;
        return {
          ...item,
          quantity,
          subtotal,
          total: subtotal,
        };
      }),
    );
  };

  // Update item unit price
  const handleUpdateUnitPrice = (index: number, unitPrice: number) => {
    if (unitPrice < 0) return;
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const subtotal = unitPrice * item.quantity;
        return {
          ...item,
          unitPrice,
          subtotal,
          total: subtotal,
        };
      }),
    );
  };

  // Update item name
  const handleUpdateName = (index: number, name: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return { ...item, name };
      }),
    );
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = (subtotal * taxPercentage) / 100;
  const grandTotal = subtotal + taxAmount;

  // Submit invoice - WITH DATE FORMATTING
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      toast({
        title: "Validation Error",
        description: "Please select a client.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item.",
        variant: "destructive",
      });
      return;
    }

    if (!issueDate) {
      toast({
        title: "Validation Error",
        description: "Please select an issue date.",
        variant: "destructive",
      });
      return;
    }

    if (!expireDate) {
      toast({
        title: "Validation Error",
        description: "Please select a due date.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert items to InvoiceItemRequest format (remove id and total)
      const invoiceItems: InvoiceItemRequest[] = items.map(item => ({
        productId: item.productId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        name: item.name,
      }));

      // Convert date strings to ISO 8601 datetime format
      const formatDateToISO = (dateStr: string) => {
        return `${dateStr}T00:00:00`;
      };

      await createInvoice({
        clientId: selectedClient.id!,
        subtotal,
        tax: taxAmount,
        grandTotal,
        items: invoiceItems,
        status: "pending",
        issueDate: formatDateToISO(issueDate),
        expireDate: formatDateToISO(expireDate),
      }).unwrap();

      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully.",
        className: "bg-green-600 text-white",
      });

      router.push("/invoices");
    } catch (error: any) {
      console.error("Invoice creation error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create invoice.",
        variant: "destructive",
      });
    }
  };

  // Preview and send handler
  const handlePreviewAndSend = async () => {
    if (!selectedClient) {
      toast({
        title: "Validation Error",
        description: "Please select a client.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item.",
        variant: "destructive",
      });
      return;
    }

    if (!issueDate) {
      toast({
        title: "Validation Error",
        description: "Please select an issue date.",
        variant: "destructive",
      });
      return;
    }

    if (!expireDate) {
      toast({
        title: "Validation Error",
        description: "Please select a due date.",
        variant: "destructive",
      });
      return;
    }

    try {
      const invoiceItems: InvoiceItemRequest[] = items.map(item => ({
        productId: item.productId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        name: item.name,
      }));

      const formatDateToISO = (dateStr: string) => {
        return `${dateStr}T00:00:00`;
      };

      await createInvoice({
        clientId: selectedClient.id!,
        subtotal,
        tax: taxAmount,
        grandTotal,
        items: invoiceItems,
        status: "pending",
        issueDate: formatDateToISO(issueDate),
        expireDate: formatDateToISO(expireDate),
      }).unwrap();

      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully.",
        className: "bg-green-600 text-white",
      });

      router.push("/invoices");
    } catch (error: any) {
      console.error("Invoice creation error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create invoice.",
        variant: "destructive",
      });
    }
  };

  const handleSendToClient = () => {
    if (!items.length || !selectedClient) {
      toast({
        title: "Cannot send",
        description: "Please complete the invoice first",
        className: "bg-red-600 text-white",
      });
      return;
    }

    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const invoice = invoices.find((i: any) => i.invoiceNo === invoiceNo);

    if (!invoice) {
      toast({
        title: "Save invoice first",
        description: "Please create invoice before sending",
        className: "bg-red-600 text-white",
      });
      return;
    }

    const link = `${window.location.origin}/invoices/${invoice.id}`;
    navigator.clipboard.writeText(link);

    toast({
      title: "Link copied",
      description: "Invoice link copied. Send it to client!",
      className: "bg-green-600 text-white",
    });
  };

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center space-x-6">
      {/* Main Form - Left Column */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl space-y-8 rounded-xl bg-white p-8"
      >
        <header className="flex items-center justify-between border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
          <div className="text-sm">
            <p className="text-gray-500">Invoice No.</p>
            <p className="font-semibold text-gray-700">{invoiceNo}</p>
          </div>
        </header>

        {/* Address and Date Details Section */}
        <div className="grid gap-6 border-b pb-6 text-sm text-gray-600 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {user?.companyName || "Company Name"}
            </p>
            <p>{`${user?.houseNo || ""} ${user?.street || ""}, ${user?.commune || ""}`}</p>
            <p>{`${user?.district || ""}, ${user?.province || ""}, ${user?.companyPhone || ""}`}</p>
            <p className="text-gray-500">{user?.companyEmail}</p>
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
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-gray-800">
                  Due Date
                </label>
                <input
                  type="date"
                  value={expireDate}
                  onChange={(e) => setExpireDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client Selection Section */}
        <div className="border-b pb-6">
          {selectedClient ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">
                  Customer:
                </span>
                <span className="font-bold text-gray-900">
                  {selectedClient.name}
                </span>
              </div>
              <div className="hidden h-4 w-px bg-gray-300 md:block" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">
                  Address:
                </span>
                <span className="font-semibold text-gray-700">
                  {selectedClient.address || "N/A"}
                </span>
              </div>
              <div className="hidden h-4 w-px bg-gray-300 md:block" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">
                  Phone:
                </span>
                <span className="font-semibold text-gray-700">
                 {selectedClient.phoneNumber || "N/A"}
                </span>
              </div>
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
          clients={clients}
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
                    Unit Price ($)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total ($)
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
                        onChange={(e) => handleUpdateName(index, e.target.value)}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      <input
                        type="number"
                        min="1"
                        className="w-full rounded border-gray-200 bg-slate-100 p-2 focus:border-blue-500 focus:ring-blue-500"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(index, Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full rounded border-gray-200 bg-slate-100 p-2 focus:border-blue-500 focus:ring-blue-500"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateUnitPrice(index, Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      <button
                        type="button"
                        className="rounded-md bg-red-100 px-2 py-1 text-red-600 hover:text-red-900"
                        onClick={() => handleRemoveItem(index)}
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
                onClick={() => setIsProductModalOpen(true)}
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
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-gray-700">
                <span>Tax ({taxPercentage}%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-600">
                <span>Grand Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Submission Button */}
        <button
          type="submit"
          disabled={creating || items.length === 0 || !selectedClient || !issueDate || !expireDate}
          className="w-full rounded-lg bg-blue-600 py-3 text-lg font-semibold text-white transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {creating ? "Creating Invoice..." : "Create Invoice"}
        </button>
      </form>

      {/* Invoice Settings Sidebar (Right Column) */}
      <div className="sticky top-6 space-y-6">
        {/* Top action buttons section */}
        <div className="space-y-3 rounded-lg bg-white p-4">
          <button
            type="button"
            onClick={handlePreviewAndSend}
            disabled={creating || items.length === 0 || !selectedClient || !issueDate || !expireDate}
            className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <span className="mr-2">+</span> Preview and send
          </button>
          <button
            type="button"
            onClick={handleSendToClient}
            disabled={creating || items.length === 0 || !selectedClient}
            className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <span className="mr-2">+</span> Send to client
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4 rounded-lg bg-white p-4">
          {/* Tax Settings */}
          <div>
            <h2 className="mb-2 font-semibold text-gray-800">Tax Settings</h2>
            <div className="flex items-center justify-between py-1 text-sm">
              <span>Tax Percentage</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  className="w-20 rounded border p-1 text-right"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span>%</span>
              </div>
            </div>
          </div>

          {/* Accepted Payments */}
          <div className="border-t pt-4">
            <h2 className="mb-2 font-semibold text-gray-800">
              Accepted payments
            </h2>
            <div className="flex items-center justify-between py-1 text-sm">
              <span>Stripe</span>
              <button type="button" className="text-purple-600">Connect</button>
            </div>
            <div className="flex items-center justify-between py-1 text-sm">
              <span>Paypal</span>
              <button type="button" className="text-purple-600">Setup</button>
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
            <button type="button" className="mt-3 text-sm text-purple-600 hover:underline">
              Add reminder option
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProducts={handleAddProducts}
      />
    </div>
  );
}