import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
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
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  isBookmarked: initialBookmarked = false,
}) => {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

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
        // Revert on error
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
        message: `${post.content}\n\nCheck out this post on HyperLocal News!`,
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

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
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
            <Text style={[styles.displayName, { color: colors.text }]} numberOfLines={1}>
              {userDisplayName}
            </Text>
            {formattedTime ? (
              <Text style={[styles.timeAgo, { color: colors.textTertiary }]}>
                • {formattedTime}
              </Text>
            ) : null}
          </View>
          {userHandle ? (
            <Text style={[styles.handle, { color: colors.textSecondary }]}>
              {userHandle}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Content text */}
      {post.content ? (
        <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
      ) : null}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <View style={styles.hashtagContainer}>
          {post.hashtags.map((tag, idx) => (
            <View
              key={idx}
              style={[styles.hashtagBadge, { backgroundColor: colors.primaryLight }]}
            >
              <Text style={[styles.hashtagText, { color: colors.primary }]}>
                #{tag.replace(/^#/, '')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Post Image */}
      {post.image_url ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post.image_url }}
            style={styles.postImage}
            contentFit="cover"
            transition={300}
          />
        </View>
      ) : null}

      {/* Action Footer Bar */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {/* Like */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? '#EF4444' : colors.textSecondary}
          />
          <Text
            style={[
              styles.actionText,
              { color: liked ? '#EF4444' : colors.textSecondary },
            ]}
          >
            {likeCount}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onOpenComments(post.post_uid)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={19} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            {post.comment_count || 0}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={19} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
            {shareCount}
          </Text>
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity
          style={styles.actionBtnRight}
          onPress={handleBookmarkToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={bookmarked ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 15,
    fontWeight: '700',
    maxWidth: '70%',
  },
  timeAgo: {
    fontSize: 12,
    marginLeft: 6,
  },
  handle: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  hashtagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashtagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionBtnRight: {
    marginLeft: 'auto',
    padding: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
