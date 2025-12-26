// services/mockInvoices.ts
import { InvoiceData } from "@/types/invoice";

export const mockInvoices: InvoiceData[] = [
  {
    id: 1,
    invoiceNo: "INV-0001",
    clientId: 1,
    issueDate: "2025-12-25",
    dueDate: "2026-01-10",
    items: [
      { id: 1, name: "Product A", qty: 2, unitPrice: 10, total: 20 },
      { id: 2, name: "Product B", qty: 3, unitPrice: 10, total: 30 },
    ],
    subtotal: 50,
    tax: 5,
    totalAmount: 55,
    status: "Unpaid",
  },
  {
    id: 2,
    invoiceNo: "INV-0002",
    clientId: 2,
    issueDate: "2025-12-22",
    dueDate: "2026-01-05",
    items: [
      { id: 1, name: "Product C", qty: 5, unitPrice: 18, total: 90 },
    ],
    subtotal: 90,
    tax: 9,
    totalAmount: 99,
    status: "Paid",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================
   READ
========================= */
export async function getInvoiceTableData(): Promise<InvoiceData[]> {
  await delay(500);
  return mockInvoices;
}

export async function getInvoiceById(id: number): Promise<InvoiceData | undefined> {
  await delay(300);
  return mockInvoices.find((i) => i.id === id);
}

/* =========================
   CREATE
========================= */
let nextInvoiceId = mockInvoices.length + 1;

export async function createInvoice(newInvoice: Partial<InvoiceData>): Promise<InvoiceData> {
  await delay(300);

  const items = newInvoice.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const tax = newInvoice.tax ?? 0;
  const totalAmount = subtotal + tax;

  const invoice: InvoiceData = {
    id: nextInvoiceId++,
    invoiceNo: newInvoice.invoiceNo ?? `INV-${String(nextInvoiceId).padStart(4, "0")}`,
    clientId: newInvoice.clientId ?? 0,
    issueDate: newInvoice.issueDate ?? new Date().toISOString().split("T")[0],
    dueDate: newInvoice.dueDate,
    items,
    subtotal,
    tax,
    totalAmount,
    status: newInvoice.status ?? "Unpaid",
  };

  mockInvoices.push(invoice);
  return invoice;
}

/* =========================
   UPDATE
========================= */
export async function updateInvoice(
  id: number,
  updatedData: Partial<InvoiceData>
): Promise<InvoiceData | null> {
  await delay(300);

  const index = mockInvoices.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const items = updatedData.items ?? mockInvoices[index].items ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const tax = updatedData.tax ?? mockInvoices[index].tax ?? 0;
  const totalAmount = subtotal + tax;

  mockInvoices[index] = {
    ...mockInvoices[index],
    ...updatedData,
    items,
    subtotal,
    tax,
    totalAmount,
  };

  return mockInvoices[index];
}

/* =========================
   DELETE
========================= */
export async function deleteInvoice(id: number): Promise<boolean> {
  await delay(300);

  const index = mockInvoices.findIndex((i) => i.id === id);
  if (index === -1) return false;

  mockInvoices.splice(index, 1);
  return true;
}
