import { normPlovApi } from "@/redux/api";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  userId: number;
  readStatus: boolean;
  createdAt: string;
};

export const notificationsApi = normPlovApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationItem[], void>({
      query: () => ({
        url: "api/v1/notifications",
        method: "GET",
      }),
    }),
    markNotificationRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `api/v1/notifications/${id}/read`,
        method: "PUT",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData(
            "getNotifications",
            undefined,
            (draft) => {
              const target = draft.find((item) => item.id === id);
              if (target) {
                target.readStatus = true;
              }
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } =
  notificationsApi;
export type { NotificationItem };
