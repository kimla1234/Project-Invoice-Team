// types/invoice.ts

export interface InvoiceItem {
  id: number;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  id: number;
  invoiceNo: string;       // e.g., INV-0001
  clientId: number;        // link to client table
  issueDate: string;       // date invoice was issued
  dueDate?: string;        // optional due date
  items?: InvoiceItem[];   // items/services in the invoice
  subtotal: number;        // sum of all items before tax
  tax?: number;            // optional tax
  totalAmount: number;     // subtotal + tax
  status?: "Paid" | "Unpaid" | "Partial"; // invoice payment status
}
