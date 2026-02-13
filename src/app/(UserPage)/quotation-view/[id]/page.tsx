"use client";

import ViewInvoiceShare from "@/components/Invoices/view-invoice/ViewInvoiceShare";
import ViewQuotationShare from "@/components/Quotations/view-quotation/ViewQuotationShare";

import { useParams } from "next/navigation";

export default function ViewQuotationPage() {
  const { id } = useParams();
  return <ViewQuotationShare id={Number(id)} />;
}
