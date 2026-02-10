"use client";
import StockManage from '@/components/Products/stock/StockManage'
import React from 'react'
import { useParams } from "next/navigation";

export default function page() {
  const { uuid } = useParams();

  if (!uuid) return null;
  
  return (
    <StockManage productId={uuid as string}/>
  )
}
