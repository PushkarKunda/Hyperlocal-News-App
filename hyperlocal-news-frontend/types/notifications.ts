export type NotificationType = 'alert' | 'event' | 'poll' | 'news' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO format
  isRead: boolean;
  actionUrl?: string; // Deep link or screen name
  imageUrl?: string;
}
