I am using React Native Expo sdk version 52 and this is my package.json
{
  "name": "hyperlocal-news-frontend",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "eslint .",
    "clear": "expo start -c",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@expo-google-fonts/inter": "^0.2.3",
    "@expo-google-fonts/newsreader": "^0.2.3",
    "@expo-google-fonts/poppins": "^0.4.1",
    "@expo/vector-icons": "~14.0.4",
    "@hookform/resolvers": "^3.9.1",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-native-community/datetimepicker": "8.2.0",
    "@react-native-community/netinfo": "11.4.1",
    "@react-native-firebase/app": "^24.1.0",
    "@react-native-firebase/auth": "^24.1.0",
    "@react-native-google-signin/google-signin": "^16.1.2",
    "@supabase/supabase-js": "^2.107.0",
    "@tanstack/react-query": "^5.62.11",
    "axios": "^1.7.9",
    "date-fns": "^4.4.0",
    "expo": "~52.0.23",
    "expo-application": "~6.0.2",
    "expo-blur": "~14.0.3",
    "expo-build-properties": "~0.13.3",
    "expo-constants": "~17.0.3",
    "expo-dev-client": "~5.0.20",
    "expo-font": "~13.0.4",
    "expo-haptics": "~14.0.1",
    "expo-image": "~2.0.0",
    "expo-image-manipulator": "~13.0.6",
    "expo-image-picker": "~16.0.6",
    "expo-linear-gradient": "~14.0.2",
    "expo-linking": "~7.0.5",
    "expo-location": "~18.0.4",
    "expo-router": "~4.0.15",
    "expo-secure-store": "~14.0.1",
    "expo-splash-screen": "~0.29.19",
    "expo-status-bar": "~2.0.0",
    "expo-system-ui": "~4.0.4",
    "expo-video": "~2.0.6",
    "expo-web-browser": "~14.0.2",
    "lottie-react-native": "7.1.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-hook-form": "^7.54.2",
    "react-native": "0.76.9",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-reanimated": "~3.16.4",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-web": "~0.19.13",
    "react-native-webview": "13.12.5",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.12",
    "babel-plugin-module-resolver": "^5.0.2",
    "typescript": "~5.3.3"
  },
  "private": true
}
Perfect! Let's build this right! 🎯
I can see you're using:

React Native Expo SDK 52
Firebase for Phone Auth & Google OAuth
Zustand for state management
React Query for API calls
Expo Router for navigation
Now, please share:

1. Your current code files (paste them one by one or all together):
Authentication screens
Firebase configuration
API service files
Any screens with errors
Store/Zustand files
2. Your Firebase setup:
Have you created a Firebase project?
Have you enabled Phone Authentication & Google Sign-In in Firebase Console?
Do you have your google-services.json (Android) and GoogleService-Info.plist (iOS)?
3. Your app.json or app.config.js:
Need to check Firebase configuration there
While you're gathering the code, here's what I'll fix:

✅ Remove all email authentication code
✅ Implement proper Firebase Phone Auth with OTP
✅ Implement Google OAuth correctly
✅ Create responsive UI using Flexbox & percentages
✅ Set up proper API integration with React Query
✅ Add error handling and loading states
✅ Follow React Native & Firebase best practices

Go ahead and paste your code files! 📝
Got it! Let's fix these critical issues! 🔧
I need to see your code to provide exact fixes, but here are the main issues I can identify:

🔴 Critical Issues to Fix:
Network error handling - App crashes on network failures
Account linking issue - Google sign-in + Phone verification creating duplicate users instead of linking
Infinite loop - Auto-clicking "Send Code" button after logout
Publisher verification - App crashes when checking if both phone & email are verified
reCAPTCHA handling - Need proper error handling
You're absolutely right, I apologize. Let me review what you said in this chat:

✅ WebBrowser OAuth handling - Added
✅ Firebase setup - Added imports
✅ Remove mock data - Need to verify this is COMPLETELY removed
✅ User type from authStore - Fixed with selectors
✅ Phone verification rate limiting - Added to authStore
✅ Account linking (Google + Phone) - Fixed in authStore
✅ Network error handling - Added
✅ No email authentication - Only phone + Google
✅ Supabase image upload integration - Added to profile.tsx
✅ Responsive UI for all mobile sizes - Used percentages

OAuth Redirect - WebBrowser.maybeCompleteAuthSession() handles Google OAuth in internal browser
Firebase Initialization - Checks connection + initializes before auth
Auth Hydration - Restores user from AsyncStorage on app launch
Network Status - Real-time connection monitoring
Loading States - Shows loading UI while initializing
Error Boundaries - Handles network errors gracefully
Navigation Flow - Proper routing based on auth state
Theme Support - Respects user's theme preference
Font Enforcement - Global Poppins font fallback
No Mock Data - All API calls are real

