"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ProductData } from "@/types/product";
import { ClientData } from "@/types/client";
import { getProductsTableData } from "@/components/Tables/fetch";
import { mockClients } from "@/components/Tables/clients";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { ClientModal } from "./ClientModal";
import { DownloadPDFButton } from "./DownloadPDFButton";
type Item = {
  id: number;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
};

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectProducts: (selected: ProductData[]) => void;
};

const ProductModal = ({
  isOpen,
  onClose,
  onSelectProducts,
}: ProductModalProps) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (!isOpen) return;
    async function fetchProducts() {
      const data = await getProductsTableData();
      setProducts(data);
    }
    fetchProducts();
  }, [isOpen]);

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
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

export default function CreateInvoice() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
const [expiryDate, setExpiryDate] = useState(""); // Add this

  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceTerms, setInvoiceTerms] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return; // ensure client-side

    const stored = localStorage.getItem("invoice_footer_settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      setInvoiceNote(parsed.defaultNote || "");
      setInvoiceTerms(parsed.defaultTerms || "");
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("registered_user");

    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("invoice_footer_settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      setInvoiceNote(parsed.defaultNote || "");
      setInvoiceTerms(parsed.defaultTerms || "");
    }
  }, []);

  useEffect(() => setClients(mockClients), []);

  useEffect(() => {
    const oldInvoices = JSON.parse(
      localStorage.getItem("invoices") || "[]",
    );
    const maxId =
      oldInvoices.length > 0
        ? Math.max(...oldInvoices.map((q: any) => q.id))
        : 0;
    setInvoiceNo(`INV-${String(maxId + 1).padStart(4, "0")}`);
  }, []);

  const handleAddProducts = (products: ProductData[]) => {
    const newItems: Item[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      qty: 1,
      unitPrice: p.unitPrice,
      total: p.unitPrice,
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleItemChange = (
    index: number,
    field: "name" | "qty" | "unitPrice",
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated: Item = { ...item };
        if (field === "qty" || field === "unitPrice")
          updated[field] = Number(value);
        else updated[field] = String(value);
        updated.total = updated.qty * updated.unitPrice;
        return updated;
      }),
    );
  };

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast({
        title: "Select client",
        description: "Please select a client.",
        className: "bg-red-600 text-white",
        duration: 3000,
      });
      return;
    }

    // 2. This is what triggers your "No items" toast
    if (items.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one item.",
        className: "bg-red-600 text-white",
        duration: 3000,
      });
      return;
    }

    const oldInvoices = JSON.parse(
      localStorage.getItem("invoices") || "[]",
    );
    const maxId =
      oldInvoices.length > 0
        ? Math.max(...oldInvoices.map((q: any) => q.id))
        : 0;
    const newId = maxId + 1;

    const newInvoice = {
      id: newId,
      invoiceNo: `INV-${String(newId).padStart(4, "0")}`,
      clientId: selectedClient.id,
      issueDate,
      items,
      subtotal: items.reduce((sum, i) => sum + i.total, 0),
      totalAmount: items.reduce((sum, i) => sum + i.total, 0),
      status: "Unpaid",
    };

    localStorage.setItem(
      "invoices",
      JSON.stringify([...oldInvoices, newInvoice]),
    );

    toast({
      title: "Invoice Created",
      description: `${newInvoice.invoiceNo} created successfully!`,
      className: "bg-green-600 text-white",
      duration: 3000,
    });

    // Reset form
    setItems([]);
    setSelectedClient(null);
    setInvoiceNo(`INV-${String(newId + 1).padStart(4, "0")}`);
    setIssueDate(new Date().toISOString().slice(0, 10));

    router.push(`/invoices/${newId}`);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // Disable background scroll
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);


  const handleSendToClient = () => {
  if (!items.length || !selectedClient) {
    toast({
      title: "Cannot send",
      description: "Please complete the quotation first",
      className: "bg-red-600 text-white",
    });
    return;
  }

    const invoices = JSON.parse(
      localStorage.getItem("invoices") || "[]"
    );

    const invoice = invoices.find(
      (q: any) => q.invoiceNo === invoiceNo
    );

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


  return (
    <div className="flex justify-center space-x-6">
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
                  {selectedClient.contact || "N/A"}
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
          className="w-full rounded-lg bg-blue-600 py-3 text-lg font-semibold text-white transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Invoice
        </button>
      </form>

      {/* Invoice Settings Sidebar (Right Column) - Based on your image's style */}
      <div className="sticky top-6 space-y-6 lg:col-span-1">
        {/* Top action buttons section */}
        <div className="space-y-3 rounded-lg bg-white p-4">
          <button className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700">
            <span className="mr-2">+</span> Preview and send
          </button>
          <div onClick={handleSubmit}  className="flex w-full items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-700">
            <DownloadPDFButton
              quotation={{
                id: items.length > 0 ? 1 : 0,
                issueDate: issueDate,
                expiryDate: expiryDate,
                items: items,
                clientId: selectedClient?.id ?? 0,
                amount: items.reduce((sum, i) => sum + i.total, 0),
                notes: invoiceNote,
                terms: invoiceTerms,
                quotationNo: invoiceNo,
              }}
              client={selectedClient}
              taxRate={0}
              user={user}
            />
          </div>
          <button onClick={handleSendToClient} className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700">
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
      />
    </div>
  );
}
