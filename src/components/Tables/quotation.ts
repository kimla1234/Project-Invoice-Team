// services/mockQuotations.ts
//import { QuotationData } from "@/types/quotation";
/*
import { QuotationData } from "./fetch";

// Mock quotation data
export const mockQuotations: QuotationData[] = [
  {
    id: 1,
    clientId: 1, // John Doe
    amount: 50,
    issueDate: "2025-12-25",
    items: [
      { id: 1, name: "Product A", qty: 2, unitPrice: 10, total: 20 },
      { id: 2, name: "Product B", qty: 3, unitPrice: 10, total: 30 },
    ],
  },
  {
    id: 2,
    clientId: 2, // Jane Smith
    amount: 90,
    issueDate: "2025-12-22",
    items: [{ id: 1, name: "Product C", qty: 5, unitPrice: 18, total: 90 }],
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================
   READ
========================= 

export async function getQuotationTableData(): Promise<QuotationData[]> {
  await delay(500);
  return mockQuotations;
}

export async function getQuotationById(id: number): Promise<QuotationData | undefined> {
  await delay(300);
  return mockQuotations.find(q => q.id === id);
}
*/
/* =========================
   CREATE
========================= 
let nextNumber = mockQuotations.length + 1;

export async function createQuotation(newQuotation: Partial<QuotationData>): Promise<QuotationData> {
  await delay(300);

  const quotation: QuotationData = {
    id: nextNumber++,
    clientId: newQuotation.clientId ?? 0, // <-- store only clientId
    issueDate: newQuotation.issueDate ?? new Date().toISOString().split("T")[0],
    items: newQuotation.items ?? [],
    amount: newQuotation.amount ?? 0,
  };

  mockQuotations.push(quotation);
  return quotation;
}
*/
/* =========================
   UPDATE
========================= 
export async function updateQuotation(
  id: number,
  updatedData: Partial<QuotationData>
): Promise<QuotationData | null> {
  await delay(300);

  const index = mockQuotations.findIndex(q => q.id === id);
  if (index === -1) return null;

  mockQuotations[index] = {
    ...mockQuotations[index],
    ...updatedData,
    items: updatedData.items ?? mockQuotations[index].items,
  };

  return mockQuotations[index];
}
*/
/* =========================
   DELETE
========================= 
export async function deleteQuotation(id: number): Promise<boolean> {
  await delay(300);

  const index = mockQuotations.findIndex(q => q.id === id);
  if (index === -1) return false;

  mockQuotations.splice(index, 1);
  return true;
}

*/