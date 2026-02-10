// app/invoices/create/page.tsx
import CreateInvoiceForm from "@/components/Invoices/create/CreateInvoiceForm";

export default function CreateInvoicePage() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-600">Create Invoice</h1>
      </div>

      <div className="rounded-md bg-white p-8">
        <CreateInvoiceForm />
      </div>
    </div>
  );
}