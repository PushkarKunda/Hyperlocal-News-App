import { Notification } from '@/types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'alert',
    title: 'Heavy Rain Alert',
    message: 'Heavy rainfall expected in your area for the next 4 hours. Stay safe.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    isRead: false,
  },
  {
    id: 'n2',
    type: 'event',
    title: 'Upcoming Event',
    message: 'Tech Meetup 2026 is happening tomorrow! Check your tickets.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
    actionUrl: 'event/e1',
  },
  {
    id: 'n3',
    type: 'poll',
    title: 'New Community Poll',
    message: 'A new poll about the metro extension needs your vote.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    actionUrl: 'poll/p1',
  },
  {
    id: 'n4',
    type: 'news',
    title: 'Breaking News',
    message: 'Local Startups Secure Record $500M in Series B Funding.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
    actionUrl: 'article/2',
  },
];
