"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { BellIcon } from "./icons";
import { useEffect, useState, useCallback } from "react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  getNotifications,
  markAllNotificationsRead,
  clearNotifications,
  addNotification as addNotificationToStorage,
} from "@/utils/notifications";

import { NotificationItem } from "@/types/notification";

// Format time
const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return "Recently";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return past.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showDot, setShowDot] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isMobile = useIsMobile();

  // Load notifications from storage
  const loadNotifications = useCallback(() => {
    const stored = getNotifications();

    const formatted = stored.map((n, index) => ({
      ...n,
      _key: n._key || `${n.id}-${index}`,
    }));

    setNotifications(formatted);

    // This is the core logic for the red dot:
    const hasUnread = formatted.some((n) => n.read === false);
    setShowDot(hasUnread);
  }, []);

  // add notification
  const addNotification = (notification: Omit<NotificationItem, "_key">) => {
    const newNotification: NotificationItem = {
      ...notification,
      read: false, // Ensure new notifications are always unread
      createdAt: notification.createdAt || new Date().toISOString(),
      _key: `${notification.id}-${Date.now()}`,
    };

    addNotificationToStorage(newNotification);

    // This will trigger the useEffect 'notificationsUpdated' listener
    window.dispatchEvent(new Event("notificationsUpdated"));
  };

  useEffect(() => {
    loadNotifications();
    const handler = () => loadNotifications();
    window.addEventListener("notificationsUpdated", handler);
    return () => window.removeEventListener("notificationsUpdated", handler);
  }, [loadNotifications]);

  // Open dropdown
  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setShowDot(false);
      window.dispatchEvent(new Event("notificationsUpdated"));
    }
  };

  // Clear all notifications
  const handleClearAllConfirmed = () => {
    clearNotifications();
    setNotifications([]);
    setShowDot(false);
    setShowConfirmModal(false);
    window.dispatchEvent(new Event("notificationsUpdated"));
  };

  return (
    <>
      <Dropdown
        isOpen={isOpen}
        setIsOpen={(value) => {
          const open = typeof value === "function" ? value(isOpen) : value;
          handleOpen(open);
        }}
      >
        <DropdownTrigger className="group relative grid size-10 place-items-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 active:scale-95">
          <div className="relative transition-transform duration-300 group-hover:rotate-12">
            <BellIcon className="size-5 text-gray-600" />
            {showDot && (
              <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full border-2 border-white bg-red-500"></span>
              </span>
            )}
          </div>
        </DropdownTrigger>

        <DropdownContent
          align={isMobile ? "end" : "center"}
          className="w-[380px] overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-0 shadow-2xl backdrop-blur-md"
        >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between border-b border-gray-100 bg-gray-50/40 px-5 py-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="flex h-5 items-center rounded-full bg-blue-600 px-2 text-[10px] font-bold text-white">
                  {notifications.filter((n) => !n.read).length} NEW
                </span>
              )}
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="text-[11px] font-medium text-gray-400 hover:text-blue-600"
            >
              Clear all
            </button>
          </div>

          {/* List */}
          <ul className="max-h-[420px] divide-y divide-gray-50 overflow-y-auto overscroll-contain">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <li
                  key={item._key}
                  className="group relative flex cursor-pointer items-start gap-2 px-2 py-1 transition-all hover:bg-blue-50/30"
                >
                  {!item.read && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
                  )}
                  <div className="flex-1 rounded-lg bg-slate-100 p-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-[13px] leading-tight ${
                          !item.read
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-600"
                        }`}
                      >
                        {item.title}
                      </p>
                      <time className="shrink-0 text-[10px] font-bold tracking-wider text-gray-400">
                        {formatTimeAgo(item.createdAt)}
                      </time>
                    </div>
                    <p className="line-clamp-2 text-xs leading-normal text-gray-500 group-hover:text-gray-600">
                      {item.subTitle}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-14">
                <div className="flex size-14 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                  <BellIcon className="size-7" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-400">
                  Your inbox is empty
                </p>
              </div>
            )}
          </ul>

          {/* Footer */}
          <button className="flex w-full mt-3 items-center justify-center border-t border-gray-100 py-4 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600">
            VIEW ALL NOTIFICATIONS
          </button>
        </DropdownContent>
      </Dropdown>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={showConfirmModal}
        title="Clear All Notifications?"
        description="This action cannot be undone."
        confirmText="Yes, clear all"
        cancelText="Cancel"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleClearAllConfirmed}
      />
    </>
  );
}
