import { normPlovApi } from "../api";
import {ClientCreateRequest, ClientResponse, ClientUpdateRequest} from "../../types/client";

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
      invalidatesTags: ["Clients"], 
    }),

    updateClient: builder.mutation<
      { message: string; data: ClientResponse },
      { id: number; body: ClientUpdateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/client/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Clients"],
    }),

    deleteClient: builder.mutation<
      { message: string; data: ClientResponse },
      number
    >({
      query: (id) => ({
        url: `/api/v1/client/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Clients"],
    }),

    getMyClients: builder.query<ClientResponse[], void>({
      query: () => ({
        url: "/api/v1/client",
        method: "GET",
      }),
      providesTags: ["Clients"],
    }),

    getClientById: builder.query<ClientResponse, number>({
      query: (id) => ({
        url: `/api/v1/client/${id}`,
        method: "GET",
      }),
    }),


  }),
  overrideExisting: false,
});

export const {
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetMyClientsQuery,
  useGetClientByIdQuery,
} = clientApi;