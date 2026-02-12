"use client";

import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ClientResponse } from "@/types/client";
import { MyEventResponse } from "@/types/product";

interface DownloadPDFButtonProps {
  quotation: {
    quotationNo: string;
    issueDate: string;
    expiryDate: string;
    items: MyEventResponse[];
    amount: number;
    notes: string;
    terms: string;
  };
  client: ClientResponse | null;
  taxRate: number;
}

export const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({
  quotation,
  client,
  taxRate,
}) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Quotation", 14, 20);

    doc.setFontSize(12);
    doc.text(`Quotation No: ${quotation.quotationNo}`, 14, 30);
    doc.text(`Issue Date: ${quotation.issueDate}`, 14, 36);
    doc.text(`Expiry Date: ${quotation.expiryDate}`, 14, 42);

    doc.text(`Client: ${client?.name || "N/A"}`, 14, 52);
    doc.text(`Address: ${client?.address || "N/A"}`, 14, 58);
    doc.text(`Phone: ${client?.phoneNumber || "N/A"}`, 14, 64);

    const tableData = quotation.items.map((item, i) => [
      i + 1,
      item.name,
      item.stockQuantity,
      item.price.toFixed(2),
      (item.price * item.stockQuantity).toFixed(2),
    ]);

    autoTable(doc, {
      head: [["#", "Product", "Qty", "Unit Price", "Total"]],
      body: tableData,
      startY: 70,
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 80;
    doc.text(`Subtotal: $${quotation.amount.toFixed(2)}`, 14, finalY + 10);
    const taxAmount = (quotation.amount * taxRate) / 100;
    if (taxRate > 0)
      doc.text(`Tax (${taxRate}%): $${taxAmount.toFixed(2)}`, 14, finalY + 16);
    doc.text(`Total: $${(quotation.amount + taxAmount).toFixed(2)}`, 14, finalY + 22);

    if (quotation.notes) doc.text(`Notes: ${quotation.notes}`, 14, finalY + 32);
    if (quotation.terms) doc.text(`Terms: ${quotation.terms}`, 14, finalY + 38);

    doc.save(`${quotation.quotationNo}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={generatePDF}
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Download PDF
    </button>
  );
};
