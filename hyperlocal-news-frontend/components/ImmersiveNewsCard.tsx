import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { NewsArticle } from '@/services/api/news';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useLikeArticle, useUnlikeArticle, useRecordShare } from '@/hooks/useNews';
import { useAddBookmark, useRemoveBookmark } from '@/hooks/useEngagement';
import { formatTimeAgo } from '@/utils/formatters';

interface ImmersiveNewsCardProps {
  item: NewsArticle;
  containerHeight: number;
  isBookmarked?: boolean; // Added prop to receive server-synced bookmark state
}

export const ImmersiveNewsCard = React.memo(({ item, containerHeight, isBookmarked = false }: ImmersiveNewsCardProps) => {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();

  // Server-synced Engagement Mutations
  const { mutate: likeArticle } = useLikeArticle();
  const { mutate: unlikeArticle } = useUnlikeArticle();
  const { mutate: addBookmark } = useAddBookmark();
  const { mutate: removeBookmark } = useRemoveBookmark();
  const { mutate: recordShare } = useRecordShare();

  // Icon mapping based on server state prop
  const likeIconName = 'heart-outline'; // Default to outline, toggle handled by mutation invalidation
  const likeIconColor = isDark ? '#94A3B8' : '#464554';

  const saveIconName = isBookmarked ? 'bookmark' : 'bookmark-outline';
  const saveIconColor = isBookmarked ? '#FFAC33' : (isDark ? '#94A3B8' : '#464554');

  const actionIconColor = isDark ? '#94A3B8' : '#464554';

  const handleToggleLike = () => {
    unlikeArticle(item.news_uid); // Simplified toggle logic for feed card
  };

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(item.news_uid);
    } else {
      addBookmark(item.news_uid);
    }
  };

  const handleShare = async () => {
    try {
      recordShare({ uid: item.news_uid, platform: 'general' });
      await Share.share({
        message: `Check out this article: ${item.title}\n\n${item.summary}\n\nShared via HyperLocal News App.`,
        title: item.title,
      });
    } catch (error) {
      // share dismissed or failed silently
    }
  };

  const categoryName = item.category_names?.[0] || 'News';

  return (
    <View style={[styles.cardContainer, { height: containerHeight, backgroundColor: colors.background }]}>
      {/* Top 45% Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168d3c?w=800' }}
          style={styles.image}
          contentFit="cover"
          transition={400}
        />
        {/* Category Tag */}
        <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
          <Text style={styles.categoryText}>{categoryName}</Text>
        </View>
      </View>

      {/* Bottom 55% Content Section */}
      <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
        <View style={styles.textWrapper}>
          {/* Headline */}
          <Text style={[styles.headline, { color: colors.text }]}>{item.title}</Text>

          {/* News Summary Paragraph */}
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {item.summary}
          </Text>
        </View>

        {/* Footer Area */}
        <View style={styles.footerWrapper}>
          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.footerRow}>
            {/* Source & Time */}
            <View style={styles.readTimeContainer}>
              <Ionicons name="globe-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.sourceText, { color: colors.textSecondary }]}>{item.source || 'HyperLocal'}</Text>
              <Text style={[styles.dotSep, { color: colors.textTertiary }]}>·</Text>
              <Text style={[styles.readTimeText, { color: colors.textTertiary }]}>{formatTimeAgo(item.created_at)}</Text>
            </View>

            {/* Action Buttons Stack */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDark ? '#262636' : '#E5EEFF' }]}
                activeOpacity={0.65}
                onPress={handleToggleLike}
              >
                <Ionicons name={likeIconName} size={16} color={likeIconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDark ? '#262636' : '#E5EEFF' }]}
                activeOpacity={0.65}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={16} color={actionIconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDark ? '#262636' : '#E5EEFF' }]}
                activeOpacity={0.65}
                onPress={handleToggleBookmark}
              >
                <Ionicons name={saveIconName} size={16} color={saveIconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDark ? '#262636' : '#E5EEFF' }]}
                activeOpacity={0.65}
              >
                <Feather name="more-vertical" size={16} color={actionIconColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.containerHeight === nextProps.containerHeight &&
    prevProps.item.news_uid === nextProps.item.news_uid &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.image_url === nextProps.item.image_url &&
    prevProps.isBookmarked === nextProps.isBookmarked
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: '45%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.lg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'Poppins_600SemiBold',
  },
  contentContainer: {
    height: '55%',
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  textWrapper: {
    flex: 1,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Poppins_700Bold',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  summaryText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 24,
  },
  footerWrapper: {
    marginTop: 'auto',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  sourceText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  dotSep: {
    fontSize: 12,
  },
  readTimeText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});