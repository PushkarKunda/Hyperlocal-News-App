import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, useWindowDimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNewsFeed } from '@/hooks/useApi';
import { ImmersiveNewsCard } from '@/components/ImmersiveNewsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useTabBarStore } from '@/store/tabBarStore';
import { NewsArticle } from '@/types';


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
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { newsId } = useLocalSearchParams<{ newsId?: string }>();

  const setTabBarVisible = useTabBarStore((state) => state.setVisible);

  const categoryFlatListRef = useRef<FlatList>(null);
  const horizontalFlatListRef = useRef<FlatList>(null);
  const verticalRefs = useRef<{ [key: string]: FlatList | null }>({});
  const isProgrammaticScroll = useRef(false);

  // Load news dynamically from our simulated backend using React Query
  const { data: news = [], isLoading } = useNewsFeed();

  const [scrollHeight, setScrollHeight] = useState(screenHeight);
  const [activeCategory, setActiveCategory] = useState('for-you');

  const renderNewsCard = useCallback(({ item }: { item: NewsArticle }) => (
    <ImmersiveNewsCard
      item={item}
      containerHeight={scrollHeight}
    />
  ), [scrollHeight]);

  // Reset tab bar visibility and header on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setTabBarVisible(true);
      showHeader();
    });
    return unsubscribe;
  }, [navigation]);

  // Filter news dynamically based on the selected category slug
  const getFilteredNews = (slug: string) => {
    if (slug === 'for-you') return news;
    return news.filter(item => item.category?.slug === slug);
  };

  // Animation values and state for the header auto-hide/pop feature
  const headerAnim = useRef(new Animated.Value(1)).current;
  const isHeaderVisible = useRef(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0, time: 0 });

  const headerHeight = insets.top + 72 + 48; // 72 (header) + 48 (categories)

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-72, 0], // Translate up only by the top header height (72px)
  });

  const headerOpacity = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const showHeader = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    isHeaderVisible.current = true;
    setTabBarVisible(true);
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 3 seconds of inactivity
    hideTimerRef.current = setTimeout(() => {
      hideHeader();
    }, 3000);
  };

  const hideHeader = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    isHeaderVisible.current = false;
    setTabBarVisible(false);
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleTouchStart = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStartPos.current = { x: pageX, y: pageY, time: Date.now() };
  };

  const handleTouchEnd = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    const dx = Math.abs(pageX - touchStartPos.current.x);
    const dy = Math.abs(pageY - touchStartPos.current.y);
    const dt = Date.now() - touchStartPos.current.time;

    // A tap is defined as a short duration touch with very little movement
    if (dx < 10 && dy < 10 && dt < 300) {
      // Ignore taps in the active header/categories area
      const threshold = isHeaderVisible.current ? (insets.top + 72 + 48) : (insets.top + 48);
      if (pageY < threshold) return;
      // Ignore taps in the bottom actions/footer area of the news card
      if (pageY > screenHeight - 80) return;

      if (!isHeaderVisible.current) {
        showHeader();
      } else {
        hideHeader();
      }
    }
  };

  // Initial display and auto-hide when the feed finishes loading
  useEffect(() => {
    if (!isLoading) {
      hideTimerRef.current = setTimeout(() => {
        hideHeader();
      }, 5000);
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [isLoading]);



  // Sync scroll for deep link newsId
  useEffect(() => {
    if (newsId && news.length > 0 && scrollHeight > 0) {
      const item = news.find(i => i.id === newsId);
      if (item) {
        const itemCategory = item.category?.slug || 'for-you';
        const categoryNews = getFilteredNews(itemCategory);
        const itemIndex = categoryNews.findIndex(i => i.id === newsId);

        if (itemIndex !== -1) {
          // Set active category
          setActiveCategory(itemCategory);
          const catIndex = CATEGORIES.findIndex(c => c.slug === itemCategory);

          const timer = setTimeout(() => {
            horizontalFlatListRef.current?.scrollToIndex({ index: catIndex, animated: true });
            categoryFlatListRef.current?.scrollToIndex({ index: catIndex, animated: true, viewPosition: 0.5 });

            const verticalTimer = setTimeout(() => {
              verticalRefs.current[itemCategory]?.scrollToIndex({ index: itemIndex, animated: true });
            }, 250);
            return () => clearTimeout(verticalTimer);
          }, 150);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [newsId, scrollHeight, news]);

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />
        <LoadingSpinner fullScreen text="Curating your local news..." color={colors.primary} colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.background }]}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />

      {/* Absolute pop-style Animated Header Container */}
      <Animated.View style={[
        styles.animatedHeaderContainer,
        {
          transform: [{ translateY: headerTranslateY }],
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: insets.top,
        }
      ]}>
        {/* Styled Symmetrical Theme-Aware Header Section */}
        <Animated.View style={[styles.header, { borderBottomColor: colors.border, opacity: headerOpacity }]}>
          <View style={{ width: 40 }} />

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              <Text style={{ fontFamily: 'Poppins_700Bold' }}>Hyper</Text>
              <Text style={{ fontFamily: 'Poppins_700Bold', color: isDark ? '#818CF8' : colors.primary }}>Local</Text>
              <Text style={{ color: isDark ? '#818CF8' : colors.primary, fontFamily: 'Poppins_700Bold' }}>.</Text>
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={12} color={isDark ? '#818CF8' : colors.primary} style={styles.locationIcon} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {user?.district ? `${user.district.toUpperCase()}, ${user.state?.toUpperCase() || ''}` : (user?.state ? user.state.toUpperCase() : 'HYDERABAD, TS')}
              </Text>
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
        </Animated.View>

        {/* Horizontally Scrollable Categories Tab List */}
        <View style={[styles.categoriesContainer, { borderBottomColor: colors.border }]}>
          <FlatList
            ref={categoryFlatListRef}
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
            keyExtractor={(item) => item.id}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise(resolve => setTimeout(resolve, 50));
              wait.then(() => {
                categoryFlatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
              });
            }}
            renderItem={({ item, index }) => {
              const isActive = activeCategory === item.slug;
              return (
                <TouchableOpacity
                  style={styles.categoryTab}
                  onPress={() => {
                    isProgrammaticScroll.current = true;
                    setActiveCategory(item.slug);
                    horizontalFlatListRef.current?.scrollToIndex({ index, animated: true });
                    categoryFlatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.categoryText,
                    {
                      color: isActive ? colors.primary : colors.textSecondary,
                      fontWeight: isActive ? '700' : '500'
                    }
                  ]}>
                    {item.name}
                  </Text>
                  {isActive && <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Animated.View>

      {/* Main Snap Scrolling Feed Container (Horizontal Pager) */}
      <View
        style={styles.feedWrapper}
        onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
      >
        <FlatList
          ref={horizontalFlatListRef}
          data={CATEGORIES}
          keyExtractor={(item) => item.slug}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          bounces={false}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          scrollEventThrottle={16}
          onScroll={(e) => {
            if (isProgrammaticScroll.current) return;
            const offsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / screenWidth);
            if (index >= 0 && index < CATEGORIES.length) {
              const nextSlug = CATEGORIES[index].slug;
              if (activeCategory !== nextSlug) {
                setActiveCategory(nextSlug);
                categoryFlatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }
            }
          }}
          onMomentumScrollEnd={(e) => {
            isProgrammaticScroll.current = false;
            const offsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / screenWidth);
            if (index >= 0 && index < CATEGORIES.length) {
              const nextSlug = CATEGORIES[index].slug;
              if (activeCategory !== nextSlug) {
                setActiveCategory(nextSlug);
                categoryFlatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }
            }
          }}
          renderItem={({ item: category, index }) => {
            const categoryNews = getFilteredNews(category.slug);
            const activeIndex = CATEGORIES.findIndex(c => c.slug === activeCategory);
            // Pre-load 2 adjacent neighbors for buttery-smooth horizontal swipes
            const isVisible = Math.abs(index - activeIndex) <= 2;

            if (!isVisible) {
              return <View style={{ width: screenWidth, height: scrollHeight }} />;
            }

            if (categoryNews.length === 0) {
              return (
                <View style={[styles.emptyContainer, { width: screenWidth, height: scrollHeight }]}>
                  <Ionicons name="newspaper-outline" size={48} color={colors.textTertiary} style={{ marginBottom: 12 }} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No stories in this category yet</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Check back later or explore other sections</Text>
                </View>
              );
            }

            return (
              <View style={{ width: screenWidth, height: scrollHeight }}>
                <FlatList
                  ref={ref => {
                    verticalRefs.current[category.slug] = ref;
                  }}
                  data={categoryNews}
                  keyExtractor={(item) => item.id}
                  renderItem={renderNewsCard}
                  pagingEnabled
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={scrollHeight}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  disableIntervalMomentum={true}
                  bounces={false}
                  getItemLayout={(_, idx) => ({
                    length: scrollHeight,
                    offset: scrollHeight * idx,
                    index: idx,
                  })}
                  onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 50));
                    wait.then(() => {
                      verticalRefs.current[category.slug]?.scrollToIndex({ index: info.index, animated: true });
                    });
                  }}
                />
              </View>
            );
          }}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
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
    fontSize: 21,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.4,
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
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1.0,
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
    paddingBottom: 6,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
});
