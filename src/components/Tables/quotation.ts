import { QuotationData } from "@/types/quotation";

// Mock quotation data (id is now number)
export const mockQuotations: QuotationData[] = [
  { id: 1, name: "Nazaby", amount: 50, issueDate: "2025-12-25" },
  { id: 2, name: "Nazaby", amount: 90, issueDate: "2025-12-22" },
  { id: 3, name: "Nazaby", amount: 60, issueDate: "2025-12-22" },
  { id: 4, name: "Nazaby", amount: 50, issueDate: "2025-12-25" },
  { id: 5, name: "Nazaby", amount: 90, issueDate: "2025-12-25" },
  { id: 6, name: "Nazaby", amount: 60, issueDate: "2025-12-25" },
  { id: 7, name: "Nazaby", amount: 50, issueDate: "2025-12-25" },
  { id: 8, name: "Nazaby", amount: 90, issueDate: "2025-12-24" },
  { id: 9, name: "Nazaby", amount: 60, issueDate: "2025-12-25" },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================
   Generate QUO
========================= */

export function generateQuotationNo(): string {
  const lastId =
    mockQuotations.length > 0
      ? Math.max(...mockQuotations.map((q) => q.id))
      : 0;

  const nextNumber = lastId + 1;
  return `QUO-${String(nextNumber).padStart(4, "0")}`;
}


/* =========================
   READ
========================= */
export async function getQuotationTableData(): Promise<QuotationData[]> {
  await delay(500);
  return mockQuotations;
}

export async function getQuotationById(id: number): Promise<QuotationData | undefined> {
  await delay(300);
  return mockQuotations.find((q) => q.id === id);
}

/* =========================
   CREATE
========================= */
let nextNumber = mockQuotations.length + 1;

export async function createQuotation(newQuotation: Partial<QuotationData>): Promise<QuotationData> {
  await delay(300);

  const quotation: QuotationData = {
    id: nextNumber++, // numeric id
    name: newQuotation.name ?? "New Quotation",
    amount: newQuotation.amount ?? 0,
    issueDate: newQuotation.issueDate ?? new Date().toISOString().split("T")[0],
  };

  mockQuotations.push(quotation);
  return quotation;
}

/* =========================
   UPDATE
========================= */
export async function updateQuotation(
  id: number,
  updatedData: Partial<QuotationData>
): Promise<QuotationData | null> {
  await delay(300);

  const index = mockQuotations.findIndex((q) => q.id === id);
  if (index === -1) return null;

  mockQuotations[index] = { ...mockQuotations[index], ...updatedData };
  return mockQuotations[index];
}

/* =========================
   DELETE
========================= */
export async function deleteQuotation(id: number): Promise<boolean> {
  await delay(300);

  const index = mockQuotations.findIndex((q) => q.id === id);
  if (index === -1) return false;

  mockQuotations.splice(index, 1);
  return true;
}

/* =========================
   SUMMARY
========================= */
export async function fetchQuotationSummary() {
  await delay(300);

  const totalQuotations = mockQuotations.length;
  const totalAmount = mockQuotations.reduce((sum, q) => sum + q.amount, 0);

  return { totalQuotations, totalAmount };
}

/* =========================
   FILTER (by name)
========================= */
export async function getFilteredQuotations(searchTerm: string) {
  await delay(300);

  return mockQuotations.filter((q) =>
    q.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}
