// components/Products/edit-product/EditProduct.tsx
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiSkipBack } from "react-icons/fi";
import { Edit2, Plus, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { GrSubtractCircle } from "react-icons/gr";
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
import { HiOutlinePhoto } from "react-icons/hi2";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";

interface EditProductProps {
  productId: string;
}

export default function EditProduct({ productId }: EditProductProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [stockAction, setStockAction] = useState<
    "in" | "out" | "adjust" | null
  >(null);

  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const currencyOptions = ["USD", "KHR", "EUR"];
  const [image, setImage] = useState<string>(product?.image ?? "");

  const [unitPrice, setUnitPrice] = useState(0);
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
      //setProductType(data.type);
      setUnitPrice(data.unitPrice);
      setImage(data.image ?? "");
      setDescription(data.description ?? "");
      setStockTracked(data.stock !== undefined);
      setOpeningStock(data.stock ?? 0);
      setLowStockThreshold(data.lowStockThreshold ?? 0);
      setCurrency(data.currency ?? "USD"); // <- Add this
      setLoading(false);
    }

    fetchData();
  }, [productId]);

  // Update product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<ProductData> = {
      name: productName,
      currency,
      unitPrice,
      image,
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


  const handleManageStock = (action: "in" | "out" | "adjust") => {
  router.push(`/products/${productId}/stocks?action=${action}`);
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

              {/* Prices */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-medium">Unit Price</label>
                  <input
                    type="number"
                    value={unitPrice}
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

            <div>
              <label className="mb-1.5 block font-medium">Product Image</label>
              <div className="flex items-center gap-4">
                {image && (
                  <img
                    src={image}
                    alt="Product Image"
                    className="h-40 w-40 rounded-lg border object-cover"
                  />
                )}
                <div>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-gray-700 hover:bg-gray-200">
                    <HiOutlinePhoto className="text-xl" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImage(reader.result as string); // Save base64 string
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-sm text-gray-400">
                    JPG, PNG up to 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="">
              <label className="mb-1.5 block font-medium">Description</label>
              <RichTextEditor value={description} onChange={setDescription} />
            </div>

            {/* Stock */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={stockTracked}
                  onChange={(e) => setStockTracked(e.target.checked)}
                  placeholder="0"
                />
                Enable Stock Tracking
              </label>
              <label className="pl-6 text-sm">
                Check this box to enable stock tracking
              </label>
            </div>

            {stockTracked && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="space-y-2">
                    <div>Opening Stock</div>
                    <input
                      type="number"
                      placeholder="Opening Stock"
                      value={openingStock}
                      disabled
                      onChange={(e) => setOpeningStock(+e.target.value || 0)}
                      className="w-full rounded-lg border p-2"
                    />
                  </label>
                </div>
                <div>
                  <label className="space-y-2">
                    <div>Low Stock Threshold</div>
                    <input
                      type="number"
                      placeholder="Low Stock Threshold"
                      value={lowStockThreshold}
                      onChange={(e) =>
                        setLowStockThreshold(+e.target.value || 0)
                      }
                      className="w-full rounded-lg border p-2"
                    />
                  </label>
                </div>
              </div>
            )}
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">Manage Stock</h3>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleManageStock("in")}
                  className="flex-1 rounded-lg border bg-white py-3 text-center text-gray-800 hover:bg-gray-100"
                >
                  <IoMdAddCircleOutline className="mx-auto mb-1 h-5 w-5" />
                  Stock In
                </button>

                <button
                  type="button"
                  onClick={() => handleManageStock("out")}
                  className="flex-1 rounded-lg border bg-white py-3 text-center text-gray-800 hover:bg-gray-100"
                >
                  <GrSubtractCircle className="mx-auto mb-1 h-5 w-5" />
                  Stock Out
                </button>

                <button
                  type="button"
                  onClick={() => handleManageStock("adjust")}
                  className="flex-1 rounded-lg border bg-white py-3 text-center text-gray-800 hover:bg-gray-100"
                >
                  <FaRegEdit className="mx-auto mb-1 h-5 w-5" />
                  Stock Adjustment
                </button>
              </div>
            </div>

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
