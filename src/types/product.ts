// src/types/product.ts

export interface ProductData {
  id: number;
  name: string;
  type: "Product" | "Service";
  stock?: number; // Optional as per the image's stock tracking toggle
  unitPrice: number;
  currency: "USD" | "KHR";
  // Add these optional properties to fix the TypeScript error:
  cost?: number; 
  description?: string; 
  lowStockThreshold?: number;
}
