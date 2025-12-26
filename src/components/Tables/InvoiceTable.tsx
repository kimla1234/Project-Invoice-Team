"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { InvoiceData } from "@/types/invoice";
import QuotationTableSkeleton from "../skeletons/QuotationTableSkeleton";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "../ui/pagination-controls";
import { getClientsTableData } from "./clients";
import { ClientData } from "@/types/client";
import { DeleteInvoices } from "../Invoice/delete-invoice/DeleteInvoices";

interface InvoiceTableProps {
  searchTerm?: string;
  issueDate?: string;
}

export default function InvoiceTable({
  searchTerm = "",
  issueDate,
}: InvoiceTableProps) {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  // Fetch clients
  useEffect(() => {
    async function fetchClients() {
      const data = await getClientsTableData();
      setClients(data);
    }
    fetchClients();
  }, []);

  // Fetch invoices from localStorage
  const fetchInvoices = () => {
    setLoading(true);
    const stored = localStorage.getItem("invoices");
    const parsed: InvoiceData[] = stored ? JSON.parse(stored) : [];
    setInvoices(Array.isArray(parsed) ? parsed : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter invoices by search term and issueDate
  const filteredData = useMemo(() => {
    return invoices.filter((i) => {
      const clientName = clients.find((c) => c.id === i.clientId)?.name ?? "";
      const invoiceNo = i.invoiceNo?.toLowerCase() ?? "";
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        clientName.toLowerCase().includes(term) || invoiceNo.includes(term);
      const matchesDate = issueDate ? i.issueDate === issueDate : true;
      return matchesSearch && matchesDate;
    });
  }, [invoices, clients, searchTerm, issueDate]);

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

  const handleConfirmDelete = () => {
    if (deleteId === null) return;
    const stored = localStorage.getItem("invoices");
    const parsed: InvoiceData[] = stored ? JSON.parse(stored) : [];
    const updated = parsed.filter((i) => i.id !== deleteId);
    localStorage.setItem("invoices", JSON.stringify(updated));
    toast({
      title: "Invoice deleted",
      description: "The invoice has been removed successfully.",
      className: "bg-green-600 text-white",
      duration: 3000,
    });
    setDeleteId(null);
    fetchInvoices();
  };

  if (loading) return <QuotationTableSkeleton />;

  return (
    <div className="space-y-4">
      {/* Top Convert Quotation Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="mb-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Convert Quotation
        </button>
      </div>

      <div className="rounded-[10px] border bg-white dark:border-dark-3 dark:bg-gray-dark">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2">
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
            {paginatedData.length > 0 ? (
              paginatedData.map((i) => (
                <TableRow
                  key={i.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="font-medium text-dark dark:text-white xl:pl-7.5">
                    {i.invoiceNo ?? `INV-${String(i.id).padStart(4, "0")}`}
                  </TableCell>

                  <TableCell className="text-dark dark:text-white">
                    {clients.find((c) => c.id === i.clientId)?.name ??
                      "Unknown Client"}
                  </TableCell>

                  <TableCell className="font-medium text-dark dark:text-white">
                    ${Number(i.subtotal ?? 0).toFixed(2)}
                  </TableCell>

                  <TableCell className="font-medium text-dark dark:text-white">
                    ${Number(i.totalAmount ?? 0).toFixed(2)}
                  </TableCell>

                  <TableCell className="text-gray-500">
                    {i.issueDate
                      ? new Date(i.issueDate).toLocaleDateString("en-GB")
                      : "-"}
                  </TableCell>

                  <TableCell className="text-dark dark:text-white">
                    {i.status ?? "Unpaid"}
                  </TableCell>

                  <TableCell className="text-right xl:pr-7.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-3">
                          <MoreHorizontal className="size-5 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/invoices/${i.id}`}
                            className="flex items-center focus:bg-primary/10"
                          >
                            <Eye className="mr-2 size-4" /> View
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href={`/invoices/${i.id}/edit`}
                            className="flex items-center focus:bg-primary/10"
                          >
                            <Edit2 className="mr-2 size-4" /> Edit
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => setDeleteId(i.id)}
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
                <TableCell colSpan={8} className="h-[300px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="rounded-full bg-gray-100 p-4 dark:bg-dark-3">
                      <SearchX className="size-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-dark dark:text-white">
                      No invoices found
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

      <DeleteInvoices
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />

      
    </div>
  );
}
