"use client";

import React, { useEffect, useRef, useState } from "react";
import { DropdownSelect } from "@/components/ui/DropdownSelect";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "business_form_data";

export default function Invoice() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  const [formData, setFormData] = useState({
    vatTIN: "",
    paymentLink: "",
    type: "",
    businessSize: "",
    paymentMethod: "",
    companyLogo: "" as string | null,
  });

  // 🔹 Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
    }
    setIsInitialized(true);
  }, []);

  // 🔹 Auto-save to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isInitialized]);

  // 🔹 Handlers
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Upload image only");

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, companyLogo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    toast({
      title: "Business Saved",
      description: "Your business info has been saved ✅",
      className: "bg-green-600 text-white",
      duration: 3000,
    });
  };

  if (!isInitialized) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full rounded-md bg-white text-slate-700">
      <h2 className="text-xl mb-2 font-semibold text-gray-500">
        Business Information
      </h2>
      <p className="mb-6 text-gray-500"> Business information is used to identify your business and to generate invoices. </p>

      <div className="mb-6 flex items-start gap-6">
        <div
          onClick={handleUploadClick}
          className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-md border border-dashed text-slate-400 hover:bg-slate-50"
        >
          {formData.companyLogo ? (
            <img
              src={formData.companyLogo}
              alt="KHQR Preview"
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <span className="text-sm">Upload KHQR</span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        <div>
          <p className="font-medium">Optionally set logo</p>
          <button
            type="button"
            onClick={handleUploadClick}
            className="mt-3 rounded-md border px-4 py-2 text-sm hover:bg-slate-50"
          >
            Upload KHQR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">VAT TIN</label>
          <input
            type="text"
            placeholder="####"
            value={formData.vatTIN}
            onChange={(e) => handleChange("vatTIN", e.target.value)}
            className="w-full rounded-md  bg-slate-100 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block  text-sm font-medium">Type</label>
          <DropdownSelect
            value={formData.type}
            onChange={(val) => handleChange("type", val)}
            placeholder="Select type"
            options={[
              { label: "Wholesale", value: "wholesale" },
              { label: "Retail", value: "retail" },
            ]}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Business Size</label>
          <DropdownSelect
            value={formData.businessSize}
            onChange={(val) => handleChange("businessSize", val)}
            placeholder="Select size"
            options={[
              { label: "1 to 2", value: "1-2" },
              { label: "2 to 5", value: "2-5" },
              { label: "5+", value: "5+" },
            ]}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Payment Method</label>
          <DropdownSelect
            value={formData.paymentMethod}
            onChange={(val) => handleChange("paymentMethod", val)}
            placeholder="Select payment"
            options={[
              { label: "Bank Transfer", value: "bank" },
              { label: "Cash", value: "cash" },
            ]}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Payment Link</label>
          <input
            type="text"
            value={formData.paymentLink}
            placeholder="https://payway.aba.com/####"
            onChange={(e) => handleChange("paymentLink", e.target.value)}
            className="w-full rounded-md bg-slate-100 px-3 py-2 outline-none focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-slate-400"> Just paste your ABA link here, we will handle the rest. </p>
        </div>
      </div>

      <div className="mt-7 text-end">
        <button
          onClick={handleSave}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Update Business
        </button>
      </div>
    </div>
  );
}
