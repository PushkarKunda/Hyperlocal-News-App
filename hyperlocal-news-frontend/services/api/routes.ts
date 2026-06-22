// services/api/routes.ts
export const API_ROUTES = {
  // ─── Auth ───────────────────────────────────────
  auth: {
    firebaseLogin: '/user/user/auth/firebase/login',      // POST - Phone & Google
    refreshToken: '/user/user/auth/refresh',              // POST - Refresh token
    logout: '/user/user/auth/logout',                     // POST - Logout
    switchToPublisher: '/user/user/auth/switch-to-publisher', // POST
    registerDevice: '/user/user/device/token/register',  // POST - FCM token
    unregisterDevice: '/user/user/device/token/unregister', // DELETE
  },

  // ─── User ────────────────────────────────────────
  user: {
    me: '/user/user/users/me',                           // GET, PATCH
    publisherEligibility: '/user/users/me/publisher-eligibility', // GET
    suspensionStatus: '/user/users/me/suspension-status', // GET
    preferences: '/user/user/preferences/me',            // GET, POST, PUT, PATCH, DELETE
    dashboard: '/user/user/dashboard',                   // GET
    uploadAvatar: '/user/user/users/me/avatar',          // POST
  },

  // ─── News ────────────────────────────────────────
  news: {
    feed: '/news/v1/feed',                          // GET
    create: '/news/v1/news',                        // POST
    byId: (uid: string) => `/news/v1/news/${uid}`,  // GET, PUT
    breaking: '/news/v1/news/breaking',             // GET
    search: '/news/v1/search',                      // GET
    byCategory: (id: number) => `/news/v1/news/category/${id}`, // GET
    byLocation: '/news/v1/news/location',           // GET
    popular: '/news/v1/news/popular',               // GET
    related: (uid: string) => `/news/v1/news/${uid}/related`, // GET
    // Engagement
    like: (uid: string) => `/news/v1/user/news/${uid}/like`,     // POST, DELETE
    view: (uid: string) => `/news/v1/user/news/${uid}/view`,     // POST
    share: (uid: string) => `/news/v1/user/news/${uid}/share`,   // POST
    comment: (uid: string) => `/news/v1/user/news/${uid}/comment`, // POST
    deleteComment: (uid: string, id: number) =>
      `/news/v1/user/news/${uid}/comment/${id}`,                 // DELETE
    comments: (uid: string) => `/news/v1/news/${uid}/comments`,  // GET
    engagement: (uid: string) => `/news/v1/news/${uid}/engagement`, // GET
    deleteNews: (uid: string) => `/news/v1/user/news/${uid}`,    // DELETE
  },

  // ─── Categories ──────────────────────────────────
  categories: {
    menu: '/categories/menu',                       // GET
    all: '/categories/all',                         // GET
    news: (id: number) => `/categories/${id}/news`, // GET
  },

  // ─── Content ─────────────────────────────────────
  content: {
    // Events
    events: '/content/events',                      // GET, POST
    eventById: (uid: string) => `/content/events/${uid}`, // GET
    // Polls
    activePolls: '/content/polls/active',           // GET
    pollById: (uid: string) => `/content/polls/${uid}`, // GET
    pollVote: '/content/polls/vote',                // PUT
  },

  // ─── Engagement ──────────────────────────────────
  engagement: {
    // Bookmarks
    bookmarks: '/engagement/bookmarks',             // GET, POST, DELETE
    bookmarkById: (id: number) => `/engagement/bookmarks/${id}`, // DELETE
    checkBookmark: '/engagement/bookmarks/check',   // GET
    // Notifications
    notifications: '/engagement/notifications',     // GET
    unreadCount: '/engagement/notifications/unread/count', // GET
    markRead: (id: number) => `/engagement/notifications/${id}/read`, // PATCH
    markAllRead: '/engagement/notifications/read-all', // PATCH
    clearAll: '/engagement/notifications/clear',    // DELETE
  },

  // ─── Base Location ───────────────────────────────
  location: {
    languages: '/base/languages',                   // GET
    states: '/base/states',                         // GET
    districts: '/base/districts',                   // GET
    cities: '/base/cities',                         // GET
    search: '/base/search',                         // GET
  },

  // ─── Rewards ─────────────────────────────────────
  rewards: {
    me: '/rewards/me',                              // GET
    transactions: '/rewards/transactions',          // GET
    leaderboard: '/rewards/leaderboard',            // GET
    badges: '/rewards/badges',                      // GET
    dailyLogin: '/rewards/daily-login',             // POST
    referral: '/rewards/referral',                  // GET
    useReferral: '/rewards/use-referral',           // POST
  },

  // ─── Insights ────────────────────────────────────
  insights: {
    list: '/insights/',                             // GET
    byUid: (uid: string) => `/insights/uid/${uid}`, // GET
    categories: '/insights/categories',             // GET
    popular: '/insights/stats/popular',             // GET
  },
} as const;