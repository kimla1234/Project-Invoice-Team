"use client";
import StockManage from '@/components/Products/stock/StockManage'
import React from 'react'
import { useParams } from "next/navigation";

export default function page() {
  const params = useParams();
  const productId = params.id as string;
  return (
    <StockManage productId={productId}/>
  )
}
