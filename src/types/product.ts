// src/types/product.ts
import { StaticImageData } from "next/image";
export interface ProductData {
  id: number;
  name: string;
  unitPrice: number;
  stock: number;
  type: string; // add this line
  lowStockThreshold?: number;
  description?: string;
  currency? : string // ✅ ADD
  image?: string;
   movements?: Movement[];
}

// Movement interface
export interface Movement {
  id: number;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  note?: string;
  date: Date;
}