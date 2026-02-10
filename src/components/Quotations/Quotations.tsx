"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { VscAdd } from "react-icons/vsc";
import Image from "next/image";
import logo from "@/assets/ui/icon_excel.svg";

import HeaderQuotations from "./header-quotation/HeaderQuotation";
import SearchInput from "./search/Search";
import FilterDate from "./FilterData";
import QuotationTable from "../Tables/QuotationTable";
import { ColumnToggleDropdown } from "../ui/ColumnToggleDropdown";
import { initQuotations } from "@/utils/initLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { exportProductsToExcel } from "@/utils/exportToExcel";

import { ClientData } from "@/types/client";
import { QuotationData } from "@/types/quotation";

export default function Quotation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [issueDate, setIssueDate] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    QuotationNo: true,
    Client: true,
    Amount: true,
    IssueDate: true,
    Actions: true,
  });

  // Fetch all data once
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      initQuotations();
      const stored = JSON.parse(localStorage.getItem("quotations") || "[]");
      const clientData = await getClientsTableData();
      setQuotations(stored);
      setClients(clientData);
      setLoading(false);
    };
    loadData();
  }, [refreshKey]);

  // Single Source of Truth for filtered data
  const filteredData = useMemo(() => {
    return quotations.filter((q) => {
      const clientName = clients.find((c) => c.id === q.clientId)?.name || "";
      const quotationNo = `QUO-${String(q.id).padStart(4, "0")}`;
      
      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotationNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = issueDate 
        ? new Date(q.issueDate).toDateString() === new Date(issueDate).toDateString()
        : true;

      return matchesSearch && matchesDate;
    });
  }, [searchTerm, issueDate, quotations, clients]);

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust filters or search to get data.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    exportProductsToExcel(filteredData);

    toast({
      title: "Export successful",
      description: "Data has been exported to Excel.",
      duration: 3000,
      className: "bg-green-600 text-white",
    });
  };

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
      <div className="flex items-center justify-between">
        <div className="inline-flex w-[210px] justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xl text-slate-600">
          Quotation
        </div>

        <div className="flex items-center space-x-4">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white" role="group">
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

      <div className="w-full space-y-6 rounded-md bg-white p-8 text-slate-600">
        <HeaderQuotations refreshKey={refreshKey} />

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
          loading={loading}
          onRefresh={() => setRefreshKey(prev => prev + 1)}
        />
      </div>
    </div>
  );
}