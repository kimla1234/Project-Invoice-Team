// src/redux/service/quotations.ts

import { normPlovApi } from "@/redux/api";
import {
  Quotation,
  QuotationCreateRequest,
  QuotationItemRequest,
  PaginatedQuotationResponse,
} from "@/types/quotation";
import { BaseMessage } from "@/types/product";

export const quotationsApi = normPlovApi.injectEndpoints({
  overrideExisting: true,

  endpoints: (builder) => ({

    /* GET ALL (PAGINATED) */
    getQuotations: builder.query<
      PaginatedQuotationResponse,
      { page?: number; size?: number; sort?: string }
    >({
      query: ({ page = 0, size = 10, sort = "" }) => ({
        url: `api/v1/quotations?page=${page}&size=${size}&sort=${sort}`,
        method: "GET",
      }),
      providesTags: ["Quotations"],
    }),

    /* GET BY ID */
    getQuotationById: builder.query<Quotation, number>({
      query: (id) => ({
        url: `api/v1/quotations/${id}`,
        method: "GET",
      }),

      providesTags: (result, error, id) => [
        { type: "Quotations", id },
      ],
    }),

    /* CREATE */
    createQuotation: builder.mutation<
      Quotation,
      QuotationCreateRequest
    >({
      query: (newQuotation) => ({
        url: `api/v1/quotations`,
        method: "POST",
        body: newQuotation,
      }),

      invalidatesTags: ["Quotations"],
    }),

    /* UPDATE */
    updateQuotation: builder.mutation<
      Quotation,
      { id: number; body: QuotationCreateRequest }
    >({
      query: ({ id, body }) => ({
        url: `api/v1/quotations/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "Quotations", id },
        "Quotations",
      ],
      
    }),

    /* DELETE */
    deleteQuotation: builder.mutation<boolean, number>({
      query: (id) => ({
        url: `api/v1/quotations/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Quotations"],
    }),

    /* ADD ITEM */
    addItemToQuotation: builder.mutation<
      Quotation,
      { quotationId: number; item: QuotationItemRequest }
    >({
      query: ({ quotationId, item }) => ({
        url: `api/v1/quotations/${quotationId}/items`,
        method: "POST",
        body: item,
      }),

      invalidatesTags: (result, error, { quotationId }) => [
        { type: "Quotations", id: quotationId },
        "Quotations",
      ],
    }),

    /* REMOVE ITEM */
    removeItemFromQuotation: builder.mutation<
      string,
      { quotationId: number; itemId: number }
    >({
      query: ({ quotationId, itemId }) => ({
        url: `api/v1/quotations/${quotationId}/items/${itemId}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, { quotationId }) => [
        { type: "Quotations", id: quotationId },
        "Quotations",
      ],
    }),

  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  useAddItemToQuotationMutation,
  useRemoveItemFromQuotationMutation,
} = quotationsApi;
