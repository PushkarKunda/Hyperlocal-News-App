import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type Post } from '@/services/api/posts';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useLikePost, useSharePost } from '@/hooks/usePosts';
import { useAddBookmark, useRemoveBookmark } from '@/hooks/useEngagement';
import { formatTimeAgo } from '@/utils/formatters';

interface PostCardProps {
  post: Post;
  onOpenComments: (postUid: string) => void;
  isBookmarked?: boolean;
  containerHeight?: number;
}

const GRADIENT_PRESETS = [
  ['#0F172A', '#1E1B4B', '#312E81'],
  ['#0284C7', '#1E293B', '#0F172A'],
  ['#3B0764', '#1E1B4B', '#0F172A'],
  ['#1E293B', '#111827', '#0F172A'],
  ['#065F46', '#064E3B', '#0F172A'],
];

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  isBookmarked: initialBookmarked = false,
  containerHeight,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { height: windowHeight } = useWindowDimensions();

  const cardHeight = containerHeight || windowHeight;

  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [shareCount, setShareCount] = useState(post.share_count || 0);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const { mutate: toggleLike } = useLikePost();
  const { mutate: sharePostMutation } = useSharePost();
  const { mutate: addBookmark } = useAddBookmark();
  const { mutate: removeBookmark } = useRemoveBookmark();

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    toggleLike(post.post_uid, {
      onError: () => {
        setLiked(!newLiked);
        setLikeCount((prev) => (!newLiked ? prev + 1 : Math.max(0, prev - 1)));
      },
    });
  };

  const handleShare = async () => {
    try {
      setShareCount((prev) => prev + 1);
      sharePostMutation({ postUid: post.post_uid, platform: 'native' });

      await Share.share({
        message: `${post.content || ''}\n\nCheck out this post on HyperLocal News!`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleBookmarkToggle = () => {
    const nextState = !bookmarked;
    setBookmarked(nextState);

    if (nextState) {
      addBookmark({ contentUid: post.post_uid, contentType: 'post' });
    } else {
      removeBookmark({ contentUid: post.post_uid, contentType: 'post' });
    }
  };

  const userDisplayName = post.user_display_name || post.user_name || 'Community Member';
  const userHandle = post.user_name ? `@${post.user_name}` : '';
  const formattedTime = post.created_at ? formatTimeAgo(post.created_at) : (post.time_ago || '');

  const bgGradient = GRADIENT_PRESETS[Math.abs(post.id || 0) % GRADIENT_PRESETS.length];

  return (
    <View style={[styles.cardContainer, { height: cardHeight }]}>
      {/* Background Layer (Image or Vibrant Gradient fallback) */}
      {post.image_url ? (
        <Image
          source={{ uri: post.image_url }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
      ) : (
        <LinearGradient
          colors={bgGradient as [string, string, ...string[]]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Top Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.92)', 'rgba(0,0,0,0.5)', 'transparent']}
        style={[styles.topGradient, { height: 160 + insets.top }]}
        pointerEvents="none"
      />

      {/* Bottom Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.92)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Content Container (Overlay over the image) */}
      <View style={[styles.overlayContent, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
        {/* Header (User Info) */}
        <View style={styles.headerRow}>
          <Image
            source={{
              uri:
                post.user_profile_picture ||
                'https://placehold.co/100x100/E2E8F0/1E293B?text=User',
            }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName} numberOfLines={1}>
                {userDisplayName}
              </Text>
              {formattedTime ? (
                <Text style={styles.timeAgo}> • {formattedTime}</Text>
              ) : null}
            </View>
            {userHandle ? (
              <Text style={styles.handle} numberOfLines={1}>
                {userHandle}
              </Text>
            ) : null}
          </View>

          {/* Top Bookmark Action */}
          <TouchableOpacity
            style={styles.topBookmarkBtn}
            onPress={handleBookmarkToggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={bookmarked ? '#38BDF8' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Middle/Lower Section: Post Details */}
        <View style={styles.detailsContainer}>
          {post.content ? (
            <Text style={styles.postText} numberOfLines={6}>
              {post.content}
            </Text>
          ) : null}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <View style={styles.hashtagContainer}>
              {post.hashtags.map((tag, idx) => (
                <View key={idx} style={styles.hashtagBadge}>
                  <Text style={styles.hashtagText}>#{tag.replace(/^#/, '')}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom Action Footer */}
          <View style={styles.footerRow}>
            {/* Like */}
            <TouchableOpacity
              style={styles.actionPill}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color={liked ? '#EF4444' : '#FFFFFF'}
              />
              <Text style={[styles.actionText, liked && { color: '#EF4444' }]}>
                {likeCount}
              </Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => onOpenComments(post.post_uid)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={19} color="#FFFFFF" />
              <Text style={styles.actionText}>{post.comment_count || 0}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              style={styles.actionPill}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={19} color="#FFFFFF" />
              <Text style={styles.actionText}>{shareCount}</Text>
            </TouchableOpacity>

            {/* Bookmark */}
            <TouchableOpacity
              style={[styles.actionPill, { marginLeft: 'auto' }]}
              onPress={handleBookmarkToggle}
              activeOpacity={0.7}
            >
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={bookmarked ? '#38BDF8' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    zIndex: 1,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    maxWidth: '70%',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeAgo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginLeft: 4,
  },
  handle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  topBookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  detailsContainer: {
    justifyContent: 'flex-end',
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  hashtagBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  hashtagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});
