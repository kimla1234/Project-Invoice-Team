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

import { MyEventResponse } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateProductMutation,
  usePostImageMutation,
} from "@/redux/service/products";

const currencyOptions: ("USD" | "KHR")[] = ["USD", "KHR"];

export default function CreateProducts() {
  // Inside CreateProducts component...
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"USD" | "KHR">("USD");
  const [postImage, { isLoading: isUploading }] = usePostImageMutation();

  // Form state
  const [productName, setProductName] = useState("");

  const [unitPrice, setUnitPrice] = useState(0);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Maximum size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string); // show preview immediately
    };
    reader.readAsDataURL(file);

    // ✅ Upload image to server
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await postImage(formData).unwrap();
      // response example:
      // { name, contentType, uri, size, extension }

      // Save the backend URI to be sent in create product
      setImagePreview(response.uri); // overwrite preview with backend URI
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload image. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Map local state to API requirements
    const payload = {
      name: productName,
      image_url: imagePreview || "/images/default.png", // Match backend key
      price: unitPrice, // Match backend key
      currency_type: currency,
      productTypeId: 1, // Hardcoded or from a select
      quantity: stock, // Match backend key
      low_stock: lowStockThreshold,
      description: description,
    };

    try {
      await createProduct(payload).unwrap();

      toast({
        title: "Success!",
        description: `${productName} created successfully.`,
        className: "bg-green-600 text-white",
      });

      router.push("/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
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

              {/* Price */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Unit Price */}
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
                    className="w-full rounded-lg border p-2"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="mb-1.5 block font-medium">Currency</label>
                  <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
                    <DropdownTrigger className="w-full">
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpen(!isOpen);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between rounded-lg border p-2"
                      >
                        {currency}
                        <ChevronUpIcon
                          className={cn(
                            "h-[18px] w-[18px] rotate-180 transition-transform",
                            isOpen && "rotate-0",
                          )}
                        />
                      </div>
                    </DropdownTrigger>

                    <DropdownContent
                      align="start"
                      className="z-50 mt-1 w-full space-y-2 border bg-white p-2"
                    >
                      {currencyOptions.map((cur) => (
                        <div
                          key={cur}
                          onClick={() => {
                            setCurrency(cur);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-gray-100",
                            currency === cur && "bg-gray-100 font-medium",
                          )}
                        >
                          {cur}
                        </div>
                      ))}
                    </DropdownContent>
                  </Dropdown>
                </div>
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
                    // Use parseInt to ensure it's a number, not a string
                    setLowStockThreshold(val === "" ? 0 : parseInt(val, 10));
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

            {/* Product Image */}
            <div>
              <label className="mb-2 block font-medium">Product Image</label>

              <div className="relative flex h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    <div className="mb-2 text-lg">⬆️</div>
                    <p className="font-medium">Upload product images</p>
                    <p className="text-xs">
                      Drag & drop or click to browse <br />
                      JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>

              {/* Guidelines */}
              <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <ul className="list-disc space-y-1 pl-4">
                  <li>Use high-quality images (min 800×800px)</li>
                  <li>First image will be primary product image</li>
                  <li>Use clean background & good lighting</li>
                </ul>
              </div>
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
