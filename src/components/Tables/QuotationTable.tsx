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
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  SearchX,
  Repeat,
} from "lucide-react";
import QuotationTableSkeleton from "../skeletons/QuotationTableSkeleton";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "../ui/pagination-controls";

import { QuotationCreateRequest, QuotationData } from "@/types/quotation";
import { ClientResponse } from "@/types/client";
import {
  useDeleteQuotationMutation,
  useUpdateQuotationMutation,
} from "@/redux/service/quotation";
import { useCreateInvoiceMutation } from "@/redux/service/invoices";
import { DeleteQuotations } from "../Quotations/delete-quotation/DeleteQuotations";
import type { Invoice } from "@/types/invoice";

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

  const [deleteQuotation] = useDeleteQuotationMutation();
  const [updateQuotation] = useUpdateQuotationMutation();

  const updateBody = {
  status: "APPROVED" 
};

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteQuotation(deleteId).unwrap();
      toast({
        title: "Deleted",
        description: "Quotation deleted successfully",
        className: "bg-green-600 text-white",
      });
      // onRefresh(); // RTK Query invalidates tags, so manual refresh might not be needed, but keeping if parent handles pagination state reset
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quotation",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const [createInvoice] = useCreateInvoiceMutation();

  const handleConvertQuotation = async (quotation: QuotationData) => {
    if (!quotation) return;

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return new Date().toISOString().slice(0, 19);
      try {
        let dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) dateObj = new Date();
        return dateObj.toISOString().slice(0, 19);
      } catch (e) {
        return new Date().toISOString().slice(0, 19);
      }
    };

    try {
      // STEP 1: Create Invoice
      const invoiceData = {
        issueDate: formatDate(quotation.issueDate),
        expireDate: formatDate(quotation.expiryDate),
        clientId: quotation.clientId,
        subtotal: Number(quotation.totalAmount || quotation.amount) || 0,
        tax: 0,
        grandTotal: Number(quotation.totalAmount || quotation.amount) || 0,
        status: "PENDING",
        items: (quotation.items ?? []).map((item) => ({
          productId: item.productId || item.id,
          unitPrice: Number(item.unitPrice) || 0,
          quantity: Number(item.quantity) || 0,
          subtotal: Number(item.total) || 0,
          name: item.productName || item.name || "Unknown Product",
        })),
      };

      await createInvoice(invoiceData as any).unwrap();

      // STEP 2: Update Quotation Status
      // We send a minimal body to avoid 400 Bad Request validation errors
      const updateBody = {
        ...quotation, // Keep existing data
        status: "APPROVED",
        quotationStatus: "APPROVED",
      };

      try {
        await updateQuotation({
          id: quotation.id,
          body: updateBody as any,
        }).unwrap();

        toast({
          title: "Success",
          description: "Quotation converted and approved successfully!",
          className: "bg-green-600 text-white",
        });

        if (onRefresh) onRefresh();
      } catch (updateError: any) {
        console.error("Status update failed:", updateError);
        toast({
          title: "Partial Success",
          description: "Invoice created, but failed to update Quotation status.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      let title = "Conversion Failed";
      let description = "An unexpected error occurred.";

      if (error?.data?.message) {
        const msg = error.data.message;
        if (msg.toLowerCase().includes("stock")) {
          title = "Insufficient Stock";
          description = msg.replace(/400 BAD_REQUEST|"/g, "").trim();
        } else {
          description = msg;
        }
      }

      toast({ title, description, variant: "destructive" });
    }
  };

  if (loading) return <QuotationTableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border bg-white dark:border-dark-3 dark:bg-gray-dark">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2">
              {columnVisibility.QuotationNo && (
                <TableHead>Quotation No.</TableHead>
              )}
              {columnVisibility.Client && <TableHead>Client</TableHead>}
              {columnVisibility.Amount && <TableHead>Amount</TableHead>}
              {columnVisibility.IssueDate && <TableHead>Issue Date</TableHead>}
              {columnVisibility.Status && <TableHead>Status</TableHead>}
              {columnVisibility.Actions && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((q) => (
                <TableRow key={q.id}>
                  {columnVisibility.QuotationNo && (
                    <TableCell>
                      {q.quotationNo
                        ? `QUO-${String(q.quotationNo).padStart(4, "0")}`
                        : `QUO-${String(q.id).padStart(4, "0")}`}
                    </TableCell>
                  )}
                  {columnVisibility.Client && (
                    <TableCell>
                      {clients.find((c) => c.id === q.clientId)?.name ??
                        "Unknown Client"}
                    </TableCell>
                  )}
                  {columnVisibility.Amount && (
                    <TableCell>
                      $
                      {(
                        q.totalAmount ??
                        q.total_amount ??
                        q.amount ??
                        q.items?.reduce(
                          (sum, item) => sum + item.quantity * item.unitPrice,
                          0,
                        ) ??
                        0
                      ).toFixed(2)}
                    </TableCell>
                  )}
                  {columnVisibility.IssueDate && (
                    <TableCell>
                      {new Date(
                        q.quotationDate ?? q.issueDate ?? "",
                      ).toLocaleDateString()}
                    </TableCell>
                  )}
                  {columnVisibility.Status && (
                    <TableCell>
                      <span
                        className={`rounded-md font-normal px-2 py-1 text-xs${
                          (q.status || "PENDING") === "APPROVED"
                            ? "bg-green-200 text-green-700"
                            : "bg-yellow-200 text-yellow-600"
                        }`}
                      >
                        {q.status || "PENDING"}
                      </span>
                    </TableCell>
                  )}
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
                            <Link
                              href={`/quotation/${q.id}`}
                              className="flex items-center"
                            >
                              <Eye className="mr-2" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/quotation/${q.id}/edit`}
                              className="flex items-center"
                            >
                              <Edit2 className="mr-2" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          {q.status !== "APPROVED" && (
                            <DropdownMenuItem
                              onClick={() => handleConvertQuotation(q)}
                              className="flex items-center text-green-600"
                            >
                              <Repeat className="mr-2" /> Convert to Invoice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setDeleteId(q.id)}
                            className="flex items-center text-red-600"
                          >
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
                <TableCell colSpan={5} className="h-[300px] text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="rounded-full bg-gray-100 p-4">
                      <SearchX className="size-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold">No quotations found</p>
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
