"use client";

import React, { useState } from "react";

import "filepond/dist/filepond.min.css";
import {
  FilePond,
  FilePondFile,
  registerPlugin,
  type FilePondFile as FPFile,
} from "filepond";
import {
  DollarSign,
  FileText,
  PenTool,
  Save,
  Settings,
  UploadCloud,
} from "lucide-react";
import { AiOutlineInsertRowBelow } from "react-icons/ai";
import RichTextEditor from "@/components/ui/RichTextEditor";

// Optional: Add plugins if needed
// import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
// import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
// registerPlugin(FilePondPluginImagePreview);

export default function General() {
  // Currency states
  const [baseRate, setBaseRate] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("KHR");
  const [exchangeRate, setExchangeRate] = useState(4100);

  // Default terms & note
  const [defaultTerms, setDefaultTerms] = useState(
    "• Cost is Exclusive With Holding-Tax\n• Flexible Cost Depends on Customer Needs\n• 50% Deposit after agreement\n• Deposit amount is not refundable",
  );
  const [defaultNote, setDefaultNote] = useState(defaultTerms);

  // Signature files
  const [files, setFiles] = useState<FPFile["file"][]>([]);

  const handleUpdateCurrency = () => {
    console.log({ baseRate, fromCurrency, toCurrency, exchangeRate });
    alert("Currency settings updated!");
  };

  const handleUpdateInvoice = () => {
    console.log({ defaultTerms, defaultNote, files });
    alert("Invoice settings updated!");
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

      {/* Currency Settings Card */}
      <div className="overflow-hidden rounded-xl border border-dashed border-slate-500">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-7 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <DollarSign className="h-5 w-5 text-indigo-700" />
          </div>

          <div className="">
            <h2 className="font- text-lg text-slate-700">
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
                className="w-full rounded-lg border-slate-200 bg-slate-100 p-2.5 text-sm outline-none ring-offset-2 transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                value={baseRate}
                onChange={(e) => setBaseRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500">From</label>
              <select
                className="w-full rounded-lg border-slate-200 bg-slate-100 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
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
                className="w-full rounded-lg border-slate-200 bg-slate-100 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500">To</label>
              <select
                className="w-full rounded-lg border-slate-200 bg-slate-100 p-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
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
            className="mt-8 flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Update Rates
          </button>
        </div>
      </div>

      {/* Default Terms & Note Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white p-7">
        {/* Header with decorative element */}
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
              Customize the global defaults for your invoice bottom section,
              including legal terms and personal notes.
            </p>
          </div>

          {/* Optional status badge */}
          <span className="hidden items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 md:inline-flex">
            Auto-saving enabled
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Card 1: Terms */}
          <div className="group relative bg-white p-1">
            <div className="">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-700">Default Terms</h3>
                </div>
              </div>
              {/* Rich Text Editor replacing Textarea */}
              <div className="min-h-[176px]">
                <RichTextEditor
                  value={defaultTerms}
                  onChange={setDefaultTerms}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Note */}
          <div className="group relative rounded-2xl bg-white p-1 transition-all">
            <div className="">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-700">Default Note</h3>
                </div>
              </div>
              {/* Rich Text Editor replacing Textarea */}
              <div className="min-h-[176px]">
                <RichTextEditor value={defaultNote} onChange={setDefaultNote} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Upload Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-7 ">
        <div className="mb-5 flex gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <UploadCloud className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
              Signature Branding
            </h2>
            <p className="text-sm">Please upload your signature as an image.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-400 bg-slate-50 p-8 transition-colors hover:bg-slate-100/50">
          <input
            type="file"
            id="signature-upload"
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFiles([e.target.files[0]]);
              }
            }}
          />
          <label
            htmlFor="signature-upload"
            className="group flex cursor-pointer flex-col items-center"
          >
            <div className="mb-3 rounded-full bg-white p-4 shadow-sm transition-transform group-hover:scale-110">
              <UploadCloud className="h-8 w-8 text-indigo-500" />
            </div>
            <span className="text-sm font-medium text-slate-600">
              Click to upload signature
            </span>
            <span className="mt-1 text-sm text-slate-400">
              PNG, JPG up to 5MB
            </span>
          </label>
        </div>

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

      {/* Master Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleUpdateInvoice}
          className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition-all hover:-translate-y-1 hover:bg-black active:translate-y-0"
        >
          <Save className="h-5 w-5" />
          Save All Invoice Settings
        </button>
      </div>
    </div>
  );
}
