"use client";

import React, { useMemo, useCallback } from "react";
import { BellIcon } from "@/components/Layouts/header/notification/icons";
import { formatMessageTime } from "@/lib/format-message-time";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from "@/redux/service/notifications";

export default function Notifications() {
  const { data = [], isLoading, isError } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();

  const unreadCount = useMemo(
    () => data.filter((item) => !item.readStatus).length,
    [data],
  );

  const handleMarkRead = useCallback(
    (id: number, isRead: boolean) => {
      if (isRead) return;
      markRead(id);
    },
    [markRead],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="inline-flex w-[210px] justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xl text-slate-600">
          Notifications
        </div>
        {unreadCount > 0 && (
          <span className="flex h-6 items-center rounded-full bg-blue-600 px-3 text-xs font-bold text-white">
            {unreadCount} NEW
          </span>
        )}
      </div>

      <div className="w-full space-y-4 rounded-md bg-white p-8 text-slate-600">
        {isLoading && (
          <div className="text-gray-500">Loading notifications...</div>
        )}

        {isError && !isLoading && (
          <div className="text-gray-500">
            Unable to load notifications right now.
          </div>
        )}

        {!isLoading && !isError && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-gray-50 text-gray-300">
              <BellIcon className="size-7" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-400">
              Your inbox is empty
            </p>
          </div>
        )}

        {!isLoading && !isError && data.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {data.map((item) => (
              <li
                key={item.id}
                className="group relative flex cursor-pointer items-start gap-3 px-3 py-3 transition-all hover:bg-blue-50/30"
                onClick={() => handleMarkRead(item.id, item.readStatus)}
              >
                {!item.readStatus && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
                )}
                <div className="flex-1 rounded-lg bg-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm leading-tight ${
                        !item.readStatus
                          ? "font-bold text-gray-900"
                          : "font-medium text-gray-600"
                      }`}
                    >
                      {item.title}
                    </p>
                    <time className="shrink-0 text-[11px] font-bold tracking-wider text-gray-400">
                      {formatMessageTime(item.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 text-xs leading-normal text-gray-500 group-hover:text-gray-600">
                    {item.message}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
