// src/redux/service/invoices.ts
import { normPlovApi } from "@/redux/api";
import { Invoice, InvoiceRequest, InvoiceItemRequest, PaginatedInvoiceResponse } from "@/types/invoice";

export const invoicesApi = normPlovApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyInvoices: builder.query<PaginatedInvoiceResponse, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 }) => ({
        url: `api/v1/invoices?page=${page}&size=${size}`,
        method: "GET",
      }),
      providesTags: ["Invoices"],
    }),

    getInvoiceById: builder.query<Invoice, number>({
      query: (id) => ({
        url: `api/v1/invoices/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Invoices", id }],
    }),
    // http://localhost:8081/api/v1/invoices/7

    createInvoice: builder.mutation<Invoice, InvoiceRequest>({
      query: (newInvoice) => ({
        url: `api/v1/invoices`,
        method: "POST",
        body: newInvoice,
      }),
      invalidatesTags: ["Invoices", "Products"], // ← Also invalidate products to update stock
    }),

    deleteInvoice: builder.mutation<boolean, number>({
      query: (id) => ({
        url: `api/v1/invoices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoices"],
    }),

    updateInvoice: builder.mutation<Invoice, { id: number; body: InvoiceRequest }>({
      query: ({ id, body }) => ({
        url: `api/v1/invoices/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Invoices", id },
        "Invoices",
        "Products", 
      ],
    }),

    addItemToInvoice: builder.mutation<Invoice, { invoiceId: number; item: InvoiceItemRequest }>({
      query: ({ invoiceId, item }) => ({
        url: `api/v1/invoices/${invoiceId}/items`,
        method: "POST",
        body: item,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: "Invoices", id: invoiceId },
        "Invoices",
        "Products", // ← Invalidate products to refresh stock
      ],
    }),

    removeItemFromInvoice: builder.mutation<string, { invoiceId: number; itemId: number }>({
      query: ({ invoiceId, itemId }) => ({
        url: `api/v1/invoices/${invoiceId}/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: "Invoices", id: invoiceId },
        "Invoices",
        "Products", // ← Invalidate products to refresh stock
      ],
    }),
  }),
});

export const {
  useGetMyInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useAddItemToInvoiceMutation,
  useRemoveItemFromInvoiceMutation,
} = invoicesApi;