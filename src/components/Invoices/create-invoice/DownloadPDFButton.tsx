"use client";

import { useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { FiSkipBack } from "react-icons/fi";
import { useGetInvoiceByIdQuery } from "@/redux/service/invoices";
import { mockClients } from "@/components/Tables/clients";
import { useGetMySettingsQuery } from "@/redux/service/setting";

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

  const { data: setting, isLoading: loadingSetting } = useGetMySettingsQuery();
  

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

    // Add company logo if available
    if (setting?.companyLogoUrl) {
      try {
        const logoImg = new Image();
        logoImg.src = setting.companyLogoUrl;
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
        });
        doc.addImage(logoImg, 'PNG', margin, startY - 5, 30, 30);
        // Adjust startY if logo is added
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    }

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("Invoice", setting?.companyLogoUrl ? margin + 35 : margin, startY);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${invoice.invoiceNo}`, pageWidth - margin, startY, {
      align: "right",
    });

    startY += 8;
    doc.text(
      `Issue Date: ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("en-GB") : "N/A"}`,
      pageWidth - margin,
      startY,
      { align: "right" }
    );

    startY += 8;
    doc.text(
      `Due Date: ${invoice.expireDate ? new Date(invoice.expireDate).toLocaleDateString("en-GB") : "N/A"}`,
      pageWidth - margin,
      startY,
      { align: "right" }
    );

    startY += 15;

    // Company info from settings
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(setting?.companyName || "Company Name", margin, startY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    
    if (setting?.companyAddress) {
      startY += 6;
      doc.text(setting.companyAddress, margin, startY);
    }
    
    if (setting?.companyEmail || setting?.companyPhoneNumber) {
      startY += 6;
      const contactInfo = [
        setting?.companyEmail,
        setting?.companyPhoneNumber
      ].filter(Boolean).join(" | ");
      doc.text(contactInfo, margin, startY);
    }

    // Client info
    const client = mockClients.find((c) => c.id === invoice.clientId);
    const clientStartY = startY - (setting?.companyAddress ? 12 : 6);
    
    if (client) {
      doc.setFont("helvetica", "bold");
      doc.text(`Customer: ${client.name}`, pageWidth - margin, clientStartY, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");
      doc.text(
        `Address: ${client.address || "N/A"}`,
        pageWidth - margin,
        clientStartY + 6,
        { align: "right" }
      );
      doc.text(
        `Phone: ${client.contact || "N/A"}`,
        pageWidth - margin,
        clientStartY + 12,
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
    doc.setTextColor(...textColor);
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

    startY += 15;

    // Invoice Note
    if (setting?.invoiceNote) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      doc.text("Note:", margin, startY);
      
      doc.setFont("helvetica", "normal");
      startY += 5;
      const noteLines = doc.splitTextToSize(setting.invoiceNote, pageWidth - 2 * margin);
      doc.text(noteLines, margin, startY);
      startY += noteLines.length * 5 + 5;
    }

    // Signature
    if (setting?.signatureUrl) {
      try {
        const signatureImg = new Image();
        signatureImg.src = setting.signatureUrl;
        await new Promise((resolve, reject) => {
          signatureImg.onload = resolve;
          signatureImg.onerror = reject;
        });
        
        // Position signature on the left or right based on preference
        const signatureX = pageWidth - margin - 50;
        doc.addImage(signatureImg, 'PNG', signatureX, startY, 40, 20);
        startY += 25;
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Authorized Signature", signatureX + 20, startY, { align: "center" });
      } catch (error) {
        console.error("Failed to load signature:", error);
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Invoice Footer from settings or default message
      const footerText = setting?.invoiceFooter || "Thank you for your business";
      doc.text(footerText, margin, pageHeight - 14);
      
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
  if (isLoading || loadingSetting) {
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