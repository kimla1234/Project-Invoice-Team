import { normPlovApi } from "../api";
import {
  SettingResponse,
  SettingUpdateRequest,
  UserProfileUpdateRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "@/types/setting";
import { UserResponse } from "@/types/user";

export const settingApi = normPlovApi.injectEndpoints({
  
  endpoints: (builder) => ({
    // GET /api/v1/setting
    getMySettings: builder.query<SettingResponse, void>({
      query: () => ({
        url: "/api/v1/setting",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    // PATCH /api/v1/setting
    updateMySettings: builder.mutation<
      SettingResponse,
      SettingUpdateRequest
    >({
      query: (body) => ({
        url: "/api/v1/setting",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
    getMyProfile: builder.query<any, void>({
      query: () => ({
        url: "/api/v1/users/me",
        method: "GET",
      }),
      providesTags: ["userProfile"],
    }),

    // PATCH /api/v1/setting/profile
    updateMyProfile: builder.mutation<
      UserResponse,
      UserProfileUpdateRequest
    >({
      query: (body) => ({
        url: "/api/v1/setting/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["userProfile"],
    }),


    uploadProfileImage: builder.mutation<UserResponse, FormData>({
      query: (formData) => ({
        url: "/api/v1/setting/profile/image",
        method: "POST",
        body: formData,
    }),
    invalidatesTags: ["Profiles"],
    }),

    // PATCH /api/v1/setting/password
    changeMyPassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/api/v1/setting/password",
        method: "PATCH",
        body,
      }),
    }),
    uploadSignature: builder.mutation<
    SettingResponse,
    FormData
    >({
    query: (formData) => ({
        url: "/api/v1/setting/signature",
        method: "POST",
        body: formData,
    }),
    invalidatesTags: ["Settings"],
    }),
    uploadCompanyLogo: builder.mutation<SettingResponse, FormData>({
    query: (formData) => ({
        url: "/api/v1/setting/company/logo",
        method: "POST",
        body: formData,
    }),
    invalidatesTags: ["Settings"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
  useUpdateMyProfileMutation,
  useGetMyProfileQuery,
  useChangeMyPasswordMutation,
  useUploadSignatureMutation,
  useUploadProfileImageMutation,
  useUploadCompanyLogoMutation,
} = settingApi;