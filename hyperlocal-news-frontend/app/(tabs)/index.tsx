import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  Text,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { NewsCard } from '@/components/news/NewsCard';
import { CategoryBar } from '@/components/news/CategoryBar';
import { useNews, usePrefetchNews } from '@/hooks/useNews';
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store/useStore';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const toggleBookmark = useStore((state) => state.toggleBookmark);

  const [selectedCategory, setSelectedCategory] = useState('for-you');
  const { data: categories } = useCategories();
  const { data: news, isLoading, refetch, isRefetching } = useNews(selectedCategory);
  const prefetch = usePrefetchNews();

  // Animation for smooth list transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Prefetch logic: Fast and clean
  useEffect(() => {
    if (categories && selectedCategory) {
      const currentIndex = categories.findIndex(c => c.slug === selectedCategory);
      if (currentIndex < categories.length - 1) prefetch(categories[currentIndex + 1].slug);
      if (currentIndex > 0) prefetch(categories[currentIndex - 1].slug);
    }
  }, [selectedCategory, categories, prefetch]);

  const handleCategoryChange = useCallback((slug: string) => {
    if (slug === selectedCategory) return;
    
    // Immediate state update for responsiveness, with a light fade
    Animated.timing(fadeAnim, {
      toValue: 0.4,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setSelectedCategory(slug);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedCategory, fadeAnim]);

  const handleShare = async (title: string, url: string) => {
    try {
      await Share.share({ message: `${title}\n\n${url}` });
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <NewsCard
      article={item}
      onPress={() => router.push(`/news/${item.id}` as any)}
      onBookmarkPress={() => toggleBookmark(item.id)}
      onSharePress={() => handleShare(item.headline, item.url)}
    />
  ), [router, toggleBookmark]);

  const renderSkeleton = () => (
    <View style={styles.listContent}>
      {[1, 2].map((i) => (
        <View key={i} style={styles.skeletonContainer}>
          <Skeleton width="100%" height={220} borderRadius={24} colorScheme={colorScheme ?? 'light'} />
          <View style={styles.skeletonTextRow}>
            <Skeleton width="85%" height={24} colorScheme={colorScheme ?? 'light'} />
            <Skeleton width="45%" height={16} style={{ marginTop: 12 }} colorScheme={colorScheme ?? 'light'} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>LocalBuzz</Text>
        <Text style={[styles.headerDate, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {/* ── Refactored Pager-Style Category Slider ── */}
      {categories && (
        <CategoryBar
          categories={categories}
          selectedSlug={selectedCategory}
          onSelect={handleCategoryChange}
          onViewFocused={handleCategoryChange}
        />
      )}

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {isLoading && !news?.length ? (
          renderSkeleton()
        ) : news && news.length > 0 ? (
          <FlatList
            data={news}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
            }
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📰</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No stories in this area</Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  headerDate: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  listContent: { padding: 20 },
  skeletonContainer: { marginBottom: 28 },
  skeletonTextRow: { marginTop: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
});