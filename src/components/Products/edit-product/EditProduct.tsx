// components/Products/edit-product/EditProduct.tsx
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiSkipBack } from "react-icons/fi";
import { Edit2, Plus, Minus, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { GrSubtractCircle } from "react-icons/gr";
import { MyEventResponse } from "@/types/product";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useToast } from "@/hooks/use-toast";
import EditProductSkeleton from "@/components/skeletons/EditProductSkeleton";
import { HiOutlinePhoto } from "react-icons/hi2";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import {
  useDeleteProductMutation,
  useGetProductsByUuidQuery,
  useGetProductsTypeQuery,
  usePostImageMutation,
  useUpdateProductMutation,
} from "@/redux/service/products";
import { set } from "idb-keyval";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateProductTypeForm } from "../CreateProductTypeForm";
import { BiAddToQueue } from "react-icons/bi";
import Image from "next/image";

interface EditProductProps {
  productId: string;
}

export default function EditProduct({ productId }: EditProductProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toast } = useToast();

  const [stockAction, setStockAction] = useState<
    "in" | "out" | "adjust" | null
  >(null);

  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [currency_type, setCurrency_type] = useState("USD");
  const currencyOptions = ["USD", "KHR"];
  const [image, setImage] = useState<string>("");

  const [unitPrice, setUnitPrice] = useState(0);
  const [stockTracked, setStockTracked] = useState(false);
  const [openingStock, setOpeningStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(0);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string>(""); // For the backend string
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For UI only
  const options: ("Product" | "Service")[] = ["Product", "Service"];
  const [updateProductMutation] = useUpdateProductMutation();
  const [deleteProductMutation] = useDeleteProductMutation();

  // Fetch product by id
  const { data: product, isLoading } = useGetProductsByUuidQuery(productId);
  const [postImage, { isLoading: isUploading }] = usePostImageMutation();

  const { data: typesResponse } = useGetProductsTypeQuery();
  const productTypes = typesResponse?.data || [];
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(
    undefined,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (!product) return;

    setProductName(product.name);
    setUnitPrice(product.price);
    setImage(product.image_url ?? "");
    setOpeningStock(product.stockQuantity ?? 0);
    setLowStockThreshold(product.low_stock ?? 0);
    setDescription(product.description ?? "");
    setCurrency_type(product.currency_type ?? "USD");
    setSelectedTypeId(product.productTypeId ?? undefined);
    setImageUrl(product.image_url);
    setImagePreview(product.image_url);
  }, [product]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await postImage(formData).unwrap();
      setImageUrl(response.uri);
    } catch (error) {
      toast({ title: "Upload Failed", variant: "destructive" });
    }
  };

  // Update product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProductMutation({
        uuid: productId,
        body: {
          name: productName,
          price: unitPrice,
          image_url: imageUrl,
          stockQuantity: openingStock,
          low_stock: lowStockThreshold,
          description: description,
          currency_type: currency_type,
          productTypeId: selectedTypeId,
        },
      }).unwrap();

      toast({
        title: "Product Updated",
        description: "Changes saved successfully",
        className: "bg-green-600 text-white",
      });

      router.push("/products");
    } catch {
      toast({
        title: "Update Failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProductMutation(productId).unwrap();

      toast({
        title: "Product deleted",
        description: "The product has been removed successfully.",
        className: "bg-green-600 text-white",
        //duration: 3000,
      });

      router.push("/products");
    } catch {
      toast({
        title: "Deletion Failed",
        variant: "destructive",
      });
    }
  };

  const handleManageStock = (action: "in" | "out" | "adjust") => {
    router.push(`/products/${productId}/stocks?action=${action}`);
  };

  if (isLoading) {
    return <EditProductSkeleton />;
  }

  if (!product) {
    return <div className="p-10">Product not found</div>;
  }

  return (

<div className="flex w-full justify-center  md:p-10">
  <div className="w-full max-w-4xl space-y-4">
    

    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="rounded-lg border bg-white p-2 dark:bg-gray-800 self-start">
        <h3 className="font-bold text-gray-900 dark:text-gray-300">
          Edit Product
        </h3>
      </div>

      <Link
        href="/products"
        className="flex items-center justify-center rounded-lg border bg-white p-2 font-medium text-primary hover:text-red-400 transition-all active:scale-95"
      >
        <FiSkipBack className="mr-2 h-5 w-5" />
        Back to Products
      </Link>
    </div>

    {/* Form Card: កែ padding ឱ្យតូចជាងមុនបន្តិចលើ mobile (p-4) */}
    <div className="rounded-md border bg-white p-4 md:p-7 dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Name + Price: ប្តូរពី md:grid-cols-2 មកជា lg:grid-cols-2 ដើម្បីកុំឱ្យចង្អៀតលើ Tablet */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-medium">Product Name</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Prices Grid: បំបែកជា ២ កឡោនជានិច្ច ទោះលើទូរស័ព្ទក៏ដោយព្រោះវាខ្លី */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-medium">Unit Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice === 0 ? "" : unitPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  const numericValue = val === "" ? 0 : parseFloat(val);
                  setUnitPrice(Math.max(0, numericValue));
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
                placeholder="0.00"
                className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    {currency_type}
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
                  className="z-50 mt-1 w-full space-y-1 border bg-white p-2"
                >
                  {currencyOptions.map((cur) => (
                    <div
                      key={cur}
                      onClick={() => {
                        setCurrency_type(cur);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-gray-100",
                        currency_type === cur && "bg-gray-100 font-medium",
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

        {/* Image Section: រៀបឱ្យបញ្ឈរលើ Mobile (flex-col) និង បដេកលើ PC (flex-row) */}
        <div>
          <label className="mb-1.5 block font-medium">Product Image</label>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border bg-gray-50 md:h-40 md:w-40">
              {imagePreview ? (
                <Image
                  unoptimized
                  src={imagePreview}
                  alt="Product Image"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <HiOutlinePhoto className="text-4xl" />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                <HiOutlinePhoto className="text-lg" />
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400">JPG, PNG up to 2MB</p>
            </div>
          </div>
        </div>

        {/* Product Type Section */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="font-medium">Product Type</label>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-100 active:scale-95"
                >
                  <BiAddToQueue className="h-5 w-5" />
                  Add New Type
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] bg-white">
                <SheetHeader>
                  <SheetTitle>Create Product Type</SheetTitle>
                  <SheetDescription>
                    Add a new category for your products.
                  </SheetDescription>
                </SheetHeader>
                <CreateProductTypeForm
                  onSuccess={() => setIsSheetOpen(false)}
                />
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
                  "rounded-md border border-dashed px-3 py-1 text-xs md:text-sm font-medium transition-all",
                  selectedTypeId === type.id
                    ? "border-primary bg-primary text-white"
                    : "border-gray-400 bg-white text-slate-600 hover:border-primary hover:text-primary",
                )}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Description: ប្រើ max-w-full ដើម្បីកុំឱ្យ editor លយចេញក្រៅ */}
        <div className="max-w-full overflow-hidden">
          <label className="mb-1.5 block font-medium">Description</label>
          {product && (
            <RichTextEditor
              value={description || ""}
              onChange={setDescription}
            />
          )}
        </div>

        {/* Stock Tracking Options */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={stockTracked}
                onChange={(e) => setStockTracked(e.target.checked)}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="font-medium">Enable Stock Tracking</span>
            </label>
            <p className="pl-7 text-xs text-gray-500">
              Check this box to enable stock tracking for this item.
            </p>
          </div>

          {stockTracked && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Opening Stock</label>
                <input
                  type="number"
                  value={openingStock}
                  disabled
                  className="w-full rounded-lg border bg-gray-50 p-2 text-gray-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <input
                  type="text"
                  value={lowStockThreshold}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setLowStockThreshold(parseInt(val || "0", 10));
                    }
                  }}
                  className="w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Manage Stock: ប្តូរជា Grid ដើម្បីឱ្យប៊ូតុងស្មើគ្នាលើ Mobile */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Manage Stock</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleManageStock("in")}
              className="flex items-center justify-center gap-2 rounded-lg border bg-white py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <IoMdAddCircleOutline className="h-5 w-5" />
              Stock In
            </button>

            <button
              type="button"
              onClick={() => handleManageStock("out")}
              className="flex items-center justify-center gap-2 rounded-lg border bg-white py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <GrSubtractCircle className="h-5 w-5" />
              Stock Out
            </button>

            <button
              type="button"
              onClick={() => handleManageStock("adjust")}
              className="flex items-center justify-center gap-2 rounded-lg border bg-white py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <FaRegEdit className="h-5 w-5" />
              Adjustment
            </button>
          </div>
        </div>

        {/* Actions: ប្រើ flex-col-reverse ដើម្បីឱ្យប៊ូតុង Update នៅខាងលើលើ Mobile */}
        <div className="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:space-x-4">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full rounded-lg bg-red-100 py-3 font-medium text-red-600 transition hover:bg-red-200 sm:w-1/3"
          >
            Delete
          </button>

          <button
            type="submit"
            className="w-full flex-1 rounded-lg bg-primary py-3 font-medium text-white shadow-lg transition hover:opacity-90 active:scale-[0.98]"
          >
            Update Product
          </button>
        </div>

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
