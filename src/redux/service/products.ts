import { normPlovApi } from "@/redux/api";
import { Movement, MyEventResponse } from "@/types/product";

// src/redux/service/products.ts

export const productsApi = normPlovApi.injectEndpoints({
    overrideExisting: true,
  endpoints: (builder) => ({
    getMyProducts: builder.query<MyEventResponse[], void>({
      query: () => ({
        url: `api/v1/products/my-products`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),

    createProduct: builder.mutation<void, any>({
      query: (newProduct) => ({
        url: `api/v1/products`,
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"], // This clears the cache so the list updates
    }),

    // ✅ Add this Delete Mutation
    deleteProduct: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `api/v1/products/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    getProductsByUuid: builder.query<MyEventResponse, string>({
      query: (uuid) => ({
        url: `api/v1/products/${uuid}`,
        method: "GET",
      }),
      providesTags: (result, error, uuid) => [{ type: "Products", id: uuid }],
    }),

    // ✅ UPDATE
    updateProduct: builder.mutation<
      MyEventResponse,
      { uuid: string; body: Partial<MyEventResponse> }
    >({
      query: ({ uuid, body }) => ({
        url: `api/v1/products/${uuid}`,
        method: "PATCH", // or PATCH
        body,
      }),
      invalidatesTags: (_r, _e, { uuid }) => [
        { type: "Products", uuid },
        { type: "Products" },
      ],
    }),

    updateStock: builder.mutation<
      MyEventResponse,
      {
        productUuid: string;
        quantity: number;
        type: "IN" | "OUT" | "ADJUST";
        note?: string;
      }
    >({
      query: ({ productUuid, quantity, type, note }) => ({
        url: `api/v1/stock/movement`,
        method: "POST",
        body: { productUuid, quantity, type, note },
      }),
      invalidatesTags: (_r, _e, { productUuid }) => [
        { type: "Products", uuid: productUuid },
        { type: "Products" },
      ],
    }),

    getStockMovement: builder.query<Movement[], string>({
      query: (uuid) => ({
        url: `api/v1/stock/movement/${uuid}`,
        method: "GET",
      }),

      transformResponse: (response: { message: string; data: Movement[] }) =>
        response.data,

      providesTags: ["Products"],
    }),

    postImage: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: `api/v1/media/upload-image`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["userProfile"],
    }),


  }),
});

export const {
  useGetMyProductsQuery,
  useGetProductsByUuidQuery,
  useDeleteProductMutation, 
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateStockMutation,
  useGetStockMovementQuery,
  usePostImageMutation
} = productsApi;
