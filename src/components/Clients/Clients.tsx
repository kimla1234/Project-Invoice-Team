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
    <div className="space-y-3">
      <div className="flex justify-between">
        <div className="inline-flex w-[210px] justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xl text-slate-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          Clients Information
        </div>
        <div className="flex items-center space-x-4">
          {/* Left: Button Group (Export/Import) */}
          <div
            className="inline-flex rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            role="group"
          >
            {/* Button 1: Export Excel (with icon) */}
            <button
              type="button"
              onClick={handleExportExcel} // ✅ USE HANDLER
              className="flex items-center space-x-2 rounded-l-lg px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
            >
              <div>
                <Image
                  src={logo}
                  className="size-5"
                  alt="icon excel"
                  role="presentation"
                  width={200}
                  height={200}
                />
              </div>
              <div>Export Excel</div>
            </button>
          </div>

          {/* Right: Primary Action Button */}
          <Link
            href="/clients/create"
            className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div>Create Client</div>
            <VscAdd className="text-xl" />
          </Link>
        </div>
      </div>

      <div className="h-auto w-full space-y-10 rounded-md bg-white p-8 text-slate-600">
        <div>
          <HeaderClients refreshKey={summaryRefreshKey} />
        </div>
        <div className="space-y-4">
          <div className="flex w-full justify-between space-x-4">
            <div className="flex w-full gap-4">
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <div className="flex gap-4">
                {/* Currency Filter */}

                <FilterDropdown
                  title="Gender"
                  options={genderOptions}
                  selectedValues={selectedGenders}
                  onChange={setSelectedGenders}
                />

                {/* Status Filter */}
        
              </div>
            </div>
            {/* Add the new Column Toggle Dropdown component here */}
            <ColumnToggleDropdown
              columns={columnOptions}
              onToggle={toggleColumnVisibility}
            />
          </div>
          <div>
            {/* The table where your data is displayed */}
            <ClientTable  
              visibleColumns={columnVisibility}
              searchTerm={searchTerm} // Pass the search term
              selectedGenders={selectedGenders}
              //onExportDataChange={setExportData}
              onDataChanged={() => setSummaryRefreshKey((k) => k + 1)}
            />
            
          </div>
        </div>
      </div>
    </div>
  );
}
