"use client";

import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { QuotationData } from "@/types/quotation";

// ================== TYPES ==================

export interface ClientData {
  id?: number;
  name: string;
  address?: string;
  contact?: string;
}

type DownloadPDFButtonProps = {
  quotation: any;
  client: any;
  taxRate: number;
  user: any; // ✅ define user here
};

const htmlToText = (html: string) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

// ================== COMPONENT ==================
type Props = {
  quotation: QuotationData;
  client: ClientData | null;
  user: any;
  taxRate?: number;
};

export const DownloadPDFButton: React.FC<Props> = ({
  quotation,
  client,
  taxRate = 0,
  user,
}) => {
  const handleDownloadPDF = async () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let startY = 17;

    const primaryColor: [number, number, number] = [76, 58, 145];
    const textColor: [number, number, number] = [50, 50, 50];
    const greyBG: [number, number, number] = [240, 240, 240];

    // ================== HEADER ==================
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("Quotation", margin, startY);

    const displayId =
      quotation.quotationNo || `QUO-${String(quotation.id).padStart(4, "0")}`;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Quotation No: ${displayId}`, pageWidth - margin, startY, {
      align: "right",
    });

    startY += 8;
    doc.text(`Issue Date: ${quotation.issueDate}`, pageWidth - margin, startY, {
      align: "right",
    });

    // Add Expiry Date below Issue Date
    startY += 8;
    if (quotation.expiryDate) {
      doc.text(
        `Expiry Date: ${quotation.expiryDate}`,
        pageWidth - margin,
        startY,
        {
          align: "right",
        },
      );
    }

    startY += 5;

    // ================== ADD LOGO ==================
    if (user?.companyLogo) {
      try {
        const logoBase64 = user.companyLogo; // already 'data:image/png;base64,...'
        const imgProps = doc.getImageProperties(logoBase64);
        const logoWidth = 20; // adjust width
        const logoHeight = (imgProps.height * logoWidth) / imgProps.width; // maintain ratio

        // Add the image
        doc.addImage(
          logoBase64,
          "PNG",
          margin,
          startY - 7,
          logoWidth,
          logoHeight,
        );

        // Crucial: Update startY to be below the image, plus some margin
        startY += logoHeight + 0;
      } catch (error) {
        console.error("Failed to add logo:", error);
      }
    }

    // ================== COMPANY ==================
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(user?.companyName || "Company Name", margin, startY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    startY += 6;
    const address = `${user?.houseNo || ""} ${user?.street || ""}, ${user?.commune || ""}`;
    doc.text(address, margin, startY);
    startY += 6;
    const contact = `${user?.companyEmail || ""} | ${user?.companyPhone || ""}`;
    doc.text(contact, margin, startY);

    // ================== CLIENT ==================
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
        {
          align: "right",
        },
      );
      doc.text(
        `Phone: ${client.contact || "N/A"}`,
        pageWidth - margin,
        startY,
        {
          align: "right",
        },
      );
    }

    startY += 20;

    // ================== TABLE ==================
    autoTable(doc, {
      startY,
      theme: "grid",
      head: [["NO", "PRODUCT NAME", "QTY", "UNIT PRICE ($)", "TOTAL ($)"]],
      body:
        quotation.items?.map((item, i) => [
          i + 1,
          item.name,
          item.qty,
          item.unitPrice.toFixed(2),
          item.total.toFixed(2),
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

    // ================== TOTAL ==================
    const subtotal = quotation.items?.reduce((sum, i) => sum + i.total, 0) || 0;
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax;

    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, pageWidth - margin, startY, {
      align: "right",
    });

    if (taxRate > 0) {
      startY += 8;
      doc.text(
        `Tax (${taxRate * 100}%): $${tax.toFixed(2)}`,
        pageWidth - margin,
        startY,
        { align: "right" },
      );
    }

    startY += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(
      `Grand Total: $${grandTotal.toFixed(2)}`,
      pageWidth - margin,
      startY,
      { align: "right" },
    );

    // --- NOTES & TERMS HORIZONTAL SECTION ---
    const footerHeight = 25; // space reserved for footer
    const notesY = pageHeight - footerHeight - 30; // 60 is space for notes & terms

    const noteItems = htmlToText(quotation.notes || "")
      .split("•")
      .filter((item) => item.trim() !== "");
    const termItems = htmlToText(quotation.terms || "")
      .split("•")
      .filter((item) => item.trim() !== "");

    const lineHeight = 6;
    const columnGap = 10;
    const halfWidth = (pageWidth - margin * 2 - columnGap) / 2;

    // Render Titles
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Note *", margin, notesY);
    doc.text("Terms *", margin + halfWidth + columnGap, notesY);

    let lineY = notesY + lineHeight;
    doc.setFont("helvetica", "normal");

    // Notes column
    noteItems.forEach((note) => {
      const wrappedNoteLines = doc.splitTextToSize(note.trim(), halfWidth - 5);
      wrappedNoteLines.forEach((line: string) => {
        doc.text("•", margin, lineY);
        doc.text(line, margin + 5, lineY);
        lineY += lineHeight;
      });
    });

    // Terms column
    let termLineY = notesY + lineHeight;
    termItems.forEach((term) => {
      const wrappedTermLines = doc.splitTextToSize(term.trim(), halfWidth - 5);
      wrappedTermLines.forEach((line: string) => {
        doc.text("•", margin + halfWidth + columnGap, termLineY);
        doc.text(line, margin + halfWidth + columnGap + 5, termLineY);
        termLineY += lineHeight;
      });
    });


    // ================== FOOTER ==================
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);

      doc.setDrawColor(220, 220, 220);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

      doc.text(
        "Thank you for choosing " + user?.companyName,
        margin,
        pageHeight - 14,
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 14,
        { align: "right" },
      );
    }

    doc.save(`${displayId}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleDownloadPDF}
      className="flex w-full items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700"
    >
      ↓ Download (PDF)
    </button>
  );
};
