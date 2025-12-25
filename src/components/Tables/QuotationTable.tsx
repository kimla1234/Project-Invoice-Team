"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit2, Trash2, SearchX } from "lucide-react";

import { QuotationData } from "@/types/quotation";
import QuotationTableSkeleton from "../skeletons/QuotationTableSkeleton";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "../ui/pagination-controls";
import { DeleteQuotations } from "../Quotations/delete-quotation/DeleteQuotations";

interface QuotationTableProps {
  searchTerm: string;
  issueDate?: string; // ISO format YYYY-MM-DD
}

export default function QuotationTable({
  searchTerm,
  issueDate,
}: QuotationTableProps) {
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  // ---------------------------
  // Fetch quotations from localStorage
  // ---------------------------
  const fetchQuotations = () => {
    setLoading(true);
    const stored = JSON.parse(localStorage.getItem("quotations") || "[]");

    // Ensure sequential IDs for display
    const mapped: QuotationData[] = stored.map((q: any, index: number) => ({
      id: index + 1, // sequential id
      name: q.client.name,
      issueDate: q.issueDate,
      amount: q.items.reduce((sum: number, item: any) => sum + item.total, 0),
      items: q.items,
    }));

    setQuotations(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Filtered data based on search and date
  const filteredData = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `QUO-${String(q.id).padStart(4, "0")}`.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = issueDate ? q.issueDate === issueDate : true;

      return matchesSearch && matchesDate;
    });
  }, [quotations, searchTerm, issueDate]);

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  // Delete quotation
  const handleConfirmDelete = () => {
    if (!deleteId) return;

    const stored = JSON.parse(localStorage.getItem("quotations") || "[]");
    const updated = stored.filter((q: any, index: number) => index + 1 !== deleteId);
    localStorage.setItem("quotations", JSON.stringify(updated));

    toast({
      title: "Quotation deleted",
      description: "The quotation has been removed successfully.",
      className: "bg-green-600 text-white",
      duration: 3000,
    });

    setDeleteId(null);
    fetchQuotations();
  };

  if (loading) return <QuotationTableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border bg-white dark:border-dark-3 dark:bg-gray-dark">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2">
              <TableHead className="xl:pl-7.5">Quotation No.</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((q) => (
                <TableRow key={q.id} className="border-[#eee] dark:border-dark-3">
                  <TableCell className="font-medium text-dark dark:text-white xl:pl-7.5">
                    {`QUO-${String(q.id).padStart(4, "0")}`}
                  </TableCell>
                  <TableCell className="text-dark dark:text-white">{q.name}</TableCell>
                  <TableCell className="font-medium text-dark dark:text-white">
                    ${q.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(q.issueDate).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-right xl:pr-7.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-3">
                          <MoreHorizontal className="size-5 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44">
                        <div className="border-b px-2 py-1 text-sm font-medium">Actions</div>
                        <DropdownMenuItem asChild>
                          <Link href={`/quotations/${q.id}`} className="flex items-center focus:bg-primary/10">
                            <Eye className="mr-2 size-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/quotations/${q.id}/edit`} className="flex items-center focus:bg-primary/10">
                            <Edit2 className="mr-2 size-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(q.id)}
                          className="flex items-center text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-[300px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="rounded-full bg-gray-100 p-4 dark:bg-dark-3">
                      <SearchX className="size-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-dark dark:text-white">
                      No quotations found
                    </p>
                    <p className="text-sm text-gray-500">
                      Try changing the search or date filter.
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

      <DeleteQuotations
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