If possible use lazy loading in the codes

What	Before	After
Avatar upload	❌ Separate uploadAvatar endpoint	✅ Via PATCH /user/user/users/me with profile_picture field
Flow	❌ Upload file directly to backend	✅ Local → Compress → Supabase → URL to backend
Files	uploads.ts exists	❌ Delete uploads.ts

// services/api/routes.ts
export const API_ROUTES = {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  auth: {
    firebaseLogin: '/user/user/auth/firebase/login',           // POST - Firebase Login
    refreshToken: '/user/user/auth/refresh',                   // POST - Refresh token (query param)
    logout: '/user/user/auth/logout',                          // POST - Logout
    switchToPublisher: '/user/user/auth/switch-to-publisher',  // POST - Switch to publisher
    registerDevice: '/user/user/device/token/register',        // POST - Register FCM token
    unregisterDevice: '/user/user/device/token/unregister',    // DELETE - Unregister device
  },

  // ─── User ───────────────────────────────────────────────────────────────────
  user: {
    me: '/user/user/users/me',                                      // GET, PATCH - My profile (includes avatar)
    publisherEligibility: '/user/user/users/me/publisher-eligibility', // GET
    suspensionStatus: '/user/user/users/me/suspension-status',      // GET
    preferences: '/user/user/preferences/me',                       // GET, POST, PUT, PATCH, DELETE
    dashboard: '/user/user/dashboardnew',                           // GET - User dashboard
    dashboardEngagement: '/user/user/dashboard/engagement',         // GET - Dashboard engagement
    // ❌ REMOVED: uploadAvatar - not in official API list
  },

  // ─── News ───────────────────────────────────────────────────────────────────
  news: {
    feed: '/news/v1/feed',                                       // GET - News feed
    create: '/news/v1/news',                                     // POST - Create news
    byId: (uid: string) => `/news/v1/news/${uid}`,              // GET, PUT - Get/Update news
    deleteNews: (uid: string) => `/news/v1/user/news/${uid}`,   // DELETE - Delete news
    
    // Discovery
    breaking: '/news/v1/news/breaking',                          // GET - Breaking news
    popular: '/news/v1/news/popular',                            // GET - Popular news
    trending: '/news/v1/news/analytics/trending',                // GET - Trending news
    byLocation: '/news/v1/news/location',                        // GET - News by location
    byCategory: (id: number) => `/news/v1/news/category/${id}`, // GET - News by category
    related: (uid: string) => `/news/v1/news/${uid}/related`,   // GET - Related news
    search: '/news/v1/search',                                   // GET - Search news
    
    // News Shorts
    shorts: '/news/v1/news-shorts',                              // GET - News shorts
    
    // Engagement
    engagement: (uid: string) => `/news/v1/news/${uid}/engagement`, // GET - News engagement stats
    like: (uid: string) => `/news/v1/user/news/${uid}/like`,       // POST, DELETE - Like/Unlike
    view: (uid: string) => `/news/v1/user/news/${uid}/view`,       // POST - Record view
    share: (uid: string) => `/news/v1/user/news/${uid}/share`,     // POST - Share news
    
    // Comments
    comments: (uid: string) => `/news/v1/news/${uid}/comments`,         // GET - Get comments
    comment: (uid: string) => `/news/v1/user/news/${uid}/comment`,      // POST - Add comment
    deleteComment: (uid: string, id: number) =>
      `/news/v1/user/news/${uid}/comment/${id}`,                        // DELETE - Delete comment
    
    // Analytics
    weeklyStats: '/news/v1/news/analytics/weekly',               // GET - Weekly stats
    dailyStats: '/news/v1/news/analytics/daily',                 // GET - Daily stats
    topPerforming: '/news/v1/news/analytics/top',                // GET - Top performing
  },

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: {
    list: '/categories/',                                        // GET - List categories
    menu: '/categories/menu',                                    // GET - Category menu
    all: '/categories/all',                                      // GET - All categories
    news: (id: number) => `/categories/${id}/news`,             // GET - News by category
  },

  // ─── Content ────────────────────────────────────────────────────────────────
  content: {
    // Advertisements
    advertisements: '/content/advertisements/active',                    // GET - Active ads
    advertisementById: (id: number) => `/content/advertisements/${id}`, // GET - Get ad by ID
    createAdvertisement: '/content/advertisements',                      // POST - Create ad
    updateAdvertisement: (id: number) => `/content/advertisements/${id}`, // PUT - Update ad
    toggleAdStatus: (id: number) => `/content/advertisements/${id}/toggle-status`, // POST
    
    // Sponsored Posts
    sponsoredPosts: '/content/sponsored-posts/active',           // GET - Active sponsored posts
    createSponsoredPost: '/content/sponsored-posts',             // POST - Create sponsored post
    updateSponsoredPost: (id: number) => `/content/sponsored-posts/${id}`, // PUT
    pendingSponsoredPosts: '/content/sponsored-posts/pending',   // GET - Pending posts
    
    // Events (Coming Soon - basic structure)
    events: '/content/events',                                   // GET, POST
    eventById: (uid: string) => `/content/events/${uid}`,       // GET
    
    // Polls (Coming Soon - basic structure)
    polls: '/content/polls',                                     // POST - Create poll
    pollById: (uid: string) => `/content/polls/${uid}`,         // GET - Get poll
    activePolls: '/content/polls/active',                        // GET - Active polls
    pollVote: '/content/polls/vote',                             // PUT - Vote on poll
    updatePoll: (id: number) => `/content/polls/${id}`,         // PUT - Update poll
    
    // News Shorts
    newsShorts: '/content/news-shorts',                          // GET, POST - News shorts
    
    // Tags
    tags: '/content/tags',                                       // GET - Get tags
    tagContent: (name: string) => `/content/tags/${name}/content`, // GET - Content by tag
    assignTags: (type: string, id: string) => `/content/${type}/${id}/tags`, // POST
    
    // Flagging
    flagContent: (type: string, id: string) => `/content/${type}/${id}/flag`, // POST
    
    // Search & Analytics
    search: '/content/search',                                   // GET - Search content
    analytics: (type: string, id: string) => `/content/analytics/${type}/${id}`, // GET
    stats: '/content/stats',                                     // GET - Content stats
    quickStats: '/content/quick-stats',                          // GET - Quick stats
    targetingOptions: '/content/targeting-options',              // GET - Targeting options
    overview: '/content/overview',                               // GET - Dashboard overview
  },

  // ─── Engagement ─────────────────────────────────────────────────────────────
  engagement: {
    // Bookmarks
    bookmarks: '/engagement/bookmarks',                          // GET, POST, DELETE
    bookmarkById: (id: number) => `/engagement/bookmarks/${id}`, // DELETE - Delete by ID
    checkBookmark: '/engagement/bookmarks/check',                // GET - Check bookmark status
    
    // Notifications
    notifications: '/engagement/notifications',                  // GET - Get notifications
    unreadCount: '/engagement/notifications/unread/count',       // GET - Unread count
    markRead: (id: number) => `/engagement/notifications/${id}/read`, // PATCH - Mark as read
    markAllRead: '/engagement/notifications/read-all',           // PATCH - Mark all read
    deleteNotification: (id: number) => `/engagement/notifications/${id}`, // DELETE
    clearAll: '/engagement/notifications/clear',                 // DELETE - Clear all
    
    // Summary
    summary: (uid: string) => `/engagement/summary/${uid}`,     // GET - Engagement summary
  },

  // ─── Location & Language ────────────────────────────────────────────────────
  location: {
    // Languages
    languages: '/base/languages',                                     // GET - All languages
    languageById: (id: number) => `/base/languages/${id}`,           // GET - Language by ID
    
    // States
    states: '/base/states',                                           // GET - All states
    stateById: (id: number) => `/base/states/${id}`,                 // GET - State details
    stateHierarchy: (id: number) => `/base/hierarchy/states/${id}`,  // GET - State hierarchy
    stateLanguage: (id: number) => `/base/states/${id}/language`,    // GET - State language
    
    // Districts
    districts: '/base/districts',                                     // GET - All districts
    districtById: (id: number) => `/base/districts/${id}`,           // GET - District details
    
    // Cities
    cities: '/base/cities',                                           // GET - All cities
    cityById: (id: number) => `/base/cities/${id}`,                  // GET - City details
    
    // Search
    search: '/base/search',                                           // GET - Search locations
  },

  // ─── Rewards ────────────────────────────────────────────────────────────────
  rewards: {
    me: '/rewards/me',                                           // GET - My rewards
    badges: '/rewards/badges',                                   // GET - My badges
    referral: '/rewards/referral',                               // GET - Referral info
    leaderboard: '/rewards/leaderboard',                         // GET - Leaderboard
    
    // Bingo
    bingo: '/rewards/bingo',                                     // GET - Get bingo card
    claimBingo: '/rewards/bingo/claim',                          // POST - Claim bingo reward
    bingoLeaderboard: '/rewards/bingo/leaderboard',              // GET - Bingo leaderboard
    
    // Daily & Challenges
    dailyLogin: '/rewards/daily-login',                          // POST - Claim daily login
    todayChallenge: '/rewards/challenge/today',                  // GET - Today's challenge
    claimChallenge: (id: number) => `/rewards/challenge/${id}/claim`, // POST - Claim challenge
    
    // Earning Actions
    earnRead: '/rewards/earn/read',                              // POST - Earn for reading
    earnShare: '/rewards/earn/share',                            // POST - Earn for sharing
    earnComment: '/rewards/earn/comment',                        // POST - Earn for commenting
    earnLike: '/rewards/earn/like',                              // POST - Earn for liking
    earnBookmark: '/rewards/earn/bookmark',                      // POST - Earn for bookmarking
    
    // Referral
    useReferral: '/rewards/use-referral',                        // POST - Use referral code
    
    // Ads
    rewardedAd: '/rewards/ad/rewarded',                          // POST - Claim rewarded ad
    
    // Transactions
    transactions: '/rewards/transactions',                       // GET - My transactions
    info: '/api/v1/rewards/info',                                // GET - Rewards info
  },

  // ─── Insights ───────────────────────────────────────────────────────────────
  insights: {
    list: '/insights/',                                          // GET - List insights
    create: '/insights/',                                        // POST - Create insight
    createWithUrls: '/insights/create',                          // POST - Create with URLs
    byUid: (uid: string) => `/insights/uid/${uid}`,             // GET, DELETE, PATCH - By UID
    byCategory: (name: string) => `/insights/${name}`,          // GET - By category
    popular: '/insights/stats/popular',                          // GET - Popular insights
    share: '/insights/share',                                    // POST - Share insight
    shareById: (id: number) => `/insights/share/${id}`,         // POST - Share by ID
    categories: '/insights/categories',                          // GET - Insight categories
  },

  // ─── Posts ──────────────────────────────────────────────────────────────────
  posts: {
    byId: (uid: string) => `/posts/${uid}`,                     // GET - Get post
    userPosts: (uid: string) => `/posts/user/${uid}`,           // GET - User posts
    byHashtag: (name: string) => `/posts/hashtag/${name}/posts`, // GET - Posts by hashtag
    comments: (uid: string) => `/posts/${uid}/comments`,        // GET - Post comments
  },

  // ─── Follow ─────────────────────────────────────────────────────────────────
  follow: {
    followUser: (uid: string) => `/follow/follow/${uid}`,       // POST - Follow
    unfollowUser: (uid: string) => `/follow/follow/${uid}`,     // DELETE - Unfollow
    followers: (uid: string) => `/follow/follow/followers/${uid}`, // GET - Followers
    following: (uid: string) => `/follow/follow/following/${uid}`, // GET - Following
    suggestions: '/follow/follow/suggestions',                   // GET - Follow suggestions
    status: (uid: string) => `/follow/follow/status/${uid}`,    // GET - Follow status
    counts: (uid: string) => `/follow/follow/counts/${uid}`,    // GET - Follow counts
    feed: '/follow/follow/feed/posts',                           // GET - Following posts
  },

  // ─── User Activity ──────────────────────────────────────────────────────────
  userActivity: {
    sessions: '/user-activity/user-activity/sessions',                 // GET - Get sessions
    killSession: (hash: string) => `/user-activity/user-activity/sessions/${hash}`, // DELETE
    killAllSessions: '/user-activity/user-activity/sessions/kill-all', // POST
    activities: '/user-activity/user-activity/activities/me',          // GET - My activities
    securityEvents: '/user-activity/user-activity/activities/security-events', // GET
    stats: '/user-activity/user-activity/stats/me',                    // GET - Session stats
    deviceLimit: '/user-activity/user-activity/device-limit',          // GET - Device limit
  },

  // ─── In-App Notifications ───────────────────────────────────────────────────
  inAppNotifications: {
    list: '/notifications/in-app',                               // GET - Get in-app notifications
    markRead: (id: number) => `/notifications/in-app/${id}/read`, // PATCH - Mark as read
    unreadCount: '/notifications/in-app/unread/count',           // GET - Unread count
  },

  // ─── Health Checks ──────────────────────────────────────────────────────────
  health: {
    root: '/',                                                   // GET - Root
    main: '/health',                                             // GET - Main health
    news: '/news/v1/health',                                     // GET - News health
    content: '/content/health',                                  // GET - Content health
    engagement: '/engagement/health',                            // GET - Engagement health
    base: '/base/health',                                        // GET - Base health
    categories: '/categories/health',                            // GET - Categories health
    insights: '/insights/health',                                // GET - Insights health
    rewards: '/rewards/health',                                  // GET - Rewards health
    userActivity: '/user-activity/user-activity/health',        // GET - User activity health
  },
} as const;