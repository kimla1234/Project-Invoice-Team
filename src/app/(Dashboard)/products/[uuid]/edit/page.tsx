"use client";

import EditProduct from "@/components/Products/edit-product/EditProduct";
import { useParams } from "next/navigation";

export default function Page() {
  const { uuid } = useParams();

  if (!uuid) return null;

  return <EditProduct productId={uuid as string} />;
}
