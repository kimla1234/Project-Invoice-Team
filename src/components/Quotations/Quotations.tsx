"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { VscAdd } from "react-icons/vsc";
import Image from "next/image";
import logo from "@/assets/ui/icon_excel.svg";

import HeaderQuotations from "./header-quotation/HeaderQuotation";
import SearchInput from "./search/Search";
import FilterDate from "./FilterData";
import QuotationTable from "../Tables/QuotationTable";
import { ColumnToggleDropdown } from "../ui/ColumnToggleDropdown";
import { useToast } from "@/hooks/use-toast";
import { exportProductsToExcel } from "@/utils/exportToExcel";

import type { Quotation } from "@/types/quotation";
import { ClientResponse } from "@/types/client";
import { useGetQuotationsQuery } from "@/redux/service/quotation";
import { useGetMyClientsQuery } from "@/redux/service/client";

export default function Quotation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [issueDate, setIssueDate] = useState<string | undefined>();
  const { toast } = useToast();

  const [columnVisibility, setColumnVisibility] = useState({
    QuotationNo: true,
    Client: true,
    Amount: true,
    IssueDate: true,
    Status: true,
    Actions: true,
  });

  // Fetch quotations and clients
  const { data: quotationData, isLoading: loadingQuotations, error: quotationError, refetch } = useGetQuotationsQuery({ page: 0, size: 1000, sort: "id,asc" });
  const { data: clients = [], isLoading: loadingClients } = useGetMyClientsQuery();

  console.log("Quotation Data:", quotationData);
  console.log("Quotation Error:", quotationError);

  // Ensure quotations is always an array
  const quotations: Quotation[] = Array.isArray(quotationData?.content)
    ? quotationData.content
    : Array.isArray(quotationData)
      ? quotationData
      : [];

  // Filter quotations by search and date
  const filteredData = useMemo(() => {
    return quotations.filter((q) => {
      const clientName = clients.find((c) => c.id === q.clientId)?.name ?? "";
      const quotationNo = q.quotationNo 
        ? `QUO-${String(q.quotationNo).padStart(4, "0")}` 
        : `QUO-${String(q.id).padStart(4, "0")}`;

      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotationNo.toLowerCase().includes(searchTerm.toLowerCase());

      const dateStr = q.quotationDate ?? q.issueDate;
      const matchesDate = issueDate && dateStr
        ? new Date(dateStr).toDateString() === new Date(issueDate).toDateString()
        : true;

      return matchesSearch && matchesDate;
    }).sort((a, b) => a.id - b.id);
  }, [quotations, clients, searchTerm, issueDate]);

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust filters or search.",
        variant: "destructive",
      });
      return;
    }

    exportProductsToExcel(filteredData);

    toast({
      title: "Export successful",
      description: "Data exported to Excel.",
      className: "bg-green-600 text-white",
    });
  };

  // Column toggle
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
    <div className="space-y-4 md:space-y-6">
  {/* HEADER SECTION */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    {/* Title Badge - Removed fixed width for fluid growth on mobile */}
    <div className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-2 text-xl font-semibold text-slate-600 shadow-sm sm:w-auto">
      Quotation
    </div>

    {/* Action Buttons Group */}
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex-1 sm:flex-none">
        <button
          type="button"
          onClick={handleExportExcel}
          className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 active:bg-gray-100"
        >
          <Image src={logo} alt="Excel icon" width={20} height={20} />
          <span className="hidden xs:inline">Export Excel</span>
          <span className="xs:hidden">Export</span>
        </button>
      </div>

      <Link
        href="/quotation/create"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-95 sm:flex-none"
      >
        <span className="whitespace-nowrap">Create Quotation</span>
        <VscAdd className="text-xl" />
      </Link>
    </div>
  </div>

  {/* BODY / CONTENT CARD */}
  <div className="w-full space-y-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100 md:p-8 text-slate-600">
    
    {/* Statistics / Summary Component */}
    <HeaderQuotations totalQuotations={quotationData?.totalElements || quotations.length} />

    {/* Search and Filters Bar */}
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search & Date Inputs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        <div className="w-full sm:w-auto">
          <FilterDate date={issueDate} onChange={setIssueDate} />
        </div>
      </div>

      {/* Column Customization */}
      <div className="flex justify-end">
        <ColumnToggleDropdown columns={columnOptions} onToggle={toggleColumnVisibility} />
      </div>
    </div>

    {/* Table Container - Handle overflow internally */}
    <div className="relative overflow-hidden">
      <QuotationTable
        data={filteredData}
        clients={clients}
        loading={loadingQuotations || loadingClients}
        onRefresh={() => {}}
        columnVisibility={columnVisibility}
      />
    </div>
  </div>
</div>
  );
}