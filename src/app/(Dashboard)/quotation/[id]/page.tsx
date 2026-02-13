"use client";

import QuotationViewPage from "@/components/Quotations/view-quotation/ViewQuotation";
import { useParams } from "next/navigation";

export default function ViewQuotationPage() {
  const { id } = useParams();
  return <QuotationViewPage id={Number(id)} />;
}
