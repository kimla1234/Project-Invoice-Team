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
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit2, Trash2, SearchX, Share2 } from "lucide-react";
import QuotationTableSkeleton from "../skeletons/QuotationTableSkeleton";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "../ui/pagination-controls";
import { DeleteInvoices } from "../Invoices/delete-invoice/DeleteInvoices";
import {
  useGetMyInvoicesQuery,
  useDeleteInvoiceMutation,
  useUpdateInvoiceMutation,
} from "@/redux/service/invoices";
import { useGetMyClientsQuery } from "@/redux/service/client";
import { ClientResponse } from "@/types/client";
import { GrStatusCritical } from "react-icons/gr";

interface InvoiceTableProps {
  visibleColumns: Record<string, boolean>;
  searchTerm?: string;
  issueDate?: string;
}

export default function InvoiceTable({
  visibleColumns,
  searchTerm = "",
  issueDate,
}: InvoiceTableProps) {
  const { toast } = useToast();

  const { data: clients = [], isLoading: loadingClients } =
    useGetMyClientsQuery();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Pagination state (0-indexed for backend, 1-indexed for UI)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  // RTK Query hooks - pass 0-indexed page to backend
  const { data, isLoading, isError } = useGetMyInvoicesQuery({
    page: currentPage - 1, // Convert to 0-indexed
    size: rowsPerPage,
  });

  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();

  // Extract data from paginated response
  const invoices = data?.content ?? [];
  const totalItems = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  /* ======================
     FILTER (Client-side for search/date)
  ====================== */
  const filteredData = useMemo(() => {
    return invoices.filter((i) => {
      const clientName = clients.find((c) => c.id === i.clientId)?.name ?? "";
      const invoiceNo = `INV-${String(i.id).padStart(4, "0")}`;
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        clientName.toLowerCase().includes(term) ||
        invoiceNo.toLowerCase().includes(term);

      const matchesDate = issueDate ? i.createdAt.startsWith(issueDate) : true;

      return matchesSearch && matchesDate;
    });
  }, [invoices, clients, searchTerm, issueDate]);

  /* ======================
     COUNT VISIBLE COLUMNS
  ====================== */
  const visibleColumnCount = useMemo(() => {
    return Object.values(visibleColumns).filter(Boolean).length + 1; // +1 for Actions column (always visible)
  }, [visibleColumns]);

  /* ======================
     PAGINATION HANDLERS
  ====================== */
  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /* ======================
     STATUS UPDATE
  ====================== */
  /* ======================
   STATUS UPDATE
  ====================== */
  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    try {
      // Helper function to format date (same as in EditInvoiceForm)
      const formatDateForBackend = (dateString: string): string => {
        if (!dateString) return "";
        // Extract just the date part (YYYY-MM-DD) from the datetime string
        return dateString.split("T")[0];
      };

      // Prepare the invoice data with updated status
      const updatedInvoiceData = {
        clientId: invoice.clientId,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        grandTotal: invoice.grandTotal,
        status: newStatus,
        issueDate: formatDateForBackend(invoice.issueDate), // Format date
        expireDate: formatDateForBackend(invoice.expireDate), // Format date
        items: invoice.items.map((item) => ({
          productId: item.productId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
          name: item.name,
        })),
      };

      await updateInvoice({
        id: invoiceId,
        body: updatedInvoiceData,
      }).unwrap();

      toast({
        title: "Status updated",
        description: `Invoice status changed to ${newStatus}`,
        className: "bg-green-600 text-white",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Status update error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update invoice status.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  /* ======================
     DELETE
  ====================== */
  const handleConfirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteInvoice(deleteId).unwrap();

      toast({
        title: "Invoice deleted",
        description: "The invoice has been removed successfully.",
        className: "bg-green-600 text-white",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invoice.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDeleteId(null);
    }
  };

  const STATUS_OPTIONS = [
    {
      label: "Pending",
      value: "pending",
      dotColor: "bg-yellow-500",
      badgeClass: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    },
    {
      label: "Paid",
      value: "paid",
      dotColor: "bg-green-500",
      badgeClass: "bg-green-100 text-green-700 hover:bg-green-200",
    },
    {
      label: "Overdue",
      value: "overdue",
      dotColor: "bg-red-500",
      badgeClass: "bg-red-100 text-red-700 hover:bg-red-200",
    },
    {
      label: "Cancelled",
      value: "cancelled",
      dotColor: "bg-gray-500",
      badgeClass: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    },
  ];
  /* ======================
     GET STATUS COLOR
  ====================== */
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700 hover:bg-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-700 hover:bg-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  /* ======================
     LOADING & ERROR
  ====================== */
  if (isLoading) return <QuotationTableSkeleton />;

  if (isError) {
    return (
      <div className="rounded-[10px] border bg-white p-8 text-center">
        <p className="text-red-600">
          Failed to load invoices. Please try again.
        </p>
      </div>
    );
  }

  const handleShareLink = (invoiceId: number) => {
    const shareUrl = `${window.location.origin}/invoice-view/${invoiceId}`;

    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "Invoice link has been copied to clipboard.",
      className: "bg-purple-600 text-white",
      duration: 2000,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F7F9FC]">
              {visibleColumns.invoiceNo && (
                <TableHead className="xl:pl-7.5">Invoice No.</TableHead>
              )}
              {visibleColumns.client && <TableHead>Client</TableHead>}
              {visibleColumns.subtotal && <TableHead>Subtotal</TableHead>}
              {visibleColumns.totalAmount && (
                <TableHead>Total Amount</TableHead>
              )}
              {visibleColumns.issueDate && <TableHead>Issue Date</TableHead>}
              {visibleColumns.status && <TableHead>Status</TableHead>}
              <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((i) => (
                <TableRow key={i.id}>
                  {visibleColumns.invoiceNo && (
                    <TableCell className="font-medium xl:pl-7.5">
                      INV-{String(i.id).padStart(4, "0")}
                    </TableCell>
                  )}

                  {visibleColumns.client && (
                    <TableCell>
                      {clients.find((c) => c.id === i.clientId)?.name ??
                        "Unknown Client"}
                    </TableCell>
                  )}

                  {visibleColumns.subtotal && (
                    <TableCell>${Number(i.subtotal ?? 0).toFixed(2)}</TableCell>
                  )}

                  {visibleColumns.totalAmount && (
                    <TableCell>
                      ${Number(i.grandTotal ?? 0).toFixed(2)}
                    </TableCell>
                  )}

                  {visibleColumns.issueDate && (
                    <TableCell>
                      {new Date(i.issueDate).toLocaleDateString("en-GB")}
                    </TableCell>
                  )}

                  {/* STATUS DROPDOWN */}
                  {visibleColumns.status && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`cursor-pointer rounded px-2 py-1 text-xs transition-colors ${getStatusColor(i.status)}`}
                            disabled={isUpdating}
                          >
                            {i.status ?? "Pending"}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-32">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(i.id, "pending")}
                            className="cursor-pointer"
                          >
                            <span className="flex items-center">
                              <span className="mr-2 size-2 rounded-full bg-yellow-500"></span>
                              Pending
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(i.id, "paid")}
                            className="cursor-pointer"
                          >
                            <span className="flex items-center">
                              <span className="mr-2 size-2 rounded-full bg-green-500"></span>
                              Paid
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(i.id, "overdue")}
                            className="cursor-pointer"
                          >
                            <span className="flex items-center">
                              <span className="mr-2 size-2 rounded-full bg-red-500"></span>
                              Overdue
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(i.id, "cancelled")
                            }
                            className="cursor-pointer"
                          >
                            <span className="flex items-center">
                              <span className="mr-2 size-2 rounded-full bg-gray-500"></span>
                              Cancelled
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}

                  <TableCell className="text-right xl:pr-7.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full p-2 hover:bg-gray-100">
                          <MoreHorizontal className="size-5" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/invoices/${i.id}`}
                            className="flex items-center"
                          >
                            <Eye className="mr-2 size-4" /> View
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href={`/invoices/${i.id}/edit`}
                            className="flex items-center"
                          >
                            <Edit2 className="mr-2 size-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShareLink(i.id)}
                          className="flex cursor-pointer items-center"
                        >
                          <Share2 className="mr-2 size-4" /> Share Link
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => setDeleteId(i.id)}
                          className="flex items-center text-red-600"
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
                <TableCell
                  colSpan={visibleColumnCount}
                  className="h-[300px] text-center"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <SearchX className="size-8 text-gray-400" />
                    <p className="font-semibold">No invoices found</p>
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
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          availableRowsPerPage={[7, 10, 20, 50]}
        />
      )}

      <DeleteInvoices
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
