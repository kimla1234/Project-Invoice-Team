"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Loader2, Save, Settings, UploadCloud } from "lucide-react";
import { AiOutlineInsertRowBelow } from "react-icons/ai";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
} from "@/redux/service/setting";
import Image from "next/image";
import { usePostImageMutation } from "@/redux/service/products";
import { useToast } from "@/hooks/use-toast";

export default function General() {
  // Currency states
  const [baseRate, setBaseRate] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("KHR");
  const [exchangeRate, setExchangeRate] = useState(4100);
  const [editorKey, setEditorKey] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  // Default terms & note
  const { toast } = useToast();
  const [defaultTerms, setDefaultTerms] = useState(
    "• Cost is Exclusive With Holding-Tax\n• Flexible Cost Depends on Customer Needs\n• 50% Deposit after agreement\n• Deposit amount is not refundable",
  );
  const [defaultNote, setDefaultNote] = useState(defaultTerms);

  // Signature files
  const [files, setFiles] = useState<File[]>([]);
  const { data: settings, isLoading, refetch } = useGetMySettingsQuery();
  const [updateMySettings, { isLoading: isSaving }] =
    useUpdateMySettingsMutation();
  const [postImage, { isLoading: isUploading }] = usePostImageMutation();
  // Signature / File states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // Load invoice footer & currency settings on mount
  useEffect(() => {
    if (!settings) return;

    setDefaultTerms(settings.invoiceFooter ?? "");
    setDefaultNote(settings.invoiceNote ?? "");

    // reset editor
    setEditorKey((prev) => prev + 1);
  }, [settings]);

  // Update currency settings
  const handleUpdateCurrency = () => {
    const currencySettings = {
      baseRate,
      fromCurrency,
      toCurrency,
      exchangeRate,
    };
    localStorage.setItem(
      "invoice_currency_settings",
      JSON.stringify(currencySettings),
    );
    alert("Currency settings saved locally!");
  };

  // Restore on page load
  useEffect(() => {
    const invoiceData = localStorage.getItem("invoice_footer_settings");
    if (invoiceData) {
      const parsed = JSON.parse(invoiceData);
      setDefaultTerms(parsed.defaultTerms || "");
      setDefaultNote(parsed.defaultNote || parsed.defaultTerms || "");

      // reset editor by changing key
      setEditorKey((prev) => prev + 1);
    }
  }, []);

  // Main Save Handler
  // Main Save Handler: Sequential Upload then Update
  const handleSaveAll = async () => {
    try {
      // 1. Determine the signature URL to use (default to existing)
      let finalSignatureUrl: string | undefined =
        settings?.signatureUrl ?? undefined;

      // 2. If a new file is pending, upload it first
      if (files.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", files[0]);

        const uploadRes = await postImage(uploadFormData).unwrap();

        // Extract URI/URL from your API response
        finalSignatureUrl =
          uploadRes?.uri ||
          uploadRes?.payload?.file_url ||
          uploadRes?.data ||
          uploadRes?.url;
      }

      // 3. Update Text and Branding Settings
      await updateMySettings({
        invoiceFooter: defaultTerms,
        invoiceNote: defaultNote,
        signatureUrl: finalSignatureUrl,
      }).unwrap();

      toast({
        title: "ជោគជ័យ!",
        description: "Invoice settings updated successfully.",
        className: "bg-green-600 text-white",
      });

      setFiles([]); // Clear pending upload preview
      refetch(); // Pull fresh data from server
    } catch (err: any) {
      console.error("Save Error:", err);
      toast({
        title: "បរាជ័យ!",
        description:
          err?.data?.message ||
          "Check server filesystem permissions (Read-only error).",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header Section */}
      <div className="mb-2 flex items-center gap-3">
        <div className="rounded-lg bg-indigo-600 p-2">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-600">
            Invoice Settings
          </h1>
          <p className="text-sm text-slate-500">
            Manage your currency, defaults, and branding.
          </p>
        </div>
      </div>

     
      {/* Invoice Footer: Terms & Note */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white p-7">
        <div className="relative z-10 mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                <AiOutlineInsertRowBelow className="h-5 w-5 text-indigo-700" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-800">
                Invoice Footer Settings
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              Customize global defaults for invoice bottom section: legal terms
              and personal notes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-1">
            <h3 className="mb-2 font-bold text-slate-700">Default Terms</h3>
            <RichTextEditor
              key={editorKey}
              value={defaultTerms}
              onChange={setDefaultTerms}
            />
          </div>

          <div className="rounded-lg bg-white p-1">
            <h3 className="mb-2 font-bold text-slate-700">Default Note</h3>
            <RichTextEditor
              key={editorKey}
              value={defaultNote}
              onChange={setDefaultNote}
            />
          </div>
        </div>
      </div>

      {/* Signature Upload */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
            <UploadCloud className="h-5 w-5 text-indigo-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Signature Branding
            </h2>
            <p className="text-sm text-slate-500">
              Upload your digital signature for invoices
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Upload Input */}
          <div>
            <input
              type="file"
              id="signature-upload"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files && setFiles([e.target.files[0]])}
            />

            <label
              htmlFor="signature-upload"
              className="group flex h-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-indigo-500 hover:bg-indigo-50"
            >
              <UploadCloud className="mb-3 h-10 w-10 text-slate-400 group-hover:text-indigo-600" />

              <span className="text-sm font-semibold text-slate-700">
                Click to upload
              </span>

              <span className="mt-1 text-xs text-slate-400">
                PNG, JPG — Max 5MB
              </span>
            </label>
          </div>

          {/* Preview Area */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Preview
            </p>

            <div className="flex flex-1  items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-3">
              {files.length > 0 ? (
                <div className="text-center">
                  <img
                    src={URL.createObjectURL(files[0])}
                    alt="New preview"
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                  <p className="mt-2 text-xs font-medium text-indigo-600">
                    Ready to save
                  </p>
                </div>
              ) : settings?.signatureUrl ? (
                <Image
                  unoptimized
                  src={settings.signatureUrl}
                  width={300}
                  height={150}
                  alt="Saved signature"
                  className=" object-cover mix-blend-multiply"
                />
              ) : (
                <span className="text-sm italic text-slate-300">
                  No signature uploaded
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save All Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveAll}
          disabled={isSaving || isUploading}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-10 py-4 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-200 disabled:opacity-50"
        >
          {isSaving || isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {isSaving || isUploading
            ? "Saving Changes..."
            : "Save All Invoice Settings"}
        </button>
      </div>
    </div>
  );
}
