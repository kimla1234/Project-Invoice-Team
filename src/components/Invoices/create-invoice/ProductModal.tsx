"use client";

import { useState } from "react";
import { useCreateInvoiceMutation } from "@/redux/service/invoices";
import { useGetMyProductsQuery } from "@/redux/service/products";
import { useToast } from "@/hooks/use-toast";
import { InvoiceItemRequest } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Search, X, Check, UserCircle2 } from "lucide-react";
import { ClientData } from "@/types/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type Item = {
  productId: number;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
};

type ProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectProducts: (selected: any[]) => void;
};

type ClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientData[];
  onSelectClient: (client: ClientData) => void;
};

// Product selection modal
export const ProductModal = ({ isOpen, onClose, onSelectProducts }: ProductModalProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

  // Fetch products (you'll need to replace this with your actual product fetch)
  const { data: productsData = [], isLoading: loadingProducts } = useGetMyProductsQuery();

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedProducts(newSet);
  };

  const handleSubmit = () => {
    const selected = productsData.filter((p) => selectedProducts.has(p.id));
    onSelectProducts(selected);
    setSelectedProducts(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-50 max-h-[80vh] w-[600px] overflow-y-auto rounded-lg border bg-white p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Products</h2>
          <button onClick={onClose} className="font-bold text-red-500">X</button>
        </div>

        <input
          type="text"
          placeholder="Search product..."
          className="mb-3 w-full rounded border p-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loadingProducts ? (
          <div className="py-8 text-center text-gray-500">Loading products...</div>
        ) : (
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {productsData
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`flex cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-100 ${selectedProducts.has(p.id) ? "bg-blue-100" : ""}`}
                >
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <div className="text-sm text-gray-500">
                      ${p.price.toFixed(2)} • Stock: {p.stockQuantity}
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.has(p.id)} 
                    readOnly 
                    className="h-4 w-4"
                  />
                </div>
              ))
            }

            {productsData.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <p className="text-center text-gray-500">No products found</p>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="mt-3 w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Add Selected
        </button>
      </div>
    </div>
  );
}