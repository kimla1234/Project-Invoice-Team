import { normPlovApi } from "../api";

// Define more specific types for the responses and requests
type RegisterResponse = { message: string }; // Example response type

// Define the request data types
type RegisterRequest = {
  data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
};

export const authApi = normPlovApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // register user
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: ({ data }) => ({
        url: `api/v1/auth/register`,
        method: "POST",
        body: data,
      }),
    }),

    getGoogle: builder.query({
      query: () => ({
        url: `api/v1/auth/google`,
        method: "GET",
      }),
    }),
    getGoogleCallback: builder.query({
      query: () => ({
        url: `api/v1/auth/google/callback`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,

  useGetGoogleCallbackQuery,
  useGetGoogleQuery,
} = authApi;
