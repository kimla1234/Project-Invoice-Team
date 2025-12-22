"use client";

import EditProduct from "@/components/Products/edit-product/EditProduct";
import { useParams } from "next/navigation";


export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return <EditProduct productId={productId} />;
}
