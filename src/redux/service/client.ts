import { normPlovApi } from "../api";
import {ClientCreateRequest, ClientResponse,} from "../../types/client";

export const clientApi = normPlovApi.injectEndpoints({
  endpoints: (builder) => ({
    createClient: builder.mutation<
      { message: string; data: ClientResponse },
      ClientCreateRequest
    >({
      query: (body) => ({
        url: "/api/v1/client/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invoices"], // or create "Clients" tag later
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateClientMutation,
} = clientApi;