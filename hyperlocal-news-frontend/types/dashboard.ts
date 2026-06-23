export interface DashboardUser {
  user_uid: string;
  user_name: string;
  name: string;
  profile_picture: string;
  location: string;
  joined_date: string;
  followers_count: number;
  following_count: number;
  role: number;
  role_name: string;
  is_publisher: boolean;
  is_verified: boolean;
  rank: number;
  top_percent: number;
  unread_notifications: number;
  profile_completion: number;
}

export interface EarningStats {
  points: number;
  coins: number;
}

export interface DashboardStats {
  total_posts: number;
  total_likes: number;
  total_comments: number;
  level: number;
  level_name: string;
  coins: number;
  points: number;
  current_streak: number;
  longest_streak: number;
  today_earnings: EarningStats;
  weekly_earnings: EarningStats;
  monthly_earnings: EarningStats;
}

export interface DashboardPostItem {
  post_uid: string;
  content: string;
  image_url: string | null;
  created_at: string;
  time_ago: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'approved' | 'pending' | 'rejected' | string;
}

export interface RecentPosts {
  items: DashboardPostItem[];
  total: number;
  has_more: boolean;
}

export interface QuickAction {
  label: string;
  url: string;
  icon: string;
  type: 'primary' | 'warning' | 'info' | 'success' | string;
}

export interface EngagementStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface NewsStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  approval_rate: number;
  engagement: EngagementStats;
}

export interface DashboardNewsItem {
  news_uid: string;
  title: string;
  summary: string;
  image_url: string | null;
  created_at: string;
  time_ago: string;
  status: 'approved' | 'pending' | 'rejected' | string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  rejection_reason: string | null;
}

export interface RecentNews {
  items: DashboardNewsItem[];
  total: number;
  has_more: boolean;
}

export interface PublisherActions {
  write_news: string;
  view_all_news: string;
}

export interface AdminTools {
  total_users: number;
  total_news: number;
  total_posts: number;
  pending_approvals: number;
  admin_dashboard_url: string;
}

export interface DashboardDataPayload {
  user: DashboardUser;
  stats: DashboardStats;
  recent_posts: RecentPosts;
  quick_actions: QuickAction[];
  news_stats: NewsStats;
  recent_news: RecentNews;
  publisher_actions: PublisherActions;
  admin_tools?: AdminTools;
  detailed_posts?: {
    items: DashboardPostItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
  detailed_news?: {
    items: DashboardNewsItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}
