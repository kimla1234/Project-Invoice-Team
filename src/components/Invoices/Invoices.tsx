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
      <div className="flex items-center justify-between">
        <div className="inline-flex w-[210px] justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xl text-slate-600">
          Invoice
        </div>
        <div className="flex gap-2">
          <Link
            href="/invoices/create"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <span>Create Invoice</span>
            <VscAdd className="text-xl" />
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