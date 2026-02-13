"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";

import { ClientModal } from "./ClientModal";
import { DownloadPDFButton } from "./DownloadPDFButton";

import { useGetMyProductsQuery } from "@/redux/service/products";
import { useCreateQuotationMutation, useGetQuotationsQuery } from "@/redux/service/quotation";

import { MyEventResponse } from "@/types/product";
import { ClientResponse } from "@/types/client";
import { QuotationCreateRequest } from "@/types/quotation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type Item = {
  id: number;
  uuid: string;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
};

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectProducts: (selected: MyEventResponse[]) => void;
};

// const user = useSelector((state: RootState) => state.auth.user);

const ProductModal = ({
  isOpen,
  onClose,
  onSelectProducts,
}: ProductModalProps) => {
  const { data: products = [] } = useGetMyProductsQuery(undefined, {
    skip: !isOpen,
  });

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

export default function CreateQuotation() {
  const router = useRouter();
  const { toast } = useToast();

  const [createQuotation] = useCreateQuotationMutation();
  const { 
    data: quotationsData, 
    isLoading: isQuotationsLoading, 
    isError: isQuotationsError, 
    error: quotationsError 
  } = useGetQuotationsQuery({ page: 0, size: 1000 }, { refetchOnMountOrArgChange: true });

  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(
    null,
  );



  const [items, setItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotationNo, setQuotationNo] = useState<number | null>(null);
  
  useEffect(() => {
    if (quotationsData) {
      console.log("Quotations Data (Client-Side Calc):", quotationsData); // Debugging
      
      const content = Array.isArray(quotationsData.content) ? quotationsData.content : [];
      let maxId = 0;
      
      if (content.length > 0) {
        maxId = Math.max(...content.map((q: any) => {
             // 1. Try to use quotationNo if it's a number
             let val = Number(q.quotationNo);
             
             // 2. If it's a string like "QUO-0005", extract the number
             if (isNaN(val) && typeof q.quotationNo === 'string') {
                const match = q.quotationNo.match(/(\d+)$/);
                if (match) {
                  val = Number(match[1]);
                }
             }

             // 3. If still invalid, fallback to ID (safest bet for auto-increment)
             if (isNaN(val) || val === 0) {
                val = Number(q.id) || 0;
             }
             
             return val;
        }));
      }

      const nextId = maxId + 1;
      console.log("Max ID found:", maxId, "Next ID:", nextId); // Debugging
      setQuotationNo(nextId);
    } else if (isQuotationsError) {
      console.error("Failed to fetch quotations:", quotationsError);
      setQuotationNo(1);
    }
  }, [quotationsData, isQuotationsError, quotationsError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuotationNo((prev) => (prev === null ? 1 : prev));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  
  // Load default settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("invoice_footer_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.defaultNote) setInvoiceNote(parsed.defaultNote);
        if (parsed.defaultTerms) setInvoiceTerms(parsed.defaultTerms);
      }
    }
  }, []);
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [expiryDate, setExpiryDate] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceTerms, setInvoiceTerms] = useState("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const handleAddProducts = (products: MyEventResponse[]) => {
    const newItems: Item[] = products.map((p) => ({
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
    field: "name" | "qty" | "phoneNumber" | "unitPrice",
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const qty = Number(value);
        return {
          ...item,
          qty,
          total: qty * item.unitPrice,
        };
      }),
    );
  };

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quotationNo === null) {
      toast({
        title: "Please wait",
        description: "Quotation number is being generated.",
        className: "bg-yellow-600 text-white",
      });
      return;
    }

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

    try {
      // if (!user) {
      //   toast({
      //     title: "Not logged in",
      //     description: "Please log in to create a quotation.",
      //     className: "bg-red-600 text-white",
      //   });
      //   return;
      // }

      // const userId = user.uuid;

      const body: QuotationCreateRequest = {
        userId: 1,
        clientId: selectedClient.id,
        invoiceId: 0, // optional
        quotationNo, // Send number
        quotationDate: new Date(issueDate).toISOString(),
        quotationExpire: expiryDate
          ? new Date(expiryDate).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // default +7 days
        issueDate,
        expiryDate,
        status:"PENDING",
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          unitPrice: item.unitPrice,
          subtotal: item.total,
        })),
      };

      console.log("Creating Quotation with Body:", body); // Debugging check payload

      const result = await createQuotation(body).unwrap();
      console.log("Create Quotation Result:", result); // Debugging

      if (result) {
        toast({
          title: "Quotation Created",
          description: `QUO-${String(result.quotationNo || quotationNo).padStart(4, "0")} created successfully!`,
          className: "bg-green-600 text-white",
        });
        // If result.id is missing, we can't redirect to the specific ID
        router.push(result.id ? `/quotation/${result.id}` : "/quotation");
      } else {
        // Fallback if result is undefined but no error thrown
        toast({
            title: "Quotation Created",
            description: "Quotation created successfully (No checks)",
            className: "bg-green-600 text-white",
        });
         router.push("/quotation");
      }

    } catch (err) {
      console.error("Error creating quotation (object):", err);
      console.error("Error creating quotation (JSON):", JSON.stringify(err, null, 2));
      toast({
        title: "Error",
        description: "Failed to create quotation. Check console for details.",
        className: "bg-red-600 text-white",
      });
    }
  };

  return (
    <div className="flex justify-center space-x-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl space-y-8 rounded-xl bg-white p-8"
      >
        <header className="flex items-center justify-between border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800">Quotation</h1>
          <div className="text-sm">
            <p className="text-gray-500">Quotation No.</p>
            <p className="font-semibold text-gray-700">
               {quotationNo !== null ? `QUO-${String(quotationNo).padStart(4, "0")}` : "Loading..."}
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
          disabled={quotationNo === null}
          className={`w-full rounded-lg py-3 text-lg font-semibold text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            quotationNo === null
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {quotationNo === null ? "Generating Quotation No..." : "Create Quotation"}
        </button>
      </form>

      {/* Invoice Settings Sidebar (Right Column) - Based on your image's style */}
      <div className="sticky top-6 space-y-6 lg:col-span-1">
        {/* Top action buttons section */}
        <div className="space-y-3 rounded-lg bg-white p-4">
          <button className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700">
            <span className="mr-2">+</span> Preview and send
          </button>
          <div
            onClick={handleSubmit}
            className="flex w-full items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            <DownloadPDFButton
              quotation={{
                quotationNo: quotationNo || "",
                issueDate,
                expiryDate,
                items: items.map((item) => ({
                  id: item.id,
                  uuid: item.uuid,
                  name: item.name,
                  price: item.unitPrice,
                  image_url: "", // default
                  status: "IN_STOCK", // "IN_STOCK" | "LOW_STOCK" | "OUT_STOCK"
                  productTypeId: 0,
                  productTypeName: "",
                  stockQuantity: 0,
                  low_stock: 0,
                  userId: 0,
                  currency_type: "USD",
                })),
                amount: items.reduce((sum, i) => sum + i.total, 0),
                notes: invoiceNote,
                terms: invoiceTerms,
              }}
              client={selectedClient}
              taxRate={0}
              // user={undefined}
            />
          </div>
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
      />
    </div>
  );
}