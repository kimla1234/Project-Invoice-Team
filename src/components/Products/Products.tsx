"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import logo from "@/assets/ui/icon_excel.svg";
import { VscAdd } from "react-icons/vsc";
import Link from "next/link";
import HeaderProducts from "./header-products/HeaderProducts";
import SearchInput from "./search/Search";
import FilterDropdown from "./search/FilterDropdown";
import { ProductTable } from "../Tables/ProductTable";
import { ColumnToggleDropdown } from "../ui/ColumnToggleDropdown";
import { exportProductsToExcel } from "@/utils/exportToExcel";
import { useToast } from "@/hooks/use-toast";
import { useGetProductsTypeQuery } from "@/redux/service/products";

// Import the new component created previously

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "KHR", label: "KHR" },
];

const statusOptions = [
  { value: "in", label: "In Stock" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
];

export default function Products() {
  const { data: productTypeData, isLoading: isLoadingTypes } =
    useGetProductsTypeQuery();
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>(
    [],
  );

  const productTypeOptions = useMemo(() => {
    if (!productTypeData?.data) return [];

    return productTypeData.data.map((type: any) => ({
      value: type.name || type.type_name,
      label: type.name || type.type_name,
    }));
  }, [productTypeData]);

  // export data
  const [exportData, setExportData] = useState<any[]>([]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // State to manage column visibility (Matching the image)
  const [columnVisibility, setColumnVisibility] = useState({
    ID: true,
    Name: true,
    Image: true,
    Type: true,
    StockStatus: true,
    UnitPrice: true,
    Actions: true,
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

    exportProductsToExcel(exportData);

    toast({
      title: "Export successful",
      description: "Products have been exported to Excel.",
      duration: 3000,
      className: "bg-green-600 text-white",
    });
  };

  return (
    <div className="space-y-4  md:p-0">
  {/* TOP BAR: Title and Action Buttons */}
  <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
    <div className="inline-flex w-full justify-center rounded-lg border border-gray-200 bg-white px-2 py-2 text-lg font-semibold text-slate-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white md:text-xl lg:w-auto lg:px-6">
      Products & Services
    </div>

    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      {/* Export Button - Full width on mobile */}
      <div
        className="inline-flex w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 sm:w-auto"
        role="group"
      >
        <button
          type="button"
          onClick={handleExportExcel}
          className="flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700"
        >
          <Image src={logo} className="size-5" alt="icon excel" width={20} height={20} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Primary Action Button - Full width on mobile */}
      <Link
        href="/products/create"
        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none transition-all active:scale-95 sm:w-auto"
      >
        <span>Create Product or Service</span>
        <VscAdd className="text-xl" />
      </Link>
    </div>
  </div>

  {/* MAIN CONTENT CARD */}
  <div className="h-auto w-full space-y-6 rounded-md bg-white p-4 text-slate-600 shadow-sm md:p-8">
    <div className="overflow-x-auto">
      <HeaderProducts refreshKey={refreshKey} />
    </div>

    <div className="space-y-4">
      {/* SEARCH AND FILTERS ROW */}
      <div className="flex flex-col space-y-4 xl:flex-row xl:items-start xl:justify-between xl:space-y-0">
        
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0 flex-1">
          {/* Search Input - Expands to fill space */}
          <div className="w-full lg:max-w-md">
            <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>

          {/* Filters Group - Horizontal scroll on very small screens */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <FilterDropdown
              title={isLoadingTypes ? "Loading..." : "ProductType"}
              options={productTypeOptions}
              selectedValues={selectedProductTypes}
              onChange={setSelectedProductTypes}
            />
            <FilterDropdown
              title="Currency"
              options={currencyOptions}
              selectedValues={selectedCurrencies}
              onChange={setSelectedCurrencies}
            />
            <FilterDropdown
              title="Stock"
              options={statusOptions}
              selectedValues={selectedStatuses}
              onChange={setSelectedStatuses}
            />
          </div>
        </div>

        {/* Column Toggle - Aligned right on large screens */}
        <div className="flex justify-end">
          <ColumnToggleDropdown columns={columnOptions} onToggle={toggleColumnVisibility} />
        </div>
      </div>

      {/* TABLE CONTAINER: Crucial for responsiveness */}
      <div className="relative overflow-x-auto rounded-lg border border-gray-100">
        <ProductTable
          visibleColumns={columnVisibility}
          searchTerm={searchTerm}
          selectedCurrencies={selectedCurrencies}
          selectedStatuses={selectedStatuses}
          selectedProductTypes={selectedProductTypes}
          onExportDataChange={setExportData}
          onDeleted={triggerRefresh}
        />
      </div>
    </div>
  </div>
</div>
  );
}
 

