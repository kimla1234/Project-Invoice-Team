import { normPlovApi } from "@/redux/api";
import { Quotation, QuotationCreateRequest,PaginatedQuotationResponse } from "@/types/quotation";

export const quotationApi = normPlovApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({

    // GET ALL QUOTATIONS (PAGINATED)
    getQuotations: builder.query<
      PaginatedQuotationResponse,
      { page?: number; size?: number }
    >({
      query: ({ page = 0, size = 10 }) => ({
        url: `/api/v1/quotations?page=${page}&size=${size}`,
        method: "GET",
      }),
      providesTags: ["Quotations"],
    }),

    // GET QUOTATION BY ID
    getQuotationById: builder.query<Quotation, number>({
      query: (id) => ({
        url: `/api/v1/quotations/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "Quotations", id },
      ],
    }),

    // CREATE QUOTATION
    createQuotation: builder.mutation<
      Quotation,
      QuotationCreateRequest
    >({
      query: (body) => ({
        url: `/api/v1/quotations`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quotations"],
    }),

    // UPDATE QUOTATION
    updateQuotation: builder.mutation<
      Quotation,
      { id: number; body: QuotationCreateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/quotations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Quotations", id },
        "Quotations",
      ],
    }),

    // DELETE QUOTATION
    deleteQuotation: builder.mutation<boolean, number>({
      query: (id) => ({
        url: `/api/v1/quotations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quotations"],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
} = quotationApi;
