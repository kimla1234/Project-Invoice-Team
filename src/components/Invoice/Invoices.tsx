"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VscAdd } from "react-icons/vsc";

import HeaderInvoices from "./header-invoice/HeaderInvoice"; // Updated
import SearchInput from "./search/Search";
import FilterDate from "../Quotations/FilterData";
import InvoiceTable from "../Tables/InvoiceTable"; // Updated
import { ColumnToggleDropdown } from "../ui/ColumnToggleDropdown";
import { initInvoices } from "@/utils/initLocalStorage"; // Updated

export default function Invoices() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [issueDate, setIssueDate] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    InvoiceNo: true, // Updated
    Client: true,
    Amount: true,
    IssueDate: true,
    Actions: true,
  });

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId as keyof typeof prev],
    }));
  };

  const columnOptions = Object.keys(columnVisibility).map((key) => ({
    id: key,
    label: key,
    visible: columnVisibility[key as keyof typeof columnVisibility],
  }));

  // ---------------------------
  // Initialize localStorage
  // ---------------------------
  useEffect(() => {
    initInvoices(); // Updated
  }, []);

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex w-[210px] justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xl text-slate-600">
          Invoice
        </div>

        <div className="flex gap-2">
          {/* Create Invoice Button */}
          <Link
            href="/invoices/create"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <span>Create Invoice</span>
            <VscAdd className="text-xl" />
          </Link>

          {/* Convert Quotation to Invoice Button */}
          <Link
            href="/invoices/convert-quotation"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <span>Convert Quo to Inv</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="w-full space-y-6 rounded-md bg-white p-8 text-slate-600">
        {/* Summary */}
        <HeaderInvoices refreshKey={refreshKey} />

        {/* Filters */}
        <div className="flex w-full justify-between gap-4">
          <div className="flex gap-4">
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <FilterDate date={issueDate} onChange={setIssueDate} />
          </div>

          <ColumnToggleDropdown
            columns={columnOptions}
            onToggle={toggleColumnVisibility}
          />
        </div>

        {/* Table */}
        <InvoiceTable searchTerm={searchTerm} issueDate={issueDate} />
      </div>
    </div>
  );
}
