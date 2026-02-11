"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Edit2, Trash2, SearchX } from "lucide-react";
import { SiNginxproxymanager } from "react-icons/si";
import Link from "next/link";
import Image from "next/image";

// Hooks & Types
import { MyEventResponse } from "@/types/product";
import {
  useDeleteProductMutation,
  useGetMyProductsQuery,
} from "@/redux/service/products";

import { PaginationControls } from "../ui/pagination-controls";
import { ConfirmDeleteModal } from "../Products/ConfirmDeleteModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ProductTableProps {
  visibleColumns: Record<string, boolean>;
  searchTerm: string;
  selectedCurrencies: string[];
  selectedStatuses: string[];
  selectedProductTypes: string[];
  onExportDataChange: (data: any[]) => void;
  onDeleted: () => void;
}

export function ProductTable({
  visibleColumns,
  searchTerm,
  selectedCurrencies,
  selectedStatuses,
  selectedProductTypes,
  onExportDataChange,
  onDeleted,
}: ProductTableProps) {
  // 1. RTK Query Data Fetching
  const { data: fullData = [], isLoading, isError } = useGetMyProductsQuery();
  // 1. Get the delete mutation hook
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  console.log("data : ", fullData);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  // 1. Filter Logic
  const filteredData = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();

    const normalizeStatus = (status: string) =>
      status.toLowerCase().replace("_stock", "");

    return fullData.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(lowerCaseSearch) ||
        item.productTypeName.toLowerCase().includes(lowerCaseSearch) ||
        item.price.toString().includes(lowerCaseSearch);

      // Filter  Product Type
      const matchType =
      selectedProductTypes.length === 0 ||
      selectedProductTypes.includes(item.productTypeName);

      const matchStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.some((s) => s === normalizeStatus(item.status));

      const matchCurrency =
        selectedCurrencies.length === 0 ||
        selectedCurrencies.includes(item.currency_type);

      return matchSearch && matchType && matchStatus && matchCurrency;
    });
  }, [fullData, searchTerm, selectedStatuses, selectedCurrencies , selectedProductTypes]);

  // 2. Export Data Logic (ប្រើ JSON.stringify ដើម្បីការពារ Infinite Loop)
  const exportData = useMemo(() => {
    return filteredData.map((item) => ({
      ID: item.id,
      Name: item.name,
      Type: item.productTypeName,
      Stock: item.stockQuantity,
      Price: item.price,
      Status: item.status,
    }));
  }, [filteredData]);

  useEffect(() => {
    // បាញ់ទៅ parent តែពេលមានទិន្នន័យពិតប្រាកដ និងមិនមែន array ទទេ
    if (fullData && fullData.length > 0) {
      onExportDataChange(exportData);
    }
  }, [JSON.stringify(exportData), onExportDataChange, fullData.length]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Dynamic column span
  const activeColumnsCount =
    Object.values(visibleColumns).filter(Boolean).length + 1;

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      //Execute mutation
      await deleteProduct(deleteId).unwrap();

      //Success Feedback
      toast({
        title: "Product deleted",
        description: "The product has been removed successfully.",
        className: "bg-green-600 text-white",
      });

      // Notify parent to refresh header stats if necessary
      if (onDeleted) onDeleted();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const currencySymbol: Record<string, string> = {
    USD: "$",
    KHR: "៛",
  };

  const formatPrice = (price: number, currency?: string) => {
    if (currency === "KHR") {
      // Riel usually no decimals
      return price.toLocaleString("en-US", {
        maximumFractionDigits: 0,
      });
    }

    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (isLoading) return <TableSkeleton />;
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load products.
      </div>
    );

  const getDynamicColor = (name: string) => {
    const colors = [
      "bg-red-100 text-red-700",
      "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700",
      "bg-yellow-100 text-yellow-700",
      "bg-purple-100 text-purple-700",
      "bg-pink-100 text-pink-700",
      "bg-indigo-100 text-indigo-700",
      "bg-orange-100 text-orange-700",
      "bg-cyan-100 text-cyan-700",
      "bg-teal-100 text-teal-700",
      "bg-rose-100 text-rose-700",
      "bg-emerald-100 text-emerald-700",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  
  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border bg-white dark:border-dark-3 dark:bg-gray-dark">
        <Table className="relative">
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2">
              {visibleColumns.ID && (
                <TableHead className="xl:pl-7.5">ID</TableHead>
              )}
              {visibleColumns.Image && <TableHead>Image</TableHead>}
              {visibleColumns.Name && (
                <TableHead className="min-w-[100px] xl:pl-7.5">
                  Product Name
                </TableHead>
              )}
              {visibleColumns.Type && (
                <TableHead className="min-w-[100px] xl:pl-7.5">
                  Product Type
                </TableHead>
              )}

              {visibleColumns.UnitPrice && <TableHead>Unit Price</TableHead>}
              <TableHead className="w-[70px]">Stock</TableHead>
              {visibleColumns.StockStatus && <TableHead>Status</TableHead>}
              {visibleColumns.Actions && (
                <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow
                  key={item.uuid}
                  className="border-[#eee] dark:border-dark-3"
                >
                  {visibleColumns.ID && (
                    <TableCell className="font-medium text-dark dark:text-white xl:pl-7.5">
                      {item.id}
                    </TableCell>
                  )}
                  {visibleColumns.Image && (
                    <TableCell className="w-[50px]">
                      <div className="relative h-11 w-11 overflow-hidden rounded-md border">
                        <Image
                          unoptimized
                          src={
                            item.image_url ||
                            "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"
                          }
                          alt={item.name}
                          width={1000}
                          height={1000}
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.Name && (
                    <TableCell className="min-w-[100px] max-w-[180px] xl:pl-7.5">
                      <h5 className="font-medium text-dark dark:text-white">
                        {item.name}
                      </h5>
                    </TableCell>
                  )}
                  {visibleColumns.Type && (
                    <TableCell className="min-w-[100px] max-w-[180px] xl:pl-7.5">
                      <h5
                        key={item.id}
                        className={cn(
                          "w-fit rounded-sm px-2 py-1 text-xs font-medium",

                          getDynamicColor(item.productTypeName || "Default"),
                        )}
                      >
                        {item.productTypeName}
                      </h5>
                    </TableCell>
                  )}
                  {visibleColumns.UnitPrice && (
                    <TableCell>
                      <p className="font-medium text-dark dark:text-white">
                        {currencySymbol[item.currency_type] ?? "$"}
                        {formatPrice(item.price, item.currency_type)}
                      </p>
                    </TableCell>
                  )}

                  <TableCell className="w-[100px] xl:pl-7">
                    <p
                      className={cn(
                        "font-medium text-dark dark:text-white",
                        item.stockQuantity === 0 && "text-red-500",
                      )}
                    >
                      {item.stockQuantity}
                    </p>
                  </TableCell>

                  {visibleColumns.StockStatus && (
                    <TableCell>
                      <div
                        className={cn(
                          "flex w-[100px] justify-center rounded-md py-1 text-xs font-medium uppercase",
                          item.status === "IN_STOCK" &&
                            "bg-green-100 text-green-700",
                          item.status === "LOW_STOCK" &&
                            "bg-yellow-100 text-yellow-700",
                          item.status === "OUT_STOCK" &&
                            "bg-red-100 text-red-700",
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.Actions && (
                    <TableCell className="text-right xl:pr-7.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-3">
                            <MoreHorizontal className="size-5 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <div className="border-b px-2 py-1">Actions</div>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/products/${item.uuid}/edit`}
                              className="flex items-center"
                            >
                              <Edit2 className="mr-2 size-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/products/${item.uuid}/stocks`}
                              className="flex items-center"
                            >
                              <SiNginxproxymanager className="mr-2 size-4" />{" "}
                              Manage Stock
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(item.uuid)}
                            className="flex items-center text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={activeColumnsCount}
                  className="h-[300px] text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <SearchX className="size-8 text-gray-400" />
                    <p className="text-lg font-semibold">
                      No results found for &quot;{searchTerm}&quot;
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          availableRowsPerPage={[7, 10, 20, 50]}
        />
      )}

      <ConfirmDeleteModal
        open={deleteId !== null}
        onCancel={() => !isDeleting && setDeleteId(null)} // Prevent close while deleting
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-80 w-full rounded-[10px] border bg-white dark:bg-gray-dark" />
  </div>
);
