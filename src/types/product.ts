// src/types/product.ts

export interface MyEventResponse {
  id: number;
  uuid: string;         
  name: string;
  image_url: string;     
  price: number;         
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_STOCK";  
  productTypeId: number; 
  productTypeName: string; 
  stockQuantity: number; 
  low_stock : number ,
  userId: number;
  currency_type : string,
  description?: string;      
  movements?: Movement[];    
}

// Movement interface
export interface Movement {
  productUuid: string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  note?: string;
  created_at:string
}

