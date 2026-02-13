"use client";

import { useMemo, useState } from "react";
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
//import { QuotationData } from "@/types/quotation";
////import { ClientData } from "../Quotations/create-quotation/DownloadPDFButton";
//import { InvoiceData } from "@/types/invoice";
import QuotationTableSkeleton from "../skeletons/QuotationTableSkeleton";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "../ui/pagination-controls";
import { DeleteQuotations } from "../Quotations/delete-quotation/DeleteQuotations";
import { ClientData } from "../Quotations/create-quotation/DownloadPDFButton";
import { Invoice } from "@/types/invoice";

interface QuotationTableProps {
  data: QuotationData[];
  clients: ClientData[];
  loading: boolean;
  onRefresh: () => void;
}

export default function QuotationTable({
  data,
  clients,
  loading,
  onRefresh,
}: QuotationTableProps) {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  /* ======================
     DELETE
  ====================== */
  const handleConfirmDelete = () => {
    if (deleteId === null) return;

    const stored = JSON.parse(localStorage.getItem("quotations") || "[]");
    const updated = stored.filter((q: QuotationData) => q.id !== deleteId);
    localStorage.setItem("quotations", JSON.stringify(updated));

    toast({
      title: "Quotation deleted",
      description: "The quotation has been removed successfully.",
      className: "bg-green-600 text-white",
      duration: 3000,
    });

    setDeleteId(null);
    onRefresh();
  };

  /* ======================
     CONVERT TO INVOICE
  ====================== */
  const handleConvertQuotation = (quotation: QuotationData) => {
    if (!quotation) return;

    const items = (quotation.items ?? []).map((item, idx) => ({
      id: item.id ?? idx + 1,
      name: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
      total: item.total,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.total, 0);

    const oldInvoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");

    const newInvoice: Invoice = {
      id: oldInvoices.length > 0 ? Math.max(...oldInvoices.map(i => i.id)) + 1 : 1,
      invoiceNo: `INV-${String(oldInvoices.length + 1).padStart(4, "0")}`,
      clientId: quotation.clientId,
      issueDate: new Date().toISOString().slice(0, 10),
      //dueDate: undefined,
      items,
      subtotal,
      totalAmount: subtotal,
      status: "Unpaid",
    };

    localStorage.setItem("invoices", JSON.stringify([...oldInvoices, newInvoice]));

    toast({
      title: "Invoice Created",
      description: `${newInvoice.invoiceNo} created from quotation #${quotation.id}`,
      className: "bg-green-600 text-white",
    });

    // Dispatch a storage event to trigger invoice table refresh
    window.dispatchEvent(new Event("storage"));
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
              <TableHead className="text-right xl:pr-7.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((q) => (
                <TableRow
                  key={q.id}
                  className="border-[#eee] dark:border-dark-3"
                >
                  <TableCell className="font-medium xl:pl-7.5">
                    {`QUO-${String(q.id).padStart(4, "0")}`}
                  </TableCell>

                  <TableCell>
                    {clients.find((c) => c.id === q.clientId)?.name ?? "Unknown Client"}
                  </TableCell>

                  <TableCell>${Number(q.amount ?? 0).toFixed(2)}</TableCell>

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

                      <DropdownMenuContent align="end" className="w-48">
                        {/* VIEW */}
                        <DropdownMenuItem asChild>
                          <Link href={`/quotation/${q.id}`} className="flex items-center">
                            <Eye className="mr-2 size-4" /> View
                          </Link>
                        </DropdownMenuItem>

                        {/* EDIT */}
                        <DropdownMenuItem asChild>
                          <Link href={`/quotation/${q.id}/edit`} className="flex items-center">
                            <Edit2 className="mr-2 size-4" /> Edit
                          </Link>
                        </DropdownMenuItem>

                        {/* CONVERT */}
                        <DropdownMenuItem
                          onClick={() => handleConvertQuotation(q)}
                          className="flex items-center text-green-600"
                        >
                          <Repeat className="mr-2 size-4" /> Convert to Invoice
                        </DropdownMenuItem>

                        {/* DELETE */}
                        <DropdownMenuItem
                          onClick={() => setDeleteId(q.id)}
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
                <TableCell colSpan={5} className="h-[300px] text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="rounded-full bg-gray-100 p-4 dark:bg-dark-3">
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
