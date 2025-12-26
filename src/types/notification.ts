export interface NotificationItem {
  id: string | number; // allow number too
  title: string;
  subTitle: string;
  createdAt: string;
  read: boolean;
   _key?: string; 
}