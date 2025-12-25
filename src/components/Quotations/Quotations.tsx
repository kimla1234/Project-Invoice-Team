"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VscAdd } from "react-icons/vsc";

import HeaderQuotations from "./header-quotation/HeaderQuotation";
import SearchInput from "./search/Search";
import FilterDate from "./FilterData";
import QuotationTable from "../Tables/QuotationTable";
import { ColumnToggleDropdown } from "../ui/ColumnToggleDropdown";

export default function Quotation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [issueDate, setIssueDate] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    QuotationNo: true,
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

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="inline-flex w-[210px] justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xl text-slate-600">
          Quotation
        </div>

        {/* ✅ FIXED LINK */}
        <Link
          href="/quotation/create"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <span>Create Quotation</span>
          <VscAdd className="text-xl" />
        </Link>
      </div>

      {/* Content */}
      <div className="w-full space-y-6 rounded-md bg-white p-8 text-slate-600">
        {/* Summary */}
        <HeaderQuotations refreshKey={refreshKey} />

        {/* Filters */}
        <div className="flex w-full justify-between gap-4">
          <div className="flex gap-4">
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <FilterDate
              date={issueDate}
              onChange={setIssueDate}
            />
          </div>

          <ColumnToggleDropdown
            columns={columnOptions}
            onToggle={toggleColumnVisibility}
          />
        </div>

        {/* Table */}
        <QuotationTable
          searchTerm={searchTerm}
          issueDate={issueDate}
        />
      </div>
    </div>
  );
}
