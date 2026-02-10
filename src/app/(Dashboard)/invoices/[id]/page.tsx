"use client";

import ViewInvoice from "@/components/Invoices/view-invoice/ViewInvoices";
import { useParams } from "next/navigation";

export default function ViewInvoicePage() {
  const { id } = useParams();
  return <ViewInvoice id={Number(id)} />;
}
