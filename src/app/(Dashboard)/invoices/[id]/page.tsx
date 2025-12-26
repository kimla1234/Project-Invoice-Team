"use client";

import ViewInvoice from "@/components/Invoice/view-invoice/ViewInvoices";
import { useParams } from "next/navigation";

export default function ViewInvoicePage() {
  const { id } = useParams();
  return <ViewInvoice id={Number(id)} />;
}
