import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, useColorScheme, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Spacing';

interface ArticleItem {
  id: string;
  category: string;
  headline: string;
  summary: string;
  sourceName: string;
  publishedAt: string;
  views: string;
  likes: string;
  readingTime: string;
  imageUrl: string;
}

const ARTICLES_DATA: ArticleItem[] = [
  {
    id: '1',
    category: 'BUSINESS',
    headline: 'Historic Funding: Kukatpally Tech Startups Raise $500M',
    summary: "In a historic week for the local ecosystem, three homegrown tech startups have announced massive funding rounds. Investors cite the city's growing talent pool and favorable regulatory environment as primary drivers...",
    sourceName: 'Times of Kukatpally',
    publishedAt: '2h ago',
    views: '3.4k views',
    likes: '1.2k',
    readingTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
  },
  {
    id: '2',
    category: 'ENVIRONMENT',
    headline: 'Lake Beautification Project Completed Successfully',
    summary: 'The local municipality has successfully concluded the lake rejuvenation and park development initiative. Over 10 acres of wetlands have been clean-restored with modern walk-paths and flora...',
    sourceName: 'Local Chronicle',
    publishedAt: '5h ago',
    views: '1.8k views',
    likes: '820',
    readingTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
  },
  {
    id: '3',
    category: 'LIFESTYLE',
    headline: "Culinary Gem 'The Spicery' Wins State Award",
    summary: 'A beloved family-owned eatery in the heart of Kukatpally has clinched the prestigious State Culinary Excellence Award. Known for its traditional preparations, the restaurant was founded in 1985...',
    sourceName: 'Metro Bulletin',
    publishedAt: '1d ago',
    views: '4.2k views',
    likes: '2.1k',
    readingTime: '2 min read',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
  },
];

export default function ArticlesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>({
    '1': { count: 1200, liked: false },
    '2': { count: 820, liked: false },
    '3': { count: 2100, liked: false },
  });
  const [bookmarksState, setBookmarksState] = useState<Record<string, boolean>>({});

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const handleLike = (id: string) => {
    setLikesState((prev) => {
      const item = prev[id];
      if (!item) return prev;
      return {
        ...prev,
        [id]: {
          liked: !item.liked,
          count: item.liked ? item.count - 1 : item.count + 1,
        },
      };
    });
  };

  const handleBookmark = (id: string) => {
    setBookmarksState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `Check out this article: ${title}\nShared via HyperLocal News App.`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const formatLikesCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>latest articles</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Articles List */}
      <FlatList
        data={ARTICLES_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderItem={({ item, index }) => {
          const likeData = likesState[item.id] || { count: 0, liked: false };
          const isBookmarked = bookmarksState[item.id] || false;

          // Render vertical card for first/major article, horizontal card for others
          const isFirstItem = index === 0;

          if (!isFirstItem) {
            return (
              <TouchableOpacity
                style={[styles.horizontalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.9}
                onPress={() => router.push(`/news/${item.id}` as any)}
              >
                <View style={styles.horizontalLeft}>
                  <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{item.category}</Text>
                  </View>
                  <Text style={[styles.horizontalHeadline, { color: colors.text }]} numberOfLines={2}>
                    {item.headline}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.sourceName}</Text>
                    <View style={styles.dot} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.publishedAt}</Text>
                  </View>
                  
                  {/* Actions Bar inside Horizontal Card */}
                  <View style={styles.miniActions}>
                    <TouchableOpacity style={styles.miniActionBtn} onPress={() => handleLike(item.id)}>
                      <Ionicons
                        name={likeData.liked ? "heart" : "heart-outline"}
                        size={16}
                        color={likeData.liked ? '#E53E3E' : colors.textSecondary}
                      />
                      <Text style={[styles.miniActionText, { color: colors.textSecondary }]}>
                        {formatLikesCount(likeData.count)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.miniActionBtn} onPress={() => handleBookmark(item.id)}>
                      <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={16}
                        color={isBookmarked ? colors.primary : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Image source={{ uri: item.imageUrl }} style={styles.horizontalImage} />
              </TouchableOpacity>
            );
          }

          // Full Vertical Card
          return (
            <TouchableOpacity
              style={[styles.verticalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.9}
              onPress={() => router.push(`/news/${item.id}` as any)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.verticalImage} />
              <View style={styles.verticalContent}>
                
                {/* Meta row: Tag, time, read duration */}
                <View style={styles.verticalMetaRow}>
                  <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{item.category}</Text>
                  </View>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.publishedAt}</Text>
                  <View style={styles.dot} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.readingTime}</Text>
                </View>

                {/* Headline */}
                <Text style={[styles.verticalHeadline, { color: colors.text }]} numberOfLines={3}>
                  {item.headline}
                </Text>

                {/* Summary */}
                <Text style={[styles.verticalSummary, { color: colors.textSecondary }]} numberOfLines={3}>
                  {item.summary}
                </Text>

                {/* Publisher & View details */}
                <View style={styles.publisherRow}>
                  <Text style={[styles.publisherName, { color: colors.text }]}>
                    source: <Text style={{ fontWeight: '700' }}>{item.sourceName}</Text>
                  </Text>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.views}</Text>
                </View>

                {/* Action button row */}
                <View style={[styles.actionRow, { borderTopColor: colors.divider }]}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleLike(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={likeData.liked ? "heart" : "heart-outline"}
                      size={20}
                      color={likeData.liked ? '#E53E3E' : colors.textSecondary}
                    />
                    <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                      {formatLikesCount(likeData.count)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleBookmark(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isBookmarked ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color={isBookmarked ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleShare(item.headline)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Share</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textTransform: 'capitalize',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  verticalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  verticalContent: {
    padding: 16,
    gap: 12,
  },
  verticalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },
  verticalHeadline: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Newsreader_700Bold',
    lineHeight: 28,
  },
  verticalSummary: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    lineHeight: 20,
  },
  publisherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publisherName: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  horizontalCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  horizontalLeft: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 6,
  },
  horizontalHeadline: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Newsreader_700Bold',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  horizontalImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  miniActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniActionText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});
