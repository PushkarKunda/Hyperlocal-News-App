// services/api/posts.ts
import { API_ROUTES } from './routes';
import { request } from './client';

// ─── Types ───────────────────────────────────────────────────────────────────
// ⚠️ THESE NEED VERIFICATION - Please provide actual API response

export interface PostAuthor {
    user_uid: string;
    name: string;
    username?: string;
    avatar?: string;
    is_verified?: boolean;
    is_publisher?: boolean;
}

export interface PostLocation {
    city?: string;
    district?: string;
    state?: string;
}

export interface Post {
    post_uid: string;
    user_uid: string;
    author?: PostAuthor;
    content: string;
    images?: string[];
    video_url?: string;
    hashtags?: string[];
    mentions?: string[];
    location?: PostLocation;
    created_at: string;
    updated_at?: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    is_liked?: boolean;
    is_bookmarked?: boolean;
}

export interface PostComment {
    id: number;
    post_uid: string;
    user_uid: string;
    user_name: string;
    user_avatar?: string;
    comment_text: string;
    created_at: string;
    likes_count?: number;
    is_liked?: boolean;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const postsApi = {

    /**
     * GET /posts/:uid
     * Get single post by post_uid
     */
    getById: async (postUid: string): Promise<Post> => {
        return await request<Post>({
            url: API_ROUTES.posts.byId(postUid),
            method: 'GET',
        });
    },

    /**
     * GET /posts/user/:uid
     * Get posts by specific user (user_uid)
     */
    getUserPosts: async (userUid: string): Promise<Post[]> => {
        return await request<Post[]>({
            url: API_ROUTES.posts.userPosts(userUid),
            method: 'GET',
        });
    },

    /**
     * GET /posts/hashtag/:name/posts
     * Get posts by hashtag
     */
    getByHashtag: async (hashtag: string): Promise<Post[]> => {
        return await request<Post[]>({
            url: API_ROUTES.posts.byHashtag(hashtag),
            method: 'GET',
        });
    },

    /**
     * GET /posts/:uid/comments
     * Get comments for a post
     */
    getComments: async (postUid: string): Promise<PostComment[]> => {
        return await request<PostComment[]>({
            url: API_ROUTES.posts.comments(postUid),
            method: 'GET',
        });
    },

    /**
     * GET /follow/follow/feed/posts
     * Get posts from users you follow
     */
    getFollowingFeed: async (): Promise<Post[]> => {
        return await request<Post[]>({
            url: API_ROUTES.follow.feed,
            method: 'GET',
        });
    },
};