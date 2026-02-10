// app/invoices/[id]/edit/page.tsx
import EditInvoiceForm from "@/components/Invoices/edit-invoice/EditInvoices";

export default async function EditInvoicePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const invoiceId = Number(id);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-600">Edit Invoice #{invoiceId}</h1>
      </div>

      <div className="rounded-md bg-white p-8">
        <EditInvoiceForm invoiceId={invoiceId} />
      </div>
    </div>
  );
}