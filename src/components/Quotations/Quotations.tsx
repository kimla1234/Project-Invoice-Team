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
    Actions: true,
  });

  // Fetch quotations and clients
  const { data: quotationData, isLoading: loadingQuotations, error: quotationError } = useGetQuotationsQuery({ page: 0, size: 1000, sort: "id,asc" });
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
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="inline-flex w-[210px] justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xl text-slate-600">
          Quotation
        </div>

        <div className="flex items-center space-x-4">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center space-x-2 rounded-l-lg px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              <Image src={logo} alt="Excel icon" width={20} height={20} />
              <div>Export Excel</div>
            </button>
          </div>

          <Link
            href="/quotation/create"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <span>Create Quotation</span>
            <VscAdd className="text-xl" />
          </Link>
        </div>
      </div>

      {/* BODY */}
      <div className="w-full space-y-6 rounded-md bg-white p-8 text-slate-600">
        <HeaderQuotations totalQuotations={quotationData?.totalElements || quotations.length} />

        <div className="flex w-full justify-between gap-4">
          <div className="flex gap-4">
            <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <FilterDate date={issueDate} onChange={setIssueDate} />
          </div>

          <ColumnToggleDropdown columns={columnOptions} onToggle={toggleColumnVisibility} />
        </div>

        <QuotationTable
          data={filteredData}
          clients={clients}
          loading={loadingQuotations || loadingClients}
          onRefresh={() => {}}
          columnVisibility={columnVisibility}
        />
      </div>
    </div>
  );
}