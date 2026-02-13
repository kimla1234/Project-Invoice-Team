// services/initInvoices.ts
//import { InvoiceData } from "@/types/invoice";

import { Invoice } from "@/components/Tables/fetch";

export function initQuotations() {
  if (!localStorage.getItem("quotations")) {
    localStorage.setItem(
      "quotations",
      JSON.stringify([
        {
          id: 1,
          name: "Nazaby",
          amount: 50,
          issueDate: "2025-12-25",
          items: [
            { id: 1, name: "Product A", qty: 2, unitPrice: 10, total: 20 },
            { id: 2, name: "Product B", qty: 3, unitPrice: 10, total: 30 },
          ],
        },
      ])
    );
  }
}

export function initInvoices() {
  if (!localStorage.getItem("invoices")) {
    const initialInvoices: Invoice[] = [
      //{
       // id: 1,
        //invoiceNo: "INV-0001",
       // clientId: 1,
        //issueDate: "2025-12-25",
        //dueDate: "2026-01-10",
        //items: [
        //  { id: 1, name: "Product A", qty: 2, unitPrice: 10, total: 20 },
        //  { id: 2, name: "Product B", qty: 3, unitPrice: 10, total: 30 },
        //],
        //subtotal: 50,
        //tax: 5,
        //totalAmount: 55,
        //status: "Unpaid",
      //},
    ];

    localStorage.setItem("invoices", JSON.stringify(initialInvoices));
  }
}
