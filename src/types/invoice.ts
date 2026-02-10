export interface InvoiceItem {
    id: number;
    invoiceId: number | null; // Added this field from response
    productId: number; // Changed from 'any' to 'number' based on response
    unitPrice: number;
    quantity: number;
    subtotal: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null; // Made optional since it's not in response
}

export interface Invoice {
    id: number;
    userId: number;
    clientId: number;
    status: string; // Changed from optional to required since it's in response
    subtotal: number;
    grandTotal: number;
    tax: number;
    createdAt: string;
    updatedAt: string;
    items: InvoiceItem[];
}

export interface InvoiceItemRequest {
    productId: number;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export interface InvoiceRequest {
    clientId: number;
    subtotal: number;
    tax: number;
    grandTotal: number;
    items?: InvoiceItemRequest[];
    status: string;
}

export interface PaginatedInvoiceResponse {
    content: Invoice[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
}