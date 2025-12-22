// components/Products/edit-product/EditProduct.tsx
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiSkipBack } from "react-icons/fi";
import { Edit2, Plus, Minus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/ui/RichTextEditor";

import { ProductData } from "@/types/product";
import { useRouter } from "next/navigation";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/components/Tables/fetch";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useToast } from "@/hooks/use-toast";
import EditProductSkeleton from "@/components/skeletons/EditProductSkeleton";

interface EditProductProps {
  productId: string;
}

export default function EditProduct({ productId }: EditProductProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);

  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<"Product" | "Service">(
    "Product",
  );
  const [unitPrice, setUnitPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [description, setDescription] = useState("");
  const [stockTracked, setStockTracked] = useState(false);
  const [openingStock, setOpeningStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(0);

  const options: ("Product" | "Service")[] = ["Product", "Service"];

  // Fetch product by id
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getProductById(productId);

      if (!data) {
        setLoading(false);
        return;
      }

      setProduct(data);
      setProductName(data.name);
      setProductType(data.type);
      setUnitPrice(data.unitPrice);
      setCost(data.cost ?? 0);
      setDescription(data.description ?? "");
      setStockTracked(data.stock !== undefined);
      setOpeningStock(data.stock ?? 0);
      setLowStockThreshold(data.lowStockThreshold ?? 0);

      setLoading(false);
    }

    fetchData();
  }, [productId]);

  // Update product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<ProductData> = {
      name: productName,
      type: productType,
      unitPrice,
      cost,
      description,
      stock: stockTracked ? openingStock : undefined,
      lowStockThreshold,
    };

    const updated = await updateProduct(productId, payload);

    if (updated) {
      // Show Success Toast
      toast({
        title: "Product Updated",
        description: "Changes have been saved successfully.",
        className: "bg-green-600 text-white", // Green success styling
        duration: 3000,
      });

      router.push("/products");
    } else {
      // Show Error Toast
      toast({
        title: "Update Failed",
        description: "Could not save changes to the product.",
        variant: "destructive", // Red error styling
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    const success = await deleteProduct(productId);

    if (success) {
      // Show success toast before redirecting
      toast({
        title: "Product Deleted",
        description: "The product has been removed successfully.",
        variant: "default",
        className: "bg-green-600 text-white", // Success styling
        duration: 3000,
      });

      // Redirect to the products list
      router.push("/products");
    } else {
      // Show error toast
      toast({
        title: "Deletion Failed",
        description: "There was a problem deleting this product.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return <EditProductSkeleton />;
  }

  if (!product) {
    return <div className="p-10">Product not found</div>;
  }

  return (
    <div className="flex w-full justify-center p-10">
      <div className="w-[70%] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="rounded-lg border bg-white p-2 dark:bg-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-gray-300">
              Edit Product
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

        {/* Form */}
        <div className="rounded-md border bg-white p-7 dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name + Type */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-medium">Product Name</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-lg border p-2"
                />
              </div>

              {/* Product Type */}
              <div className="w-full">
                <label className="mb-1.5 block w-full font-medium">
                  Product Type
                </label>
                <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
                  <DropdownTrigger className="w-full">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                      }}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg border p-2 text-left"
                    >
                      {productType}
                      <ChevronUpIcon
                        className={cn(
                          "h-[18px] w-[18px] rotate-180 transition-transform",
                          isOpen && "rotate-0",
                        )}
                        strokeWidth={1.5}
                      />
                    </div>
                  </DropdownTrigger>
                  <DropdownContent
                    className="z-50 mt-1 w-full min-w-[var(--radix-dropdown-trigger-width)] space-y-2 border border-stroke bg-white p-3 shadow-sm dark:border-dark-3 dark:bg-gray-dark"
                    align="start"
                  >
                    {options.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setProductType(opt);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50",
                          productType === opt
                            ? "bg-gray-100 text-primary dark:bg-dark-3"
                            : "hover:slate-50 text-dark dark:text-dark-6 dark:hover:text-white",
                        )}
                      >
                        {opt}
                      </div>
                    ))}
                  </DropdownContent>
                </Dropdown>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-medium">Unit Price</label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(+e.target.value || 0)}
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-medium">Cost</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(+e.target.value || 0)}
                  className="w-full rounded-lg border p-2"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block font-medium">Description</label>
              <RichTextEditor value={description} onChange={setDescription} />
            </div>

            {/* Stock */}
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={stockTracked}
                onChange={(e) => setStockTracked(e.target.checked)}
              />
              Enable Stock Tracking
            </label>

            {stockTracked && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <input
                  type="number"
                  placeholder="Opening Stock"
                  value={openingStock}
                  onChange={(e) => setOpeningStock(+e.target.value || 0)}
                  className="rounded-lg border p-2"
                />
                <input
                  type="number"
                  placeholder="Low Stock Threshold"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(+e.target.value || 0)}
                  className="rounded-lg border p-2"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex w-full justify-between space-x-7 pt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full rounded-lg bg-red-100 px-6 py-3 font-medium text-red-600 transition hover:bg-red-200"
              >
                Delete
              </button>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-6 py-3 text-white"
              >
                Update
              </button>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
              open={showDeleteModal}
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={handleDelete}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
