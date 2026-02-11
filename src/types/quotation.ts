
// ITEM TYPES
export interface QuotationItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface QuotationItemResponse {
  id: number;
  quotationId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// REQUEST (POST / PUT)
export interface QuotationCreateRequest {
  userId: number;
  clientId: number;
  invoiceId?: number;

  quotationDate: string;      // ISO date string
  quotationExpire?: string;   // ISO date string

  items: QuotationItemRequest[];
}

// RESPONSE (GET)
export interface Quotation {
  id: number;
  userId: number;
  clientId: number;
  invoiceId?: number;

  quotationDate: string;
  quotationExpire?: string;

  totalAmount: number;

  items: QuotationItemResponse[];

  createdAt: string;
  updatedAt?: string;
}

// PAGINATION (OPTIONAL)
export interface PaginatedQuotationResponse {
  content: Quotation[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
