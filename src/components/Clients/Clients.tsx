"use client";

import Image from "next/image";
import React, { useState } from "react";
import logo from "@/assets/ui/icon_excel.svg";
import { VscAdd } from "react-icons/vsc";
import Link from "next/link";
import HeaderClients from "./header-clients/HeaderClients";
import SearchInput from "./search/Search";
import FilterDropdown from "./search/FilterDropdown";
import { ClientTable } from "../Tables/ClientTable";
import { ColumnToggleDropdown } from "../ui/ColumnToggleDropdown";
import { exportClientsToExcel } from "@/utils/exportToExcel";
import { useToast } from "@/hooks/use-toast";

// Import the new component created previously

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];


export default function Clients() {
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast(); // ✅ ADD
  // export data 
  const [exportData, setExportData] = useState<any[]>([]);
  // trigger summary refresh
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0);
  

  // State to manage column visibility (Matching the image)
  const [columnVisibility, setColumnVisibility] = useState({
    ID: true,
    Name: true,
    Gender: true,
    Contact: true,
    Address: true,
  });

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId as keyof typeof prev],
    }));
    // TODO: You need to pass this visibility state down to ProductTable
    // and use it to conditionally render TableHead and TableCell components.
  };

  const columnOptions = Object.keys(columnVisibility).map((key) => ({
    id: key,
    label: key,
    visible: columnVisibility[key as keyof typeof columnVisibility],
  }));

  // ✅ EXPORT HANDLER WITH TOAST
  const handleExportExcel = () => {
    if (!exportData || exportData.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust filters or search to get data.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    exportClientsToExcel(exportData);

    toast({
      title: "Export successful",
      description: "Clients have been exported to Excel.",
      duration: 3000,
      className: "bg-green-600 text-white",
    });
  };

  return (
   <div className="space-y-4 md:space-y-6">
  {/* HEADER SECTION */}
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    {/* Title Badge - Removed fixed width for better mobile scaling */}
    <div className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-2 text-xl font-semibold text-slate-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-auto">
      Clients Information
    </div>

    {/* Action Buttons Group */}
    <div className="flex flex-row items-center gap-3">
      {/* Export Button */}
      <div className="flex-1 sm:flex-none">
        <button
          type="button"
          onClick={handleExportExcel}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          <Image
            src={logo}
            className="size-5"
            alt="icon excel"
            width={20}
            height={20}
          />
          <span className="hidden xs:inline">Export Excel</span>
          <span className="xs:hidden">Export</span>
        </button>
      </div>

      {/* Create Client Button */}
      <Link
        href="/clients/create"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700 active:scale-95 sm:flex-none"
      >
        <span className="whitespace-nowrap">Create Client</span>
        <VscAdd className="text-xl" />
      </Link>
    </div>
  </div>

  {/* MAIN CONTENT CARD */}
  <div className="h-auto w-full space-y-8 rounded-xl bg-white p-4 shadow-sm border border-gray-100 dark:border-gray-700 dark:bg-gray-900 md:p-8">
    {/* Summary Header Cards */}
    <div className="overflow-x-auto">
      <HeaderClients refreshKey={summaryRefreshKey} />
    </div>

    {/* Controls Bar: Search, Filter, Toggle */}
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      
      {/* Left side: Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full xl:max-w-3xl">
        <div className="w-full sm:flex-1">
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <FilterDropdown
            title="Gender"
            options={genderOptions}
            selectedValues={selectedGenders}
            onChange={setSelectedGenders}
          />
          {/* Status Filter or other dropdowns would go here */}
        </div>
      </div>

      {/* Right side: Column Customization */}
      <div className="flex justify-end">
        <ColumnToggleDropdown
          columns={columnOptions}
          onToggle={toggleColumnVisibility}
        />
      </div>
    </div>

    {/* Table Section */}
    <div className="w-full overflow-hidden">
      <ClientTable  
        visibleColumns={columnVisibility}
        searchTerm={searchTerm}
        selectedGenders={selectedGenders}
        onDataChanged={() => setSummaryRefreshKey((k) => k + 1)}
      />
    </div>
  </div>
</div>
  );
}
