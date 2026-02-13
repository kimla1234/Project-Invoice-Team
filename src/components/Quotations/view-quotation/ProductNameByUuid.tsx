import { useGetProductsByIdQuery } from "@/redux/service/products";

interface ProductNameByUuidProps {
  id: number;
  fallback?: string;
}

export function ProductNameByUuid({ id, fallback }: ProductNameByUuidProps) {
  const { data: product, isLoading } = useGetProductsByIdQuery(id);

  if (isLoading) return <span>Loading...</span>;
  return <span>{product?.name || fallback || "Unknown Product"}</span>;
}
