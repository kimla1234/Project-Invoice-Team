// components/CreateProducts.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSkipBack } from "react-icons/fi";
import { Dropdown, DropdownContent, DropdownTrigger } from "../ui/dropdown";
import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import RichTextEditor from "../ui/RichTextEditor";
import { createProduct } from "../Tables/fetch";
import { ProductData } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

export default function CreateProducts() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast()
  // Form state
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<"Product" | "Service">(
    "Product",
  );
  const [unitPrice, setUnitPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [description, setDescription] = useState("");

  // Error state
  const [errors, setErrors] = useState({
    productName: "",
    unitPrice: "",
    cost: "",
    stock: "",
    lowStockThreshold: "",
  });

  const options: ("Product" | "Service")[] = ["Product", "Service"];

  const validateForm = () => {
    const newErrors = {
      productName: "",
      unitPrice: "",
      cost: "",
      stock: "",
      lowStockThreshold: "",
    };
    let isValid = true;

    if (!productName.trim()) {
      newErrors.productName = "Product Name is required.";
      isValid = false;
    }

    if (unitPrice < 0) {
      newErrors.unitPrice = "Unit Price cannot be negative.";
      isValid = false;
    }

    if (cost < 0) {
      newErrors.cost = "Cost cannot be negative.";
      isValid = false;
    }

    if (stock < 0) {
      newErrors.stock = "Stock cannot be negative.";
      isValid = false;
    }

    if (lowStockThreshold < 0) {
      newErrors.lowStockThreshold = "Low Stock Threshold cannot be negative.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newProduct: Partial<ProductData> = {
      name: productName,
      type: productType,
      unitPrice,
      cost,
      stock,
      lowStockThreshold,
      description,
    };

    const created = await createProduct(newProduct);

    if (created) {
      // 1. Show Success Toast
      toast({
        title: "Product Created",
        description: `${productName} has been added to your inventory.`,
        className: "bg-green-600 text-white", // Success styling
        duration: 3000,
      });

      // 2. Redirect
      router.push("/products");
    } else {
      // 3. Show Error Toast if creation fails
      toast({
        title: "Creation Failed",
        description:
          "There was an error creating the product. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex h-auto w-full justify-center p-10">
      <div className="w-[70%] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="rounded-lg border bg-white p-2 dark:bg-gray-800">
            <h3 className="text-md font-bold text-gray-900 dark:text-gray-300">
              Create New Product or Service
            </h3>
          </div>
          <Link
            href="/products"
            className="text-md flex items-center rounded-lg border bg-white p-2 font-medium text-primary hover:text-red-400 dark:hover:text-blue-400"
          >
            <FiSkipBack className="mr-2 h-5 w-5" />
            Back to Products
          </Link>
        </div>

        {/* Form */}
        <div className="w-full rounded-md border bg-white p-7 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name & Type */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-medium">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Input name"
                  className={cn(
                    "w-full rounded-lg border p-2",
                    errors.productName && "border-red-500",
                  )}
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.productName}
                  </p>
                )}
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

            {/* Row 2: Unit Price & Cost */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-medium">Unit Price</label>
                <input
                  type="number"
                  value={unitPrice === 0 ? "" : unitPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUnitPrice(val === "" ? 0 : parseFloat(val));
                  }}
                  placeholder="0.00"
                  className={cn(
                    "w-full rounded-lg border p-2",
                    errors.unitPrice && "border-red-500",
                  )}
                />
                {errors.unitPrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.unitPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block font-medium">Cost (COGS)</label>
                <input
                  type="number"
                  value={cost === 0 ? "" : cost}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCost(val === "" ? 0 : parseFloat(val));
                  }}
                  placeholder="0.00"
                  className={cn(
                    "w-full rounded-lg border p-2",
                    errors.cost && "border-red-500",
                  )}
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-500">{errors.cost}</p>
                )}
              </div>
            </div>

            {/* Row 3: Stock & Low Stock Threshold */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-medium">Stock</label>
                <input
                  type="number"
                  value={stock === 0 ? "" : stock}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStock(val === "" ? 0 : parseInt(val));
                  }}
                  placeholder="0"
                  className={cn(
                    "w-full rounded-lg border p-2",
                    errors.stock && "border-red-500",
                  )}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block font-medium">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={lowStockThreshold === 0 ? "" : lowStockThreshold}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLowStockThreshold(val === "" ? 0 : parseInt(val));
                  }}
                  placeholder="0"
                  className={cn(
                    "w-full rounded-lg border p-2",
                    errors.lowStockThreshold && "border-red-500",
                  )}
                />
                {errors.lowStockThreshold && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lowStockThreshold}
                  </p>
                )}
              </div>
            </div>

            {/* Row 4: Description */}
            <div>
              <label className="mb-1.5 block font-medium">Description</label>
              <RichTextEditor value={description} onChange={setDescription} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-3 font-medium text-white transition hover:bg-opacity-90"
            >
              Save Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
