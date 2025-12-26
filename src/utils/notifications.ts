import { NotificationItem } from "@/types/notification";

// Get all notifications
export const getNotifications = (): NotificationItem[] => {
  const data = localStorage.getItem("notifications");
  return data ? JSON.parse(data) : [];
};

// Mark all notifications as read
export const markAllNotificationsRead = (): void => {
  const notifications = getNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  localStorage.setItem("notifications", JSON.stringify(updated));
};

// Clear all notifications
export const clearNotifications = () => {
  localStorage.setItem("notifications", JSON.stringify([]));
};




// Add this helper to the top or end of your utils file
const notifyChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notificationsUpdated"));
  }
};

export const addNotification = (notification: NotificationItem) => {
  const notifications = getNotifications();
  notifications.unshift({
    ...notification,
    id: String(notification.id),
    read: false, // Force false for new ones
  });
  localStorage.setItem("notifications", JSON.stringify(notifications));
  notifyChange(); // <--- CRITICAL: Tell the UI to refresh
};

export const addOutOfStockNotification = (productName: string) => {
  const notifications = getNotifications();

  // 🔍 ឆែកមើលថា តើផលិតផលឈ្មោះនេះ ធ្លាប់បានប្រាប់ថា "Out of Stock" រួចហើយឬនៅ?
  const isAlreadyNotified = notifications.some(
    (n) => n.title === "Out of Stock" && n.subTitle.includes(productName)
  );

  // ប្រសិនបើមានក្នុង List ហើយ មិនបាច់ Add ចូលទៀតទេ
  if (isAlreadyNotified) return;

  notifications.unshift({
    id: crypto.randomUUID(),
    title: "Out of Stock",
    subTitle: `${productName} is now out of stock`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem("notifications", JSON.stringify(notifications));
  notifyChange(); //
};