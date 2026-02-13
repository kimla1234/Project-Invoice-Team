"use client";

import ViewInvoice from "@/components/Invoices/view-invoice/ViewInvoices";
import ViewInvoiceShare from "@/components/Invoices/view-invoice/ViewInvoiceShare";
import { useParams } from "next/navigation";

export default function ViewInvoicePage() {
  const { id } = useParams();
  return <ViewInvoiceShare id={Number(id)} />;
}
