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
  quotationDate: string;
  quotationExpire: string;
  issueDate: string;      // frontend date
  expiryDate: string;     // frontend date
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

/* QUOTATION RESPONSE */

export interface Quotation {
  id: number;
  quotationNo: string;
  clientId: number;
  issueDate: string;
  expiryDate: string;
  amount: number;
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
}

/* WRAPPED RESPONSE (LIKE PRODUCT) */

export type QuotationResponse = BaseMessage<Quotation>;
export type PaginatedQuotationWrapped = BaseMessage<PaginatedQuotationResponse>;
