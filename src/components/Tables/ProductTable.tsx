"use client";

import React, { useEffect, useMemo, useState } from "react";
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

import { ProductData } from "@/types/product";
import { getProductsTableData, deleteProduct } from "./fetch";
import { PaginationControls } from "../ui/pagination-controls";
import { ConfirmDeleteModal } from "../Products/ConfirmDeleteModal";
import { SiNginxproxymanager } from "react-icons/si";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ProductTableProps {
  visibleColumns: Record<string, boolean>;
  searchTerm: string;
  selectedCurrencies: string[];
  selectedStatuses: string[];
  onExportDataChange: (data: any[]) => void;
  onDeleted: () => void;
}

export function ProductTable({
  visibleColumns,
  searchTerm,
  selectedCurrencies,
  selectedStatuses,
  onExportDataChange,
  onDeleted,
}: ProductTableProps) {
  const [fullData, setFullData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getProductsTableData();
        setFullData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter logic
  const filteredData = useMemo(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();

    return fullData.filter((item) => {
      // 🔍 Search filter
      const matchSearch =
        item.name.toLowerCase().includes(lowerCaseSearch) ||
        item.type.toLowerCase().includes(lowerCaseSearch) ||
        item.unitPrice.toString().includes(lowerCaseSearch) ||
        (item.stock?.toString() || "").includes(lowerCaseSearch);

      // 🏷 Status filter (Product / Service)
      const matchStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(item.type.toLowerCase());

      // 💱 Currency filter

      const matchCurrency =
        selectedCurrencies.length === 0 ||
        selectedCurrencies.some(
          (cur) =>
            cur.trim().toUpperCase() === item.currency.trim().toUpperCase(),
        );

      return matchSearch && matchStatus && matchCurrency;
    });
  }, [fullData, searchTerm, selectedStatuses, selectedCurrencies]);

  // Reset page on search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatuses, selectedCurrencies]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Dynamic column span for "No Data"
  const activeColumnsCount =
    Object.values(visibleColumns).filter(Boolean).length + 1; // +1 for Stock

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  // ProductTable.tsx

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    const success = await deleteProduct(deleteId.toString());

    if (success) {
      // 1. Update State ក្នុង Table ឱ្យបាត់ Item ហ្នឹងភ្លាម
      setFullData((prev) => prev.filter((item) => item.id !== deleteId));

      // 2. ហៅ onDeleted ដើម្បីឱ្យ Parent Component (Products.tsx) ដឹងថាមានការលុប
      // បន្ទាប់មកវានឹងទៅ Update refreshKey ដើម្បីឱ្យ Header រត់ឡើងវិញ
      if (onDeleted) {
        onDeleted();
      }

      // 3. Show Success Toast
      toast({
        title: "Product deleted",
        description: "The product has been removed successfully.",
        className: "bg-green-600 text-white",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the product.",
        variant: "destructive",
        duration: 3000,
      });
    }

    setDeleteId(null);
  };

  // 📤 EXPORT DATA SYNC
  useEffect(() => {
    onExportDataChange(
      filteredData.map((item) => ({
        Name: item.name,
        Type: item.type,
        Stock: item.stock ?? "N/A",
        "Unit Price": item.unitPrice,
        Currency: item.currency,
      })),
    );
  }, [filteredData, onExportDataChange]);

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border bg-white dark:border-dark-3 dark:bg-gray-dark">
        <Table className="relative">
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2">
              {visibleColumns.Name && (
                <TableHead className="min-w-[155px] xl:pl-7.5">Name</TableHead>
              )}
              {visibleColumns.Type && <TableHead>Type</TableHead>}
              <TableHead>Stock</TableHead>
              {visibleColumns.UnitPrice && <TableHead>Unit Price</TableHead>}
              {visibleColumns.Actions && (
                <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  {visibleColumns.Name && (
                    <TableCell className="min-w-[155px] xl:pl-7.5">
                      <h5 className="font-medium text-dark dark:text-white">
                        {item.name}
                      </h5>
                    </TableCell>
                  )}
                  {visibleColumns.Type && (
                    <TableCell>
                      <div
                        className={cn(
                          "max-w-fit rounded-full px-3.5 py-1 text-sm font-medium",
                          item.type === "Product"
                            ? "bg-blue-50 text-blue-800"
                            : "bg-green-100 text-green-800",
                        )}
                      >
                        {item.type}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <p
                      className={cn(
                        "font-medium text-dark dark:text-white",
                        item.stock === 0 && "text-red-500",
                      )}
                    >
                      {item.stock ?? "N/A"}
                    </p>
                  </TableCell>
                  {visibleColumns.UnitPrice && (
                    <TableCell>
                      <p className="font-medium text-dark dark:text-white">
                        {
                          item.currency.toUpperCase() === "USD"
                            ? `${item.unitPrice.toFixed(2)} $ `
                            : item.currency.toUpperCase() === "KHR"
                              ? `${item.unitPrice.toLocaleString()} KHR `
                              : `${item.unitPrice}` // fallback for other currencies
                        }
                      </p>
                    </TableCell>
                  )}

                  {visibleColumns.Actions && (
                    // shadcn components use portals internally, fixing the clipping issue automatically
                    <TableCell className="text-right xl:pr-7.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {/* Use a button inside the trigger for proper semantics/styling */}
                          <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-3">
                            <MoreHorizontal className="size-5 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>

                        {/* Align the menu to the right side of the trigger */}
                        <DropdownMenuContent align="end" className="w-44">
                          <div className="border-b px-2 py-1">Actions</div>
                          <div>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/products/${item.id}/edit`}
                                className="flex items-center focus:bg-primary/10"
                              >
                                <Edit2 className="mr-2 size-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            {item.type === "Product" && (
                              <DropdownMenuItem asChild>
                                <Link
                                  href="/products/stock"
                                  className="flex items-center focus:bg-primary/10"
                                >
                                  <SiNginxproxymanager className="mr-2 size-4" />
                                  Manage Stock
                                </Link>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteId(item.id);
                              }}
                              className="flex items-center text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                          </div>
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
                    <div className="rounded-full bg-gray-100 p-4 dark:bg-dark-3">
                      <SearchX className="size-8 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-dark dark:text-white">
                        No results found
                      </p>
                      <p className="text-sm text-gray-500">
                        We couldn&apos;t find any products matching &quot;
                        {searchTerm}&quot;
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          availableRowsPerPage={[8, 10, 20, 50]}
        />
      )}

      <ConfirmDeleteModal
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// Table skeleton for loading
const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="rounded-[10px] border border-stroke bg-white shadow-sm dark:border-dark-3 dark:bg-gray-dark">
      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F7F9FC] dark:bg-dark-2">
              <th className="py-4 pl-7.5 text-left">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
              </th>
              <th className="px-4 py-4 text-left">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              </th>
              <th className="px-4 py-4 text-left">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
              </th>
              <th className="px-4 py-4 text-left">
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
              </th>
              <th className="py-4 pr-7.5 text-right">
                <div className="ml-auto h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, index) => (
              <tr
                key={index}
                className="border-b border-[#eee] dark:border-dark-3"
              >
                <td className="py-4 pl-7.5">
                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-6 w-20 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                </td>
                <td className="py-4 pr-7.5 text-right">
                  <div className="ml-auto h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="flex items-center justify-end gap-6">
      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-9 w-9 rounded-md bg-gray-200 dark:bg-gray-700"
          ></div>
        ))}
      </div>
    </div>
  </div>
);
