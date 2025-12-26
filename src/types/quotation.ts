export interface QuotationItem {
  id: number;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

// types/quotation.ts
export interface QuotationData {
  id: number;
  clientId: number; // <-- link to client table
  amount: number;
  issueDate: string;
  items?: {
    id: number;
    name: string;
    qty: number;
    unitPrice: number;
    total: number;
  }[];
}

