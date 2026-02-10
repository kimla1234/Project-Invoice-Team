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
    <EditInvoiceForm invoiceId={invoiceId} />
  );
}