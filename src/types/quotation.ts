// src/types/quotation.ts

import { BaseMessage } from "./product";

/*QUOTATION ITEM */

export interface QuotationItem {
  id: number;
  productUuid: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemTotal?: number; // Added for flexibility
  name?: string;
  productId?: number;
}

/*CREATE REQUEST */

export interface QuotationItemRequest {
  productUuid: string;
  quantity: number;
}

export interface QuotationCreateRequest {
  userId: number;
  clientId: number;
  invoiceId?: number;
  quotationNo?: number;
  quotationDate: string;
  quotationExpire: string;
  issueDate: string;      // frontend date
  expiryDate: string;     // frontend date
  status : string ; 
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

/* QUOTATION RESPONSE */

export interface Quotation {
  id: number;
  quotationNo: string;
  clientId: number;
  
  quotationDate?: string;
  issueDate?: string;
  
  expiryDate: string;
  
  total_amount?: number;
  amount?: number;
  totalAmount?: number;
  
  quotationExpire?: string;
  status: string;
  notes?: string;
  terms?: string;
  items: QuotationItem[];
  createdAt: string;
}

/* PAGINATION STRUCTURE */

export interface PaginatedQuotationResponse {
  content: Quotation[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

/* WRAPPED RESPONSE (LIKE PRODUCT) */

export type QuotationResponse = BaseMessage<Quotation>;
export type PaginatedQuotationWrapped = BaseMessage<PaginatedQuotationResponse>;
export type QuotationData = Quotation;
