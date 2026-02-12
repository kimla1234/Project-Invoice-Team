import {
  createApi,
  fetchBaseQuery,
  BaseQueryApi,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "./store";
import { setAccessToken } from "./feature/auth/authSlice";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

type BaseQueryArgs = {
  url: string;
  method?: string;
  body?: unknown;
  params?: Record<string, any>;
  headers?: Record<string, string>;
};

const API_URL = process.env.NEXT_PUBLIC_NORMPLOV_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // Force the server to return JSON
    headers.set("Accept", "application/json");

    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReAuth = async (
  args: string | BaseQueryArgs,
  api: BaseQueryApi,
  extraOptions: Record<string, unknown> = {},
) => {
  // 1. Wait for the mutex to be unlocked if another request is already refreshing the token
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  // 2. If the request fails with a 401 Unauthorized error
  if (result.error?.status === 401) {
    // Check if another refresh process is already in progress
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        console.log("Refreshing access token...");

        // Call the Next.js Route Handler (api/refresh)
        const refreshResponse = await fetch("/api/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          // 3. Store the new Access Token in the Redux state
          api.dispatch(setAccessToken(data.accessToken));

          // 4. Retry the original failed request with the new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // If refresh fails (Session expired), trigger logout
          api.dispatch({ type: "auth/logout" });
          // Optional: Redirect to login
          // window.location.href = "/login";
        }
      } catch (err) {
        console.error("Token refresh process failed:", err);
      } finally {
        // Release the lock so other pending requests can proceed
        release();
      }
    } else {
      // If the mutex is locked, wait for it to unlock then retry the request
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const normPlovApi = createApi({
  reducerPath: "normPlovApi",
  baseQuery: baseQueryWithReAuth,
  tagTypes: [
    "Products",
    "userProfile",
    "OrganizerProfile",
    "useGetMyEventQuery",
    "EventsEdite",
    "userCreateEvent",
    "SingleChat",
    "bookmarks",
    "AllTestAsess",
    "Quotations",
    "Invoices",
    "Clients",
    "ProductType",
    "Settings",
    "Profiles",
  ],
  endpoints: () => ({}),
});
