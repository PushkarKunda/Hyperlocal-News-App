import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useStore } from '@/store/useStore';
import { LinearGradient } from 'expo-linear-gradient';

/** Returns a human-readable relative time string */
function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Filters for articles with the shape needed by this screen */
interface HistoryItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  image?: string;
  source: string;
  publishedAt: string;
  readTime: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  politics:    '#E11D48',
  tech:        '#6063ee',
  sports:      '#4648D4',
  business:    '#006A61',
  health:      '#0D9488',
  entertainment: '#D97706',
  local:       '#7C3AED',
  national:    '#BE185D',
  world:       '#0369A1',
};

/** Group items by date bucket */
function groupByDate(items: HistoryItem[]): { label: string; items: HistoryItem[] }[] {
  const today: HistoryItem[] = [];
  const yesterday: HistoryItem[] = [];
  const older: HistoryItem[] = [];

  const now = Date.now();
  items.forEach((item) => {
    const diff = now - new Date(item.publishedAt).getTime();
    const hours = diff / 3600000;
    if (hours < 24) today.push(item);
    else if (hours < 48) yesterday.push(item);
    else older.push(item);
  });

  const groups = [];
  if (today.length) groups.push({ label: 'Today', items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  if (older.length) groups.push({ label: 'Earlier', items: older });
  return groups;
}

interface HistoryCardProps {
  item: HistoryItem;
  onRemove: (id: string) => void;
  onPress: (id: string) => void;
}

function HistoryCard({ item, onRemove, onPress }: HistoryCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const catColor = CATEGORY_COLORS[item.category?.toLowerCase()] ?? '#4648D4';

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 180, friction: 12 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start()}
    >
      <Animated.View
        style={[
          styles.historyCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Article Thumbnail */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumbnail} />
        ) : (
          <LinearGradient
            colors={[catColor + '33', catColor + '11']}
            style={styles.thumbnailPlaceholder}
          >
            <Ionicons name="newspaper-outline" size={28} color={catColor} />
          </LinearGradient>
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Category Chip */}
          <View style={[styles.categoryChip, { backgroundColor: catColor + '18' }]}>
            <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
            <Text style={[styles.categoryText, { color: catColor }]}>
              {item.category}
            </Text>
          </View>

          <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <Text style={[styles.sourceName, { color: colors.textSecondary }]}>{item.source}</Text>
            <Text style={[styles.dotSep, { color: colors.textTertiary }]}>·</Text>
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>{timeAgo(item.publishedAt)}</Text>
            <Text style={[styles.dotSep, { color: colors.textTertiary }]}>·</Text>
            <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>{item.readTime}min</Text>
          </View>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={[styles.removeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
          onPress={() => onRemove(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </Animated.View>
    </Pressable>
  );
}

export default function ProfileReadingHistoryScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Pull articles from the store and simulate "read" history from first 8 published articles
  const allArticles = useStore((s) => s.allArticles);

  const mockHistory: HistoryItem[] = useMemo(() =>
    allArticles
      .filter((a) => a.status === 'published')
      .slice(0, 12)
      .map((a, i) => ({
        id: a.id,
        title: a.title,
        category: a.category?.name ?? 'General',
        categoryColor: CATEGORY_COLORS[a.category?.slug ?? ''] ?? '#4648D4',
        image: a.imageUrl,
        source: a.source?.name ?? 'HyperLocal',
        publishedAt: a.publishedAt ?? new Date(Date.now() - i * 3600000 * 4).toISOString(),
        readTime: Math.max(2, Math.floor(a.title.length / 30)),
      })),
    [allArticles]
  );

  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [filter, setFilter] = useState<'all' | 'today' | 'yesterday'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return history;
    const now = Date.now();
    return history.filter((item) => {
      const diff = now - new Date(item.publishedAt).getTime();
      const hours = diff / 3600000;
      if (filter === 'today') return hours < 24;
      if (filter === 'yesterday') return hours >= 24 && hours < 48;
      return true;
    });
  }, [history, filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleRemove = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your entire reading history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => setHistory([]) },
      ]
    );
  };

  const handlePress = (id: string) => {
    router.push({ pathname: '/news/[id]' as any, params: { id } });
  };

  const filterTabs: { key: 'all' | 'today' | 'yesterday'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Background blurs */}
      <View style={[styles.purpleBlur, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.12)' : 'rgba(70, 72, 212, 0.04)' }]} />
      <View style={[styles.tealBlur, { backgroundColor: isDark ? 'rgba(0, 106, 97, 0.12)' : 'rgba(0, 106, 97, 0.04)' }]} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.headerLeftButton, { backgroundColor: 'rgba(70, 72, 212, 0.05)' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reading History</Text>
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.headerRightButton}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete-outline" size={22} color="#ba1a1a" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats strip */}
      {history.length > 0 && (
        <View style={[styles.statsStrip, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.08)' : 'rgba(70, 72, 212, 0.04)', borderBottomColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{history.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Stories Read</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {history.reduce((acc, h) => acc + h.readTime, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Mins Read</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {new Set(history.map((h) => h.category)).size}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Topics</Text>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      {history.length > 0 && (
        <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                filter === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setFilter(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filter === tab.key ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.15)' : 'rgba(70, 72, 212, 0.06)' }]}>
            <MaterialIcons name="history" size={56} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Reading History</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Articles you read will appear here so you can easily find them again
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.85}
          >
            <Ionicons name="newspaper-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.browseButtonText}>Browse Stories</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing Here</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            No articles read in this time period
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {grouped.map((group) => (
            <View key={group.label} style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>{group.label}</Text>
                <View style={[styles.groupLine, { backgroundColor: colors.border }]} />
              </View>
              {group.items.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onPress={handlePress}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  purpleBlur: {
    position: 'absolute',
    right: -39,
    top: -98,
    width: 156,
    height: 393.59,
    borderRadius: 9999,
    zIndex: -1,
  },
  tealBlur: {
    position: 'absolute',
    left: -19.5,
    bottom: -49.19,
    width: 117,
    height: 295.19,
    borderRadius: 9999,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerLeftButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  headerRightButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  filterRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 4,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },
  group: {
    gap: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  groupLine: {
    flex: 1,
    height: 1,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  historyCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    minHeight: 96,
  },
  thumbnail: {
    width: 90,
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    gap: 5,
    justifyContent: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    gap: 5,
  },
  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  sourceName: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500',
  },
  dotSep: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
  },
  removeBtn: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 9999,
    marginTop: 8,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});
