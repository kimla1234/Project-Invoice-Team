"use client";

import { useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { FiSkipBack } from "react-icons/fi";
import { useGetInvoiceByIdQuery } from "@/redux/service/invoices";
import { mockClients } from "@/components/Tables/clients";

interface ViewInvoiceProps {
  id: number;
}

export default function ViewInvoice({ id }: ViewInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Use Redux RTK Query to fetch invoice data
  const { 
    data: invoice, 
    isLoading, 
    isError, 
    error 
  } = useGetInvoiceByIdQuery(id, {
    skip: !id,
  });

  const handleDownload = async () => {
    if (!invoice) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let startY = 17;

    const primaryColor: [number, number, number] = [76, 58, 145];
    const textColor: [number, number, number] = [50, 50, 50];
    const greyBG: [number, number, number] = [240, 240, 240];

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("Invoice", margin, startY);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${invoice.invoiceNo}`, pageWidth - margin, startY, {
      align: "right",
    });

    startY += 8;
    doc.text(
      `Issue Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString("en-GB") : "N/A"}`,
      pageWidth - margin,
      startY,
      { align: "right" }
    );

    startY += 15;

    // Company info (placeholder - you can customize)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Your Company Name", margin, startY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    startY += 6;
    doc.text("Company Address", margin, startY);
    startY += 6;
    doc.text("Email | Phone", margin, startY);

    // Client info
    const client = mockClients.find((c) => c.id === invoice.clientId);
    if (client) {
      doc.setFont("helvetica", "bold");
      doc.text(`Customer: ${client.name}`, pageWidth - margin, startY - 12, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");
      doc.text(
        `Address: ${client.address || "N/A"}`,
        pageWidth - margin,
        startY - 6,
        { align: "right" }
      );
      doc.text(
        `Phone: ${client.contact || "N/A"}`,
        pageWidth - margin,
        startY,
        { align: "right" }
      );
    }

    startY += 20;

    // Table
    autoTable(doc, {
      startY,
      theme: "grid",
      head: [["NO", "PRODUCT NAME", "QTY", "UNIT PRICE ($)", "TOTAL ($)"]],
      body:
        invoice.items?.map((item, i) => [
          i + 1,
          item.name,
          item.quantity,
          Number(item.unitPrice ?? 0).toFixed(2),
          Number(item.subtotal ?? 0).toFixed(2),
        ]) || [],
      headStyles: {
        fillColor: greyBG,
        textColor,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 90 },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    doc.setFont("helvetica", "normal");
    doc.text(
      `Subtotal: $${Number(invoice.subtotal ?? 0).toFixed(2)}`,
      pageWidth - margin,
      startY,
      { align: "right" }
    );

    startY += 8;
    doc.text(
      `Tax: $${Number(invoice.tax ?? 0).toFixed(2)}`,
      pageWidth - margin,
      startY,
      { align: "right" }
    );

    startY += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(
      `Grand Total: $${Number(invoice.grandTotal ?? 0).toFixed(2)}`,
      pageWidth - margin,
      startY,
      { align: "right" }
    );

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      doc.text("Thank you for your business", margin, pageHeight - 14);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 14,
        { align: "right" }
      );
    }

    doc.save(`invoice-${invoice.invoiceNo}.pdf`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="spinner-border mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <p className="text-red-500">Error loading invoice: {error?.toString()}</p>
        <Link
          href="/invoices"
          className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-purple-600 transition hover:border-purple-400 hover:text-purple-700 dark:border-dark-3 dark:bg-gray-800"
        >
          <FiSkipBack className="mr-2 h-5 w-5" />
          Back to Invoices
        </Link>
      </div>
    );
  }

  // No invoice found
  if (!invoice) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6">
        <p className="p-4 text-gray-700 dark:text-gray-300">Invoice not found.</p>
        <Link
          href="/invoices"
          className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-purple-600 transition hover:border-purple-400 hover:text-purple-700 dark:border-dark-3 dark:bg-gray-800"
        >
          <FiSkipBack className="mr-2 h-5 w-5" />
          Back to Invoices
        </Link>
      </div>
    );
  }

  const client = mockClients.find((c) => c.id === invoice.clientId);

  return (
     <button
          onClick={handleDownload}
          type="button"
          className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700"
        >
          ↓ Download Invoice (PDF)
        </button>
  );
}