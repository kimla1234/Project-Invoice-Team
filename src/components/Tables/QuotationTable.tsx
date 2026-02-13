"use client";

import React, { useMemo, useState } from "react";
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
import { MoreHorizontal, Eye, Edit2, Trash2, Repeat, SearchX } from "lucide-react";
import QuotationTableSkeleton from "../skeletons/QuotationTableSkeleton";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "../ui/pagination-controls";

import { QuotationData } from "@/types/quotation";
import { ClientResponse } from "@/types/client";
import { DeleteQuotations } from "../Quotations/delete-quotation/DeleteQuotations";

interface QuotationTableProps {
  data: QuotationData[];
  clients: ClientResponse[];
  loading: boolean;
  onRefresh: () => void;
  columnVisibility: Record<string, boolean>;
}

export default function QuotationTable({
  data,
  clients,
  loading,
  onRefresh,
  columnVisibility,
}: QuotationTableProps) {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  const handleConfirmDelete = () => {
    // Simulate delete (call API here)
    toast({
      title: "Deleted",
      description: "Quotation deleted successfully",
      className: "bg-green-600 text-white",
    });
    setDeleteId(null);
    onRefresh();
  };

  const handleConvertQuotation = (quotation: QuotationData) => {
    toast({
      title: "Converted",
      description: `Quotation #${quotation.id} converted to invoice`,
      className: "bg-green-600 text-white",
    });
  };

  if (loading) return <QuotationTableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border bg-white dark:border-dark-3 dark:bg-gray-dark">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2">
              {columnVisibility.QuotationNo && <TableHead>Quotation No.</TableHead>}
              {columnVisibility.Client && <TableHead>Client</TableHead>}
              {columnVisibility.Amount && <TableHead>Amount</TableHead>}
              {columnVisibility.IssueDate && <TableHead>Issue Date</TableHead>}
              {columnVisibility.Actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((q) => (
                <TableRow key={q.id}>
                  {columnVisibility.QuotationNo && (
                    <TableCell>{q.quotationNo ?? `QUO-${String(q.id).padStart(4, "0")}`}</TableCell>
                  )}
                  {columnVisibility.Client && (
                    <TableCell>{clients.find((c) => c.id === q.clientId)?.name ?? "Unknown Client"}</TableCell>
                  )}
                  {columnVisibility.Amount && <TableCell>${q.amount?.toFixed(2) ?? 0}</TableCell>}
                  {columnVisibility.IssueDate && <TableCell>{new Date(q.issueDate).toLocaleDateString()}</TableCell>}
                  {columnVisibility.Actions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-3">
                            <MoreHorizontal />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/quotation/${q.id}`} className="flex items-center">
                              <Eye className="mr-2" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/quotation/${q.id}/edit`} className="flex items-center">
                              <Edit2 className="mr-2" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleConvertQuotation(q)} className="flex items-center text-green-600">
                            <Repeat className="mr-2" /> Convert to Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(q.id)} className="flex items-center text-red-600">
                            <Trash2 className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-[300px]">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="rounded-full bg-gray-100 p-4">
                      <SearchX className="size-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold">No quotations found</p>
                    <p className="text-sm text-gray-500">Try changing the search or date filter.</p>
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
          onRowsPerPageChange={(val) => {
            setRowsPerPage(val);
            setCurrentPage(1);
          }}
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
