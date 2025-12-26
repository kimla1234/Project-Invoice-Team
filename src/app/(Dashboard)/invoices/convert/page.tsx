"use client";

import { useSearchParams } from "next/navigation";
import ConvertQuotationToInvoice from "@/components/Invoice/convert-quotation/ConvertQuotationToInvoice";

export default function Page() {
  const searchParams = useSearchParams();
  const quotationId = Number(searchParams.get("quotationId"));

  if (!quotationId) return <p>No quotation selected</p>;

  return <ConvertQuotationToInvoice quotationId={quotationId} />;
}
