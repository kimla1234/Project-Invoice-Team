"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { QuotationData } from "@/types/quotation";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { ClientData } from "@/types/client";
import { getClientsTableData } from "@/components/Tables/clients";

interface ConvertQuotationProps {
  quotationId: number; // ID of the quotation to convert
}

export default function ConvertQuotationToInvoice({ quotationId }: ConvertQuotationProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [quotation, setQuotation] = useState<QuotationData | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    // Load clients
    async function fetchClients() {
      const data = await getClientsTableData();
      setClients(data);
    }
    fetchClients();

    // Load quotation from localStorage
    const storedQuotations = JSON.parse(localStorage.getItem("quotations") || "[]");
    const q: QuotationData | undefined = storedQuotations.find((q: QuotationData) => q.id === quotationId);
    if (q) {
      setQuotation(q);
      const client = clients.find(c => c.id === q.clientId) ?? null;
      setSelectedClient(client);
    }
  }, [quotationId, clients]);

  useEffect(() => {
    // Generate new invoice number
    const oldInvoices: InvoiceData[] = JSON.parse(localStorage.getItem("invoices") || "[]");
    const maxId = oldInvoices.length > 0 ? Math.max(...oldInvoices.map((i: any) => i.id)) : 0;
    setInvoiceNo(`INV-${String(maxId + 1).padStart(4, "0")}`);
  }, []);

  const handleConvert = () => {
    if (!quotation) return;
    if (!selectedClient) {
      toast({ title: "Select client", description: "Client not found.", className: "bg-red-600 text-white", duration: 3000 });
      return;
    }

    // Map quotation items to invoice items
    const items: InvoiceItem[] = quotation.items?.map((item, index) => ({
      id: item.id ?? index + 1,
      name: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
      total: item.total,
    })) ?? [];

    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const totalAmount = subtotal;

    const oldInvoices: InvoiceData[] = JSON.parse(localStorage.getItem("invoices") || "[]");

    const newInvoice: InvoiceData = {
      id: oldInvoices.length > 0 ? Math.max(...oldInvoices.map(i => i.id)) + 1 : 1,
      invoiceNo,
      clientId: selectedClient.id,
      issueDate,
      dueDate: undefined,
      items,
      subtotal,
      totalAmount,
      status: "Unpaid",
    };

    // Save to localStorage
    localStorage.setItem("invoices", JSON.stringify([...oldInvoices, newInvoice]));

    toast({ title: "Invoice Created", description: `${newInvoice.invoiceNo} created from quotation!`, className: "bg-green-600 text-white", duration: 3000 });

    router.push("/invoices");
  };

  if (!quotation) return <p>Loading quotation...</p>;

  return (
    <div className="p-10">
      <h2 className="mb-4 text-xl font-semibold">Convert Quotation {quotation.id} to Invoice</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Invoice No</label>
        <input type="text" value={invoiceNo} readOnly className="w-full rounded border bg-gray-100 p-2" />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Client</label>
        <select
          value={selectedClient?.id ?? ""}
          onChange={(e) => setSelectedClient(clients.find(c => c.id === Number(e.target.value)) ?? null)}
          className="w-full rounded border p-2"
        >
          <option value="">Select Client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Issue Date</label>
        <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full rounded border p-2" />
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Items</h3>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">No</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Qty</th>
              <th className="border px-2 py-1">Unit Price</th>
              <th className="border px-2 py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{item.name}</td>
                <td className="border px-2 py-1">{item.qty}</td>
                <td className="border px-2 py-1">{item.unitPrice.toFixed(2)}</td>
                <td className="border px-2 py-1">{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleConvert}
        className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
      >
        Convert to Invoice
      </button>
    </div>
  );
}
