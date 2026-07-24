import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNewsFeed, useCategories, useCategoryNews } from '@/hooks/useNews';
import { useBookmarks } from '@/hooks/useEngagement';
import { FeedItem, NewsArticle } from '@/services/api/news';
import { ImmersiveFeedCard } from '@/components/ImmersiveNewsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useTabBarStore } from '@/store/tabBarStore';
import { CommentsModal } from '@/components/CommentsModal';

const FOR_YOU_ID = 'for-you' as const;
type CategoryId = typeof FOR_YOU_ID | number;

export default function HomeScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const navigation = useNavigation();
  const { user, cachedPreferences, fetchPreferences } = useAuthStore();
  const { height: screenHeight } = useWindowDimensions();

  useEffect(() => {
    // Fetch user preferences in the background to ensure header location is up-to-date
    fetchPreferences().catch((err) => console.log('Failed to fetch preferences', err));
  }, [fetchPreferences]);
  const insets = useSafeAreaInsets();
  const setTabBarVisible = useTabBarStore((s) => s.setVisible);

  // ─── State ────────────────────────────────────────────────────────────
  const [scrollHeight, setScrollHeight] = useState(screenHeight);
  const [activeCategory, setActiveCategory] = useState<CategoryId>(FOR_YOU_ID);
  const [activeCommentUid, setActiveCommentUid] = useState<string | null>(null);

  const params = useLocalSearchParams<{ categoryId?: string }>();

  useEffect(() => {
    if (params.categoryId) {
      const catId = Number(params.categoryId);
      if (!isNaN(catId)) {
        setActiveCategory(catId);
      }
    }
  }, [params.categoryId]);

  // ─── Refs ─────────────────────────────────────────────────────────────
  const categoryTabRef = useRef<FlatList>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const headerAnim = useRef(new Animated.Value(1)).current;
  const isHeaderVisible = useRef(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Data ─────────────────────────────────────────────────────────────

  // Dynamic categories from backend - excludes "Local" (has its own tab)
  const { data: categoriesData = [], isLoading: isLoadingCategories } =
    useCategories();

  // "For You" = full mixed feed (news + ads + sponsored) as API returns
  const { data: forYouFeed, isLoading: isLoadingFeed } = useNewsFeed({
    limit: 50,
  });

  // Category tab news (pure news only, no ads)
  const { data: categoryNewsData = [], isLoading: isLoadingCategoryNews } =
    useCategoryNews(
      typeof activeCategory === 'number' ? activeCategory : null
    );

  // Bookmarks - used to show filled/outline bookmark icon
  const { data: rawNewsBookmarks = [] } = useBookmarks('news');
  const { data: rawPostBookmarks = [] } = useBookmarks('post');

  // ─── Derived ──────────────────────────────────────────────────────────

  // "For You" + dynamic categories (no Local)
  const categoryTabs = useMemo(() => {
    const tabs: Array<{ id: CategoryId; name: string; color?: string }> = [
      { id: FOR_YOU_ID, name: 'For You' },
    ];
    categoriesData
      .filter((c) => c.name.toLowerCase() !== 'local')
      .forEach((c) => tabs.push({ id: c.id, name: c.name, color: c.color }));
    return tabs;
  }, [categoriesData]);

  // Bookmarked news_uids for O(1) lookup
  const bookmarkedNewsUids = useMemo(() => {
    const set = new Set<string>();
    rawNewsBookmarks.forEach(b => set.add(String(b.content_uid)));
    rawPostBookmarks.forEach(b => set.add(String(b.content_uid)));
    return set;
  }, [rawNewsBookmarks, rawPostBookmarks]);

  // Feed items to render in the vertical snap list
  const feedItems = useMemo((): FeedItem[] => {
    if (activeCategory === FOR_YOU_ID) {
      if (!forYouFeed) return [];
      let rawItems: any[] = [];
      if (Array.isArray(forYouFeed)) {
        rawItems = forYouFeed;
      } else if (Array.isArray((forYouFeed as any).items)) {
        rawItems = (forYouFeed as any).items;
      } else if (Array.isArray((forYouFeed as any).data)) {
        rawItems = (forYouFeed as any).data;
      } else if (Array.isArray((forYouFeed as any).news)) {
        rawItems = (forYouFeed as any).news;
      }

      return rawItems.map((item: any, idx: number): FeedItem => {
        if (item && item.type && item.data) {
          return item as FeedItem;
        }
        return {
          type: 'news',
          data: item,
          position: idx,
        };
      });
    }
    // Category tabs: wrap news articles into FeedItem shape
    const categoryArticles = Array.isArray(categoryNewsData)
      ? categoryNewsData
      : (categoryNewsData as any)?.news && Array.isArray((categoryNewsData as any).news)
        ? (categoryNewsData as any).news
        : (categoryNewsData as any)?.data && Array.isArray((categoryNewsData as any).data)
          ? (categoryNewsData as any).data
          : [];

    return categoryArticles.map(
      (article: any, i: number): FeedItem => ({
        type: 'news',
        data: article,
        position: i,
      })
    );
  }, [activeCategory, forYouFeed, categoryNewsData]);

  const isLoading =
    isLoadingCategories ||
    (activeCategory === FOR_YOU_ID
      ? isLoadingFeed
      : isLoadingCategoryNews);

  // ─── Header animation ─────────────────────────────────────────────────
  const headerHeight = insets.top + 72 + 48;

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-72, 0],
  });

  const headerOpacity = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const showHeader = useCallback(() => {
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
    if (!isLoading) {
      hideTimerRef.current = setTimeout(() => hideHeader(), 3000);
    }
  }, [isLoading]);

  const hideHeader = useCallback(() => {
    if (isLoading) return;
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
  }, [isLoading]);

  const onTouchStart = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStartRef.current = { x: pageX, y: pageY, time: Date.now() };
  };

  const onTouchEnd = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    const dx = Math.abs(pageX - touchStartRef.current.x);
    const dy = Math.abs(pageY - touchStartRef.current.y);
    const dt = Date.now() - touchStartRef.current.time;
    if (dx < 10 && dy < 10 && dt < 300) {
      const threshold = isHeaderVisible.current
        ? headerHeight
        : insets.top + 48;
      if (pageY < threshold || pageY > scrollHeight - 80) return;
      isHeaderVisible.current ? hideHeader() : showHeader();
    }
  };

  // Reset on screen focus
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      setTabBarVisible(true);
      showHeader();
    });
    return unsub;
  }, [navigation, showHeader]);

  // Auto-hide 5s after feed loads
  useEffect(() => {
    if (!isLoading) {
      showHeader();
      hideTimerRef.current = setTimeout(() => hideHeader(), 5000);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isLoading]);

  // ─── Render helpers ───────────────────────────────────────────────────

  const handleOpenComments = useCallback((uid: string) => {
    setActiveCommentUid(uid);
  }, []);

  const handleCloseComments = useCallback(() => {
    setActiveCommentUid(null);
  }, []);

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <ImmersiveFeedCard
        item={item}
        containerHeight={scrollHeight}
        bookmarkedNewsUids={bookmarkedNewsUids}
        onOpenComments={handleOpenComments}
      />
    ),
    [scrollHeight, bookmarkedNewsUids, handleOpenComments]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: scrollHeight,
      offset: scrollHeight * index,
      index,
    }),
    [scrollHeight]
  );

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        translucent
        backgroundColor="transparent"
      />

      {/* ── Animated Header ─────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top,
          },
        ]}
      >
        {/* Top bar */}
        <Animated.View
          style={[
            styles.topBar,
            { borderBottomColor: colors.border, opacity: headerOpacity },
          ]}
        >
          <View style={{ width: 40 }} />

          <View style={styles.headerCenter}>
            <Text style={[styles.appName, { color: colors.text }]}>
              <Text style={{ fontFamily: 'Poppins_700Bold' }}>Hyper</Text>
              <Text
                style={{
                  fontFamily: 'Poppins_700Bold',
                  color: isDark ? '#818CF8' : colors.primary,
                }}
              >
                Local
              </Text>
              <Text
                style={{
                  color: isDark ? '#818CF8' : colors.primary,
                  fontFamily: 'Poppins_700Bold',
                }}
              >
                .
              </Text>
            </Text>
            <TouchableOpacity
              style={styles.locationRow}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/settings-location')}
            >
              <Ionicons
                name="location-sharp"
                size={12}
                color={isDark ? '#818CF8' : colors.primary}
              />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {(() => {
                  const dist = cachedPreferences?.district_name || user?.district;
                  const st = cachedPreferences?.state_name || user?.state;
                  if (dist) return `${dist.toUpperCase()}, ${st?.toUpperCase() ?? ''}`;
                  if (st) return st.toUpperCase();
                  return 'SELECT LOCATION';
                })()}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(70,72,212,0.05)',
              },
            ]}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.text}
            />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* Dynamic category tabs */}
        <View
          style={[styles.tabsContainer, { borderBottomColor: colors.border }]}
        >
          <FlatList
            ref={categoryTabRef}
            data={categoryTabs}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
            keyExtractor={(t) => String(t.id)}
            onScrollToIndexFailed={() => { }}
            renderItem={({ item: tab, index }) => {
              const isActive = activeCategory === tab.id;
              const activeColor = tab.color || colors.primary;
              return (
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => {
                    setActiveCategory(tab.id);
                    categoryTabRef.current?.scrollToIndex({
                      index,
                      animated: true,
                      viewPosition: 0.5,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isActive ? activeColor : colors.textSecondary,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.name}
                  </Text>
                  {isActive && (
                    <View
                      style={[
                        styles.tabIndicator,
                        { backgroundColor: activeColor },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Animated.View>

      {/* ── Feed ────────────────────────────────────────────────────── */}
      <View
        style={styles.feedWrapper}
        onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
      >
        {isLoading ? (
          <View style={[styles.centered, { paddingTop: headerHeight }]}>
            <LoadingSpinner
              text="Curating your local news..."
              color={colors.primary}
              colorScheme={colorScheme ?? 'light'}
            />
          </View>
        ) : feedItems.length === 0 ? (
          <View style={[styles.centered, { paddingTop: headerHeight }]}>
            <Ionicons
              name="newspaper-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No stories yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Check back later or explore other categories
            </Text>
          </View>
        ) : (
          <FlatList
            data={feedItems}
            keyExtractor={(item) => `${item.type}-${item.position}`}
            renderItem={renderFeedItem}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={scrollHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            bounces={false}
            getItemLayout={getItemLayout}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
          />
        )}
      </View>

      <CommentsModal
        visible={!!activeCommentUid}
        onClose={handleCloseComments}
        newsUid={activeCommentUid || ''}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1 },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 72,
    borderBottomWidth: 1,
  },
  headerCenter: { alignItems: 'center' },
  appName: {
    fontSize: 21,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1.0,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#fff',
  },
  tabsContainer: { borderBottomWidth: 1, paddingVertical: 4 },
  tabsContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 20,
    height: 40,
  },
  tab: {
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: -0.2,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  feedWrapper: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
});