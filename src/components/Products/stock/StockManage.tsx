"use client";

import { ProductData } from "@/types/product";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiSkipBack,
  FiPlusCircle,
  FiMinusCircle,
  FiEdit,
  FiArrowDownLeft,
  FiTrash2,
} from "react-icons/fi";
import { useToast } from "@/hooks/use-toast";
import { getProductById, updateProduct } from "@/components/Tables/fetch";
import { PaginationControls } from "@/components/ui/pagination-controls";
import StockManageSkeleton from "@/components/skeletons/StockManageSkeleton";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { addOutOfStockNotification } from "@/utils/notifications";

interface StockManageProps {
  productId: string;
}

type MovementType = "IN" | "OUT" | "ADJUST";

interface Movement {
  id: number;
  type: MovementType;
  quantity: number;
  note?: string;
  date: Date;
}

export default function StockManage({ productId }: StockManageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [productName, setProductName] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [stockTracked, setStockTracked] = useState(true);
  const [currentStock, setCurrentStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [movements, setMovements] = useState<Movement[]>([]);

  const [type, setType] = useState<MovementType>("IN");
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [note, setNote] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch product data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getProductById(productId);

      if (!data) {
        toast({
          title: "Product not found",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setProduct(data);
      setProductName(data.name || "");
      setUnitPrice(data.unitPrice || 0);
      setCurrency(data.currency || "USD");
      setImage(data.image || "");
      setDescription(data.description || "");
      setStockTracked(data.stock !== undefined && data.stock !== null);
      setCurrentStock(data.stock || 0);
      setLowStockThreshold(data.lowStockThreshold || 0);
      setMovements((data.movements as Movement[]) || []);
      setLoading(false);
    }

    fetchData();
  }, [productId, toast]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const action = searchParams.get("action");

    if (action === "in") setType("IN");
    if (action === "out") setType("OUT");
    if (action === "adjust") setType("ADJUST");
  }, [searchParams]);

  // Helper to calculate new stock
  const newStockInHand = useMemo(() => {
    if (type === "IN") return currentStock + adjustmentValue;
    if (type === "OUT") return Math.max(currentStock - adjustmentValue, 0);
    if (type === "ADJUST") return Math.max(adjustmentValue, 0);
    return currentStock;
  }, [currentStock, adjustmentValue, type]);

  // Handle creating stock movement
  const handleCreateMovement = async () => {
    if (adjustmentValue === 0) return;

    if (type === "OUT" && adjustmentValue > currentStock) {
      toast({
        title: "Error",
        description: "Cannot remove more than current stock",
        variant: "destructive",
      });
      return;
    }

    const movement: Movement = {
      id: Date.now(),
      type,
      quantity: adjustmentValue,
      note,
      date: new Date(),
    };

    const updatedStock = newStockInHand;
    const updatedMovements = [movement, ...movements];

    setMovements(updatedMovements);
    setCurrentStock(updatedStock);
    setAdjustmentValue(0);
    setNote("");

    if (product) {
      const updatedProduct: Partial<ProductData> = {
        stock: updatedStock,
        movements: updatedMovements,
      };

      await updateProduct(product.id.toString(), updatedProduct);

      const mergedProduct = { ...product, ...updatedProduct };
      setProduct(mergedProduct);

      // 🔔 OUT OF STOCK NOTIFICATION (HERE ONLY)
      if (mergedProduct.stock === 0) {
        addOutOfStockNotification(mergedProduct.name);
      }
    }

    toast({
      title: "Stock Updated",
      description: `Stock ${type} successful`,
      className: "bg-green-600 text-white",
    });
  };

  // Handle deleting a movement
  // 1. open modal
  const handleRequestDelete = (id: number) => {
    setDeleteId(id);
  };

  // 2. confirm delete
  const handleConfirmDelete = async () => {
    if (deleteId === null) return;

    const filtered = movements.filter((m) => m.id !== deleteId);
    setMovements(filtered);

    if (product) {
      await updateProduct(product.id.toString(), { movements: filtered });
      setProduct({ ...product, movements: filtered });
    }

    toast({
      title: "Deleted",
      description: "Stock movement removed",
      className: "bg-red-600 text-white",
    });

    setDeleteId(null);
  };

  const totalPages = Math.ceil(movements.length / rowsPerPage);
  const currentMovements = useMemo(() => {
    return movements.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage,
    );
  }, [currentPage, rowsPerPage, movements]);

  if (loading) return <StockManageSkeleton />;

  return (
    <div className="flex w-full justify-center p-10 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="rounded-lg border bg-white p-2 dark:bg-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-gray-300">
              Manage Stock
            </h3>
          </div>
          <Link
            href="/products"
            className="flex items-center rounded-lg border bg-white p-2 font-medium text-primary hover:text-red-400"
          >
            <FiSkipBack className="mr-2 h-5 w-5" />
            Back to Products
          </Link>
        </div>

        {/* Product Info */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {productName}
              </h3>
              <p className="text-sm text-gray-500">{description}</p>
              <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                ${unitPrice.toFixed(2)}
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              In Stock
            </span>
          </div>
        </div>

        {/* Action Form */}
        <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              <TypeButton
                active={type === "IN"}
                onClick={() => setType("IN")}
                icon={<FiPlusCircle />}
                label="Stock In"
              />
              <TypeButton
                active={type === "OUT"}
                onClick={() => setType("OUT")}
                icon={<FiMinusCircle />}
                label="Stock Out"
              />
              <TypeButton
                active={type === "ADJUST"}
                onClick={() => setType("ADJUST")}
                icon={<FiEdit />}
                label="Stock Adjustment"
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {type === "IN"
                  ? "Add Stock"
                  : type === "OUT"
                    ? "Remove Stock"
                    : "Adjust Stock"}{" "}
                (Current: {currentStock})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {type === "OUT" ? "-" : "+"}
                </span>
                <input
                  type="number"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 p-2.5 pl-8 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-500">
                New Stock in Hand
              </label>
              <input
                disabled
                value={newStockInHand}
                className="w-full rounded-lg border border-gray-100 bg-gray-50 p-2.5 text-gray-500 dark:bg-gray-900"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Note (optional)</label>
            <textarea
              placeholder="Enter note or remark..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-24 w-full rounded-lg border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <button
            onClick={handleCreateMovement}
            disabled={adjustmentValue === 0}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>

        {/* Movement History */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800">
          <h3 className="text-lg font-bold">Stock Movements</h3>
          <p className="mb-4 text-sm text-gray-500">
            History of inventory changes.
          </p>

          <div className="space-y-4">
            {currentMovements.length === 0 ? (
              <p className="text-sm text-gray-400">No stock movements yet.</p>
            ) : (
              currentMovements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-green-100 p-2 text-green-600">
                      <FiArrowDownLeft size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">{`${m.type} / Manual`}</p>
                      <p className="text-xs text-gray-400">
                        on {new Date(m.date).toLocaleString()}
                      </p>
                      {m.note && (
                        <p className="text-xs text-gray-400">{m.note}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-lg font-bold ${
                        m.type === "OUT" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {m.type === "OUT" ? `-${m.quantity}` : `+${m.quantity}`}
                    </span>
                    <button
                      onClick={() => handleRequestDelete(m.id)}
                      className="rounded-full bg-red-100 p-2 text-red-400 hover:text-red-600"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalItems={movements.length}
              availableRowsPerPage={[5, 10, 20]}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>
      <ConfirmDeleteModal
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// TypeButton Subcomponent
function TypeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-all ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100 dark:bg-blue-900/20"
          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
      }`}
    >
      <span className="mb-2 text-xl">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
