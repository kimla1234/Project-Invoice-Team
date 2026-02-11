export interface InvoiceItem {
    id: number;
    invoiceId: number | null; 
    productId: number; 
    unitPrice: number;
    quantity: number;
    subtotal: number;
    createdAt: string;
    updatedAt: string;
    name:string;
    deletedAt?: string | null; 
}

export interface Invoice {
    expireDate: string;
    issueDate: string;
    invoiceNo: string;
    id: number;
    userId: number;
    clientId: number;
    status: string; 
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
    name:string;
}

export interface InvoiceRequest {
    expireDate: string;
    issueDate: string;
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