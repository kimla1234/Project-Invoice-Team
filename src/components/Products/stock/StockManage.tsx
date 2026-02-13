"use client";

import { MyEventResponse } from "@/types/product";
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
  FiArrowUpRight,
} from "react-icons/fi";
import { useToast } from "@/hooks/use-toast";

import { PaginationControls } from "@/components/ui/pagination-controls";
import StockManageSkeleton from "@/components/skeletons/StockManageSkeleton";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { addOutOfStockNotification } from "@/utils/notifications";
import {
  useGetProductsByUuidQuery,
  useGetStockMovementQuery,
  useUpdateProductMutation,
  useUpdateStockMutation,
} from "@/redux/service/products";
import Image from "next/image";

interface StockManageProps {
  productId: string;
}

type MovementType = "IN" | "OUT" | "ADJUST";

interface Movement {
  productUuid: string;
  type: MovementType;
  quantity: number;
  note?: string;
  created_at: string;
}

export default function StockManage({ productId }: StockManageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [type, setType] = useState<MovementType>("IN");
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [note, setNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // RTK Query
  const {
    data: productData,
    isLoading,
    isError,
  } = useGetProductsByUuidQuery(productId);
  const { data: movementData, isLoading: movementLoading } =
    useGetStockMovementQuery(productId);

  const [updateProduct] = useUpdateProductMutation();
  const [updateStock] = useUpdateStockMutation();
  const [product, setProduct] = useState<MyEventResponse | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [currentStock, setCurrentStock] = useState(0);

  // Sync RTK Query data to local state
  useEffect(() => {
    if (productData) {
      setProduct(productData);
      setCurrentStock(productData.stockQuantity || 0);
    }
  }, [productData]);

  useEffect(() => {
    if (movementData) {
      setMovements(movementData);
    }
  }, [movementData]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "in") setType("IN");
    if (action === "out") setType("OUT");
    if (action === "adjust") setType("ADJUST");
  }, [searchParams]);

  const newStockInHand = useMemo(() => {
    if (type === "IN") return currentStock + adjustmentValue;
    if (type === "OUT") return Math.max(currentStock - adjustmentValue, 0);
    if (type === "ADJUST") return Math.max(adjustmentValue, 0);
    return currentStock;
  }, [currentStock, adjustmentValue, type]);

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

    try {
      const response = await updateStock({
        productUuid: product!.uuid,
        quantity: adjustmentValue,
        type,
        note,
      }).unwrap();

      // Ensure movements is always an array
      setMovements(response.movements ?? []);
      setCurrentStock(response.stockQuantity ?? currentStock);

      setAdjustmentValue(0);
      setNote("");

      if ((response.stockQuantity ?? 0) === 0)
        addOutOfStockNotification(product!.name);

      toast({
        title: "Stock Updated",
        description: `Stock ${type} successful`,
        className: "bg-green-600 text-white",
      });
    } catch (err: any) {
      console.error("Update stock error:", err);
      const errorMessage =
        err?.data?.message || err?.error || "Failed to update stock";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRequestDelete = (uuid: string) => setDeleteId(uuid);

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    const filtered = movements.filter((m) => m.productUuid !== deleteId);

    setMovements(filtered);
    setDeleteId(null);

    if (product) {
      try {
        await updateProduct({
          uuid: product.id.toString(),
          body: { movements: filtered },
        }).unwrap();
        toast({
          title: "Deleted",
          description: "Stock movement removed",
          className: "bg-red-600 text-white",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete movement",
          variant: "destructive",
        });
      }
    }
  };

  const totalPages = Math.ceil(movements.length / rowsPerPage);
  const currentMovements = useMemo(
    () =>
      movements.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage,
      ),
    [currentPage, rowsPerPage, movements],
  );

  if (isLoading) return <StockManageSkeleton />;
  if (isError) return <p>Error loading product</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="flex w-full justify-center p-4 md:p-10 dark:bg-gray-900">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="rounded-lg border bg-white p-2 dark:bg-gray-800 self-start">
            <h3 className="font-bold text-gray-900 dark:text-gray-300">
              Manage Stock
            </h3>
          </div>
          <Link
            href="/products"
            className="flex items-center justify-center rounded-lg border bg-white p-2 font-medium text-purple-600 hover:text-red-400 transition-all active:scale-95"
          >
            <FiSkipBack className="mr-2 h-5 w-5" />
            Back to Products
          </Link>
        </div>

        {/* Product Info */}
        <div className="rounded-xl  border bg-white p-4 md:p-6 shadow-sm dark:bg-gray-800">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 sm:items-start">
              <div className="w-20 h-20 mx-auto sm:mx-0 shrink-0">
                <Image
                  unoptimized
                  src={product.image_url || "/image.png"}
                  alt="image"
                  width={1000}
                  height={1000}
                  className="object-cover w-full h-full rounded-md"
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <div
                  className="text-sm text-gray-500 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: product.description || "-",
                  }}
                />
                <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
            <span className="self-center sm:self-start rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              {product.productTypeName}
            </span>
          </div>
        </div>

        {/* Action Form */}
        <div className="space-y-6 rounded-xl border bg-white p-4 md:p-6 shadow-sm dark:bg-gray-800">
          {/* Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Type
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
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
                label="Adjustment"
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {type === "IN"
                  ? "Add Stock"
                  : type === "OUT"
                    ? "Remove Stock"
                    : "Adjust Stock"}{" "}
                <span className="text-purple-600">(Current: {currentStock})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {type === "OUT" ? "-" : "+"}
                </span>
                <input
                  type="number"
                  value={adjustmentValue || ""} 
                  onChange={(e) => {
                    let value = Number(e.target.value);
                    if (isNaN(value)) value = 0;
                    if (value < 0) value = 0;
                    if (type === "OUT" && value > currentStock) {
                      value = currentStock;
                    }
                    setAdjustmentValue(value);
                  }}
                  className="w-full rounded-lg border border-gray-200 p-2.5 pl-8 outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
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
              className="h-24 w-full rounded-lg border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <button
            onClick={handleCreateMovement}
            disabled={adjustmentValue === 0}
            className="w-full rounded-lg bg-purple-600 py-3.5 font-bold text-white transition hover:bg-purple-700 disabled:opacity-50 active:scale-[0.98]"
          >
            Create Movement
          </button>
        </div>

        {/* Movement History */}
        <div className="rounded-xl border bg-white p-4 md:p-6 shadow-sm dark:bg-gray-800">
          <h3 className="text-lg font-bold">Stock Movements</h3>
          <p className="mb-4 text-sm text-gray-500">
            History of inventory changes.
          </p>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {currentMovements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No stock movements yet.</p>
            ) : (
              currentMovements.map((m, index) => (
                <div
                  key={`${m.productUuid}-${index}`}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`rounded-full p-2 ${m.type === "OUT" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                      {m.type === "OUT" ? <FiArrowUpRight size={18} /> : <FiArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-tight">{`STOCK ${m.type}`}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {new Date(m.created_at).toLocaleDateString("en-GB").replace(/\//g, "-")} 
                        {" "}{new Date(m.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                      {m.note && <p className="text-xs text-gray-400 italic mt-0.5">{m.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-base sm:text-lg font-bold ${m.type === "OUT" ? "text-red-600" : "text-green-600"}`}>
                      {m.type === "OUT" ? `-${m.quantity}` : `+${m.quantity}`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Container */}
          <div className="mt-6 pt-4 border-t dark:border-gray-700 overflow-x-auto">
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
          ? "border-purple-600 bg-purple-50 text-purple-600 ring-2 ring-purple-100 dark:bg-purple-900/20"
          : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
      }`}
    >
      <span className="mb-2 text-xl">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
