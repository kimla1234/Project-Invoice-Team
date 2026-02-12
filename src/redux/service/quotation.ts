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
      { page?: number; size?: number }
    >({
      query: ({ page = 0, size = 10 }) => ({
        url: `api/v1/quotations?page=${page}&size=${size}`,
        method: "GET",
      }),
      transformResponse: (
        response: BaseMessage<PaginatedQuotationResponse>
      ) => response.data,
      providesTags: ["Quotations"],
    }),

    /* GET BY ID */
    getQuotationById: builder.query<Quotation, number>({
      query: (id) => ({
        url: `api/v1/quotations/${id}`,
        method: "GET",
      }),
      transformResponse: (response: BaseMessage<Quotation>) =>
        response.data,
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
      transformResponse: (response: BaseMessage<Quotation>) =>
        response.data,
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
      transformResponse: (response: BaseMessage<Quotation>) =>
        response.data,
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
      transformResponse: (response: BaseMessage<boolean>) =>
        response.data,
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
      transformResponse: (response: BaseMessage<Quotation>) =>
        response.data,
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
      transformResponse: (response: BaseMessage<string>) =>
        response.data,
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
