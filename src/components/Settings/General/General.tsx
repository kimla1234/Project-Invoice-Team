"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Save, Settings, UploadCloud } from "lucide-react";
import { AiOutlineInsertRowBelow } from "react-icons/ai";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
  useUploadSignatureMutation,
} from "@/redux/service/setting";

export default function General() {
  // Currency states
  const [baseRate, setBaseRate] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("KHR");
  const [exchangeRate, setExchangeRate] = useState(4100);
  const [editorKey, setEditorKey] = useState(0);
  // Default terms & note
  const [defaultTerms, setDefaultTerms] = useState(
    "• Cost is Exclusive With Holding-Tax\n• Flexible Cost Depends on Customer Needs\n• 50% Deposit after agreement\n• Deposit amount is not refundable",
  );
  const [defaultNote, setDefaultNote] = useState(defaultTerms);

  // Signature files
  const [files, setFiles] = useState<File[]>([]);
  const {
  data: settings,
  isLoading,
  refetch,
} = useGetMySettingsQuery();
  const [updateMySettings, { isLoading: isSaving }] = useUpdateMySettingsMutation();
  const [uploadSignature, { isLoading: isUploading }] = useUploadSignatureMutation();
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

  // Update invoice footer settings
  // Update invoice footer settings (without storing Base64 image)
const handleUpdateInvoice = async () => {
  try {
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);
      await uploadSignature(formData).unwrap();
    }

    await updateMySettings({
      invoiceFooter: defaultTerms,
      invoiceNote: defaultNote,
    }).unwrap();

    // 🔥 THIS IS THE KEY
    setFiles([]);      // clear local preview
    await refetch();   // reload from backend

    alert("Invoice settings saved!");
  } catch {
    alert("Save failed");
  }
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

      {/* Currency Settings */}
      <div className="overflow-hidden rounded-xl border border-dashed border-slate-500">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-7 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <DollarSign className="h-5 w-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-slate-700">
              Currency Configuration
            </h2>
            <p className="text-sm">
              Configure your invoice exchange rate setting for each defined
              currency
            </p>
          </div>
        </div>

        <div className="p-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500">
                Base Rate
              </label>
              <input
                type="number"
                className="w-full rounded-lg border-slate-200 bg-slate-100 p-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                value={baseRate}
                onChange={(e) => setBaseRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500">From</label>
              <select
                className="w-full rounded-lg border-slate-200 bg-slate-100 p-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                <option>USD</option>
                <option>KHR</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500">
                Exchange Rate
              </label>
              <input
                type="number"
                className="w-full rounded-lg border-slate-200 bg-slate-100 p-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500">To</label>
              <select
                className="w-full rounded-lg border-slate-200 bg-slate-100 p-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                <option>USD</option>
                <option>KHR</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleUpdateCurrency}
            className="mt-8 flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95"
          >
            <Save className="h-4 w-4" />
            Update Rates
          </button>
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
      <div className="rounded-xl border border-slate-200 bg-white p-7">
        <div className="mb-5 flex gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <UploadCloud className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-700">
              Signature Branding
            </h2>
            <p className="text-sm">Upload your signature as an image.</p>
          </div>
        </div>

        <input
          type="file"
          id="signature-upload"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files && setFiles([e.target.files[0]])}
        />
        <label
          htmlFor="signature-upload"
          className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed bg-slate-50 p-8 hover:bg-slate-100/50"
        >
          <UploadCloud className="mb-2 h-8 w-8 text-indigo-500" />
          <span className="text-sm font-medium text-slate-600">
            Click to upload signature
          </span>
          <span className="mt-1 text-sm text-slate-400">
            PNG, JPG up to 5MB
          </span>
        </label>
        {settings?.signatureUrl && files.length === 0 && (
    <div className="mt-6 rounded-lg border bg-slate-50 p-4">
      <p className="mb-2 text-sm font-medium text-slate-600">
        Saved Signature
      </p>
      <img
        src={`${process.env.NEXT_PUBLIC_NORMPLOV_API_URL}${settings.signatureUrl}`}
        alt="Saved signature"
        className="h-24 w-48 rounded border bg-white object-contain p-2"
      />
    </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 flex items-center gap-6 rounded-lg border border-indigo-100 bg-indigo-50/30 p-4">
            <img
              src={URL.createObjectURL(files[0])}
              alt="preview"
              className="h-24 w-48 rounded border bg-white object-contain p-2"
            />
            <div>
              <p className="text-sm font-medium text-slate-700">
                {files[0].name}
              </p>
              <p className="text-sm text-slate-500">Ready for upload</p>
            </div>
          </div>
        )}
      </div>

      {/* Save All Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleUpdateInvoice}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white hover:-translate-y-1 hover:bg-black"
        >
          <Save className="h-5 w-5" />
          {isSaving ? "Saving..." : "Save All Invoice Settings"}
        </button>
      </div>
    </div>
  );
}
