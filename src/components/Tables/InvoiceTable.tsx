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
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  SearchX,
} from "lucide-react";
import QuotationTableSkeleton from "../skeletons/QuotationTableSkeleton";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "../ui/pagination-controls";
import { getClientsTableData } from "./clients";
import { ClientData } from "@/types/client";
import { DeleteInvoices } from "../Invoices/delete-invoice/DeleteInvoices";
import { 
  useGetMyInvoicesQuery, 
  useDeleteInvoiceMutation 
} from "@/redux/service/invoices";

interface InvoiceTableProps {
  searchTerm?: string;
  issueDate?: string;
}

export default function InvoiceTable({ searchTerm = "", issueDate }: InvoiceTableProps) {
  const { toast } = useToast();

  const [clients, setClients] = useState<ClientData[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Pagination state (0-indexed for backend, 1-indexed for UI)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  // RTK Query hooks - pass 0-indexed page to backend
  const { data, isLoading, isError } = useGetMyInvoicesQuery({ 
    page: currentPage - 1,  // Convert to 0-indexed
    size: rowsPerPage 
  });
  
  const [deleteInvoice] = useDeleteInvoiceMutation();

  // Extract data from paginated response
  const invoices = data?.content ?? [];
  const totalItems = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  /* ======================
     FETCH CLIENTS
  ====================== */
  useEffect(() => {
    async function fetchClients() {
      const clientsData = await getClientsTableData();
      setClients(clientsData);
    }
    fetchClients();
  }, []);

  /* ======================
     FILTER (Client-side for search/date)
  ====================== */
  const filteredData = useMemo(() => {
    return invoices.filter((i) => {
      const clientName = clients.find((c) => c.id === i.clientId)?.name ?? "";
      const invoiceNo = `INV-${String(i.id).padStart(4, "0")}`;
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        clientName.toLowerCase().includes(term) || invoiceNo.toLowerCase().includes(term);

      const matchesDate = issueDate ? i.createdAt.startsWith(issueDate) : true;

      return matchesSearch && matchesDate;
    });
  }, [invoices, clients, searchTerm, issueDate]);

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

  /* ======================
     LOADING & ERROR
  ====================== */
  if (isLoading) return <QuotationTableSkeleton />;

  if (isError) {
    return (
      <div className="rounded-[10px] border bg-white p-8 text-center">
        <p className="text-red-600">Failed to load invoices. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F7F9FC]">
              <TableHead className="xl:pl-7.5">Invoice No.</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="xl:pl-7.5 font-medium">
                    INV-{String(i.id).padStart(4, "0")}
                  </TableCell>

                  <TableCell>
                    {clients.find((c) => c.id === i.clientId)?.name ?? "Unknown Client"}
                  </TableCell>

                  <TableCell>${Number(i.subtotal ?? 0).toFixed(2)}</TableCell>
                  <TableCell>${Number(i.grandTotal ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(i.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      i.status === 'paid' ? 'bg-green-100 text-green-700' :
                      i.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {i.status ?? "Pending"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right xl:pr-7.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full p-2 hover:bg-gray-100">
                          <MoreHorizontal className="size-5" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/${i.id}`} className="flex items-center">
                            <Eye className="mr-2 size-4" /> View
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/${i.id}/edit`} className="flex items-center">
                            <Edit2 className="mr-2 size-4" /> Edit
                          </Link>
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
                <TableCell colSpan={7} className="h-[300px] text-center">
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