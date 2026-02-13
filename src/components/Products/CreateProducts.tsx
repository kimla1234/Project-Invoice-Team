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
import { BiAddToQueue } from "react-icons/bi";
import { MyEventResponse } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateProductMutation,
  useGetProductsTypeQuery,
  usePostImageMutation,
} from "@/redux/service/products";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { CreateProductTypeForm } from "./CreateProductTypeForm";

const currencyOptions: ("USD" | "KHR")[] = ["USD", "KHR"];

export default function CreateProducts() {
  // Inside CreateProducts component...
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: typesResponse } = useGetProductsTypeQuery();
  const productTypes = typesResponse?.data || []; // Extract from BaseMessage wrapper
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
      image_url: imagePreview , // Match backend key
      price: unitPrice, // Match backend key
      currency_type: currency,
      quantity: stock, // Match backend key
      low_stock: lowStockThreshold,
      description: description,
      productTypeId: selectedTypeId,
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

<div className="flex h-auto w-full justify-center  md:p-10">
  {/* Changed w-[70%] to w-full with a max-width for desktop readability */}
  <div className="w-full max-w-4xl space-y-4">
    
    {/* Header: Stack on mobile, row on tablet+ */}
    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="rounded-lg border bg-white p-2 dark:bg-gray-800">
        <h3 className="text-sm md:text-md font-bold text-gray-900 dark:text-gray-300">
          Create New Product or Service
        </h3>
      </div>
      <Link
        href="/products"
        className="text-sm flex items-center justify-center rounded-lg border bg-white p-2 font-medium text-purple-600 hover:text-red-400 dark:hover:text-blue-400 sm:w-auto"
      >
        <FiSkipBack className="mr-2 h-5 w-5" />
        Back to Products
      </Link>
    </div>

    {/* Form Card: Reduced padding on mobile */}
    <div className="w-full rounded-md border bg-white p-4 md:p-7 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Row 1: Product Name & Type/Price Container */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Name */}
          <div className="w-full">
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
              <p className="mt-1 text-sm text-red-500">{errors.productName}</p>
            )}
          </div>

          {/* Unit Price & Currency Group */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-medium">Unit Price</label>
              <input
                type="number"
                min="0"
                value={unitPrice === 0 ? "" : unitPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setUnitPrice(val === "" ? 0 : parseFloat(val));
                }}
                placeholder="0.00"
                className="w-full rounded-lg border p-2"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-medium">Currency</label>
              <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
                <DropdownTrigger className="w-full">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(!isOpen);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    {currency}
                    <ChevronUpIcon className={cn("h-4 w-4 rotate-180 transition-transform", isOpen && "rotate-0")} />
                  </div>
                </DropdownTrigger>
                <DropdownContent align="start" className="z-50 mt-1 w-full border bg-white p-1">
                  {currencyOptions.map((cur) => (
                    <div key={cur} onClick={() => { setCurrency(cur); setIsOpen(false); }} className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100">
                      {cur}
                    </div>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Row 2: Stock & Low Stock Threshold */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-medium">Stock</label>
            <input
              type="number"
              value={stock === 0 ? "" : stock}
              onChange={(e) => setStock(e.target.value === "" ? 0 : parseInt(e.target.value))}
              placeholder="0"
              className={cn("w-full rounded-lg border p-2", errors.stock && "border-red-500")}
            />
          </div>

          <div>
            <label className="mb-1.5 block font-medium">Low Stock Threshold</label>
            <input
              type="number"
              value={lowStockThreshold === 0 ? "" : lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value === "" ? 0 : parseInt(e.target.value))}
              placeholder="0"
              className={cn("w-full rounded-lg border p-2", errors.lowStockThreshold && "border-red-500")}
            />
          </div>
        </div>

        {/* Product Type Section */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label className="font-medium text-slate-700 dark:text-gray-300">Product Type</label>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button type="button" className="flex items-center border border-dashed gap-1 rounded-md bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-500 transition-all active:scale-95">
                  <BiAddToQueue className="h-4 w-4" />
                  Add New Type
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] bg-white">
                <SheetHeader>
                  <SheetTitle>Create Product Type</SheetTitle>
                </SheetHeader>
                <CreateProductTypeForm onSuccess={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-wrap gap-2">
            {productTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedTypeId(type.id)}
                className={cn(
                  "rounded-md border border-dashed px-3 py-1.5 text-xs md:text-sm font-medium transition-all",
                  selectedTypeId === type.id
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-300 bg-white text-slate-600 hover:border-purple-400",
                )}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Description & Rich Text (Ensure editor is responsive) */}
        <div className="w-full overflow-hidden">
          <label className="mb-1.5 block font-medium">Description</label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>

        {/* Image Upload Area */}
        <div className="w-full">
          <label className="mb-2 block font-medium">Product Image</label>
          <div className="relative flex min-h-[150px] md:h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 hover:bg-gray-100">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full max-h-[200px] w-auto rounded-lg object-contain" />
            ) : (
              <div className="text-center text-sm text-gray-500">
                <div className="mb-2 text-xl">⬆️</div>
                <p className="font-bold">Upload product images</p>
                <p className="text-xs hidden sm:block">JPG, PNG, GIF up to 10MB</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 cursor-pointer opacity-0" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-purple-600 py-3.5 font-bold text-white shadow-lg transition active:scale-[0.98] hover:bg-purple-700"
        >
          Save Product
        </button>
      </form>
    </div>
  </div>
</div>
  );
}
