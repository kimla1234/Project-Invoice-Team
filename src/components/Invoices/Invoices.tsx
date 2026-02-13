"use client";
import React, { useState } from "react";
import Link from "next/link";
import { VscAdd } from "react-icons/vsc";
import HeaderInvoices from "./header-invoice/HeaderInvoice";
import SearchInput from "./search/Search";
import FilterDate from "../Quotations/FilterData";
import InvoiceTable from "../Tables/InvoiceTable";
import { ColumnToggleDropdown } from "../ui/ColumnToggleDropdown";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [issueDate, setIssueDate] = useState<string | undefined>();
  
  // Updated column visibility with keys matching InvoiceTable
  const [columnVisibility, setColumnVisibility] = useState({
    invoiceNo: true,
    client: true,
    subtotal: true,
    totalAmount: true,
    issueDate: true,
    status: true,
  });

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId as keyof typeof prev],
    }));
  };

  // Column options with proper labels
  const columnOptions = [
    { id: "invoiceNo", label: "Invoice No.", visible: columnVisibility.invoiceNo },
    { id: "client", label: "Client", visible: columnVisibility.client },
    { id: "subtotal", label: "Subtotal", visible: columnVisibility.subtotal },
    { id: "totalAmount", label: "Total Amount", visible: columnVisibility.totalAmount },
    { id: "issueDate", label: "Issue Date", visible: columnVisibility.issueDate },
    { id: "status", label: "Status", visible: columnVisibility.status },
  ];

  return (
    <div className="space-y-3">
      {/* Page Header */}
<div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
  {/* Title */}
  <div className="w-full sm:w-[210px] text-center sm:text-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-lg sm:text-xl text-slate-600">
    Invoice
  </div>

  {/* Action Button */}
  <div className="w-full sm:w-[210px] flex justify-center sm:justify-start gap-2">
    <Link
      href="/invoices/create"
      className="flex items-center w-full justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm sm:text-base font-medium text-white hover:bg-purple-700"
    >
      <span>Create Invoice</span>
      <VscAdd className="text-lg sm:text-xl" />
    </Link>
  </div>
</div>


      {/* Content */}
      <div className="w-full space-y-6 rounded-md bg-white p-8 text-slate-600">
        <HeaderInvoices />
        
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

        <InvoiceTable 
          visibleColumns={columnVisibility}
          searchTerm={searchTerm}
          issueDate={issueDate}
        />
      </div>
    </div>
  );
}