import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Spacing';

interface BookmarkItem {
  id: string;
  type: 'news' | 'events' | 'shorts';
  category: string;
  title: string;
  publisher: string;
  timeAgo: string;
  imageUrl: string;
  dateGroup: 'Today' | 'Yesterday';
}

const INITIAL_BOOKMARKS: BookmarkItem[] = [
  {
    id: '1',
    type: 'news',
    category: 'BUSINESS',
    title: 'Kukatpally Startups Raise $500M in Venture Capital',
    publisher: 'Times of India',
    timeAgo: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    dateGroup: 'Today',
  },
  {
    id: '2',
    type: 'events',
    category: 'LOCAL EVENT',
    title: 'Downtown Jazz Festival in Kukatpally Amphitheater',
    publisher: 'Neighborhood Hub',
    timeAgo: 'May 25 • 6:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400',
    dateGroup: 'Today',
  },
  {
    id: '3',
    type: 'shorts',
    category: 'SHORT VIDEO',
    title: 'Clean Hyderabad Lake Beautification Project Wraps Up',
    publisher: 'Chronicle Shorts',
    timeAgo: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400',
    dateGroup: 'Yesterday',
  },
];

export default function BookmarksScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'events' | 'shorts'>('all');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(INITIAL_BOOKMARKS);

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
  };

  // Filter items based on segmented tab bar
  const filteredBookmarks = bookmarks.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const todayBookmarks = filteredBookmarks.filter((item) => item.dateGroup === 'Today');
  const yesterdayBookmarks = filteredBookmarks.filter((item) => item.dateGroup === 'Yesterday');

  const renderBookmarkItem = (item: BookmarkItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.bookmarkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.8}
      onPress={() => {
        if (item.type === 'news') router.push(`/news/${item.id}` as any);
        if (item.type === 'events') router.push(`/(tabs)/events` as any);
        if (item.type === 'shorts') router.push(`/(tabs)/shorts` as any);
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
      <View style={styles.contentArea}>
        <Text style={[styles.categoryText, { color: colors.primary }]}>
          {item.category}
        </Text>
        <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.publisher}
          </Text>
          <View style={styles.dot} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {item.timeAgo}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeBookmark(item.id)}
        activeOpacity={0.6}
      >
        <Ionicons name="bookmark" size={20} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            if (from === 'profile') {
              router.push('/(tabs)/profile');
            } else {
              router.back();
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>bookmarks</Text>
        {bookmarks.length > 0 ? (
          <TouchableOpacity onPress={clearAllBookmarks}>
            <Text style={[styles.clearText, { color: colors.primary }]}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Segmented Tab Bar */}
      <View style={styles.tabWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {['all', 'news', 'events', 'shorts'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveTab(tab as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabPillText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
                  {tab === 'all' ? 'All Saved' : tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List Area */}
      {filteredBookmarks.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Today Group */}
          {todayBookmarks.length > 0 && (
            <View style={styles.groupSection}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Today</Text>
              <View style={styles.cardsContainer}>
                {todayBookmarks.map(renderBookmarkItem)}
              </View>
            </View>
          )}

          {/* Yesterday Group */}
          {yesterdayBookmarks.length > 0 && (
            <View style={styles.groupSection}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Yesterday</Text>
              <View style={styles.cardsContainer}>
                {yesterdayBookmarks.map(renderBookmarkItem)}
              </View>
            </View>
          )}

        </ScrollView>
      ) : (
        /* Empty State */
        <View style={styles.emptyStateContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="bookmark-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bookmarks Saved</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tap the bookmark icon on any news feed or article details screen to save it here for offline reading.
          </Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreButtonText}>Explore Feed</Text>
          </TouchableOpacity>
        </View>
      )}
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
  clearText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  tabWrapper: {
    paddingVertical: 14,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  groupSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginLeft: 4,
  },
  cardsContainer: {
    gap: 12,
  },
  bookmarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    resizeMode: 'cover',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 4,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  removeButton: {
    padding: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  exploreButton: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
