import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNewsFeed } from '@/hooks/useApi';
import { ImmersiveNewsCard } from '@/components/ImmersiveNewsCard';
import MenuOptions from '@/components/MenuOptions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

const { height: screenHeight } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'for-you', name: 'For You', slug: 'for-you' },
  { id: 'local', name: 'Local', slug: 'local' },
  { id: 'politics', name: 'Politics', slug: 'politics' },
  { id: 'sports', name: 'Sports', slug: 'sports' },
  { id: 'business', name: 'Business', slug: 'business' },
  { id: 'technology', name: 'Technology', slug: 'technology' },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment' },
  { id: 'health', name: 'Health', slug: 'health' },
  { id: 'education', name: 'Education', slug: 'education' },
  { id: 'science', name: 'Science', slug: 'science' },
  { id: 'environment', name: 'Environment', slug: 'environment' },
  { id: 'world-news', name: 'World News', slug: 'world-news' }
];

export default function HomeScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const { newsId } = useLocalSearchParams<{ newsId?: string }>();
  const flatListRef = useRef<FlatList>(null);
  const [scrollHeight, setScrollHeight] = useState(screenHeight);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('for-you');

  // Load news dynamically from our simulated backend using React Query
  const { data: news = [], isLoading } = useNewsFeed();

  // Filter news dynamically based on the selected category slug
  const filteredNews = news.filter(item => {
    if (activeCategory === 'for-you') return true;
    return item.category?.slug === activeCategory;
  });

  useEffect(() => {
    if (newsId && news.length > 0) {
      const index = news.findIndex(item => item.id === newsId);
      if (index !== -1 && scrollHeight > 0) {
        const timer = setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: true });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [newsId, scrollHeight, news]);

  // Reset FlatList scroll when the category changes
  useEffect(() => {
    if (filteredNews.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [activeCategory]);

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />
        <LoadingSpinner fullScreen text="Curating your local news..." color={colors.primary} colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />

      {/* Styled Symmetrical Theme-Aware Header Section */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.headerLeftButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(70, 72, 212, 0.05)' }]} 
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>HyperLocal</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={12} color={colors.primary} style={styles.locationIcon} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>NEW YORK, NY</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.headerRightButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(70, 72, 212, 0.05)' }]}
          onPress={() => router.push('/(tabs)/notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Horizontally Scrollable Categories Tab List */}
      <View style={[styles.categoriesContainer, { borderBottomColor: colors.border }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryTab}
                onPress={() => setActiveCategory(cat.slug)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.categoryText, 
                  { 
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500'
                  }
                ]}>
                  {cat.name}
                </Text>
                {isActive && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Snap Scrolling Feed Container */}
      <View 
        style={styles.feedWrapper}
        onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
      >
        {filteredNews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color={colors.textTertiary} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No stories in this category yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Check back later or explore other sections</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={filteredNews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ImmersiveNewsCard 
                item={item} 
                containerHeight={scrollHeight} 
              />
            )}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={scrollHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            bounces={false}
            getItemLayout={(data, index) => ({
              length: scrollHeight,
              offset: scrollHeight * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise(resolve => setTimeout(resolve, 50));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
          />
        )}
      </View>

      {/* Reusable Menu Drawer Overlay Component */}
      <MenuOptions 
        isVisible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 72,
    borderBottomWidth: 1,
  },
  headerLeftButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIcon: {
    marginRight: 2,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 20,
    height: 40,
  },
  categoryTab: {
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
});