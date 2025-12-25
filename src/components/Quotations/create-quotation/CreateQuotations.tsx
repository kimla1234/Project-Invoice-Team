"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ProductData } from "@/types/product";
import { ClientData } from "@/types/client";
import { getProductsTableData } from "@/components/Tables/fetch";
import { mockClients } from "@/components/Tables/clients";

// --------------------
// Types
// --------------------
type Item = {
  id: number;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
};

// --------------------
// Product Modal
// --------------------
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Full page overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative z-50 max-h-[80vh] w-[600px] overflow-y-auto rounded-lg border bg-white p-4 shadow-lg">
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
                className={`flex cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-100 ${
                  selectedProducts.has(p.id) ? "bg-blue-100" : ""
                }`}
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

// --------------------
// CreateQuotation Component
// --------------------
export default function CreateQuotation() {
  const router = useRouter();
  const { toast } = useToast();

  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotationNo, setQuotationNo] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  // Fetch clients
  useEffect(() => {
    setClients(mockClients);
  }, []);

  // Generate dynamic Quotation No on load
  useEffect(() => {
    const oldQuotations = JSON.parse(
      localStorage.getItem("quotations") || "[]",
    );
    const maxId =
      oldQuotations.length > 0
        ? Math.max(...oldQuotations.map((q: any) => q.id))
        : 0;
    setQuotationNo(`QUO-${String(maxId + 1).padStart(4, "0")}`);
  }, []);

  // Add products
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

  // Handle item changes
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

  // Submit quotation
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

    if (items.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one item.",
        className: "bg-red-600 text-white",
        duration: 3000,
      });
      return;
    }

    const oldQuotations = JSON.parse(
      localStorage.getItem("quotations") || "[]",
    );
    const maxId =
      oldQuotations.length > 0
        ? Math.max(...oldQuotations.map((q: any) => q.id))
        : 0;
    const newId = maxId + 1;

    const newQuotation = {
      id: newId,
      quotationNo: `QUO-${String(newId).padStart(4, "0")}`,
      client: selectedClient,
      issueDate,
      items,
      amount: items.reduce((sum, i) => sum + i.total, 0),
    };

    localStorage.setItem(
      "quotations",
      JSON.stringify([...oldQuotations, newQuotation]),
    );

    toast({
      title: "Quotation Created",
      description: `${newQuotation.quotationNo} created successfully!`,
      className: "bg-green-600 text-white",
      duration: 3000,
    });

    // Reset form
    setItems([]);
    setSelectedClient(null);
    setQuotationNo(`QUO-${String(newId + 1).padStart(4, "0")}`);
    setIssueDate(new Date().toISOString().slice(0, 10));
    router.push("/quotation");
  };

  return (
    <div className="p-10">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-white p-6"
      >
        {/* Client */}
        <div>
          <label className="mb-1 block font-medium">Select Client</label>
          <select
            value={selectedClient?.id ?? ""}
            onChange={(e) =>
              setSelectedClient(
                clients.find((c) => c.id === Number(e.target.value)) ?? null,
              )
            }
            className="w-full rounded border p-2"
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quotation No & Date */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium">Quotation No</label>
            <input
              type="text"
              value={quotationNo}
              readOnly
              className="w-full rounded border bg-gray-100 p-2"
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">Issue Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded border p-4">
          <div className="mb-2 flex justify-between">
            <h3 className="font-semibold">Items</h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded bg-primary px-3 py-1 text-white hover:bg-primary/90"
            >
              Add Items
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">No</th>
                <th className="px-2 py-1 text-left">Product Name</th>
                <th className="px-2 py-1 text-left">Qty</th>
                <th className="px-2 py-1 text-left">Unit Price</th>
                <th className="px-2 py-1 text-left">Total</th>
                <th className="px-2 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-2 py-1">{index + 1}</td>
                  <td className="px-2 py-1">
                    <input
                      className="w-full p-1"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      className="w-full p-1"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, "qty", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      className="w-full p-1"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, "unitPrice", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-2 py-1">{item.total.toFixed(2)}</td>
                  <td className="px-2 py-1">
                    <button
                      type="button"
                      className="rounded bg-red-500 px-2 py-1 text-white"
                      onClick={() => removeItem(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          className="w-full rounded bg-primary py-3 text-white hover:bg-primary/90"
        >
          Create Quotation
        </button>
      </form>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectProducts={handleAddProducts}
      />
    </div>
  );
}
