import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { usePublisherArticles } from '@/hooks/useNews';
import { useStore } from '@/store/useStore';
import { NewsArticle, ArticleStatus } from '@/types';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

const TABS = ['all', 'pending', 'published', 'rejected'] as const;
type TabKey = (typeof TABS)[number];

const TAB_CONFIG: Record<TabKey, { label: string; icon: string; color: string }> = {
  all: { label: 'All', icon: 'article', color: '#6567F1' },
  pending: { label: 'Pending', icon: 'hourglass-top', color: '#F59E0B' },
  published: { label: 'Published', icon: 'check-circle', color: '#10B981' },
  rejected: { label: 'Rejected', icon: 'cancel', color: '#EF4444' },
};

export default function PublisherDashboard() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const user = useStore((state) => state.user);
  const approveArticle = useStore((state) => state.approveArticle);
  const rejectArticle = useStore((state) => state.rejectArticle);

  const { all, pending, published, rejected } = usePublisherArticles();
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const articleMap: Record<TabKey, NewsArticle[]> = { all, pending, published, rejected };
  const currentList = articleMap[activeTab];

  const stats = [
    { label: 'Total', value: all.length, icon: 'article', color: '#6567F1' },
    { label: 'Pending', value: pending.length, icon: 'hourglass-top', color: '#F59E0B' },
    { label: 'Published', value: published.length, icon: 'check-circle', color: '#10B981' },
    { label: 'Rejected', value: rejected.length, icon: 'cancel', color: '#EF4444' },
  ];

  const getStatusChip = (status: ArticleStatus) => {
    const map = {
      pending: { bg: '#FEF3C7', text: '#D97706', label: 'Pending Review' },
      published: { bg: '#DCFCE7', text: '#16A34A', label: 'Published' },
      rejected: { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' },
    };
    const s = map[status];
    return (
      <View style={[styles.statusChip, { backgroundColor: s.bg }]}>
        <Text style={[styles.statusChipText, { color: s.text }]}>{s.label}</Text>
      </View>
    );
  };

  const renderArticleItem = ({ item }: { item: NewsArticle }) => (
    <View style={[styles.articleCard, { backgroundColor: colors.surface }]}>
      <View style={styles.articleHeader}>
        <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
          {item.headline}
        </Text>
        {getStatusChip(item.status)}
      </View>

      <Text style={[styles.articleSummary, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.summary}
      </Text>

      <View style={styles.articleMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name="category" size={14} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
            {item.category.name}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={14} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
            {new Date(item.publishedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Admin simulation buttons for pending articles */}
      {item.status === 'pending' && (
        <View style={styles.adminActions}>
          <Pressable
            style={[styles.adminButton, { backgroundColor: '#DCFCE7' }]}
            onPress={() => approveArticle(item.id)}
          >
            <MaterialIcons name="check" size={16} color="#16A34A" />
            <Text style={[styles.adminButtonText, { color: '#16A34A' }]}>Approve</Text>
          </Pressable>
          <Pressable
            style={[styles.adminButton, { backgroundColor: '#FEE2E2' }]}
            onPress={() => rejectArticle(item.id)}
          >
            <MaterialIcons name="close" size={16} color="#DC2626" />
            <Text style={[styles.adminButtonText, { color: '#DC2626' }]}>Reject</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Publisher Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {user?.name ?? 'Publisher'}
          </Text>
        </View>
        <Pressable
          style={[styles.fabSmall, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(publisher)/create' as any)}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* ── Stats Row ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}
      >
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconBg, { backgroundColor: stat.color + '18' }]}>
              <MaterialIcons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ── Tabs ── */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            const config = TAB_CONFIG[tab];
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive ? config.color + '18' : 'transparent',
                    borderColor: isActive ? config.color : colors.border,
                  },
                ]}
              >
                <MaterialIcons
                  name={config.icon as any}
                  size={16}
                  color={isActive ? config.color : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? config.color : colors.textSecondary },
                  ]}
                >
                  {config.label} ({articleMap[tab].length})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Article List ── */}
      {currentList.length > 0 ? (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item.id}
          renderItem={renderArticleItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={56} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No articles here</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            {activeTab === 'all'
              ? 'Start writing your first article!'
              : `You have no ${activeTab} articles.`}
          </Text>
          {activeTab === 'all' && (
            <Pressable
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(publisher)/create' as any)}
            >
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Write Article</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 12,
  },
  backButton: { padding: 4 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  fabSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  statCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 90,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },

  // Tabs
  tabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  tabs: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: { fontSize: 13, fontWeight: '600' },

  // Article cards
  listContent: { padding: 16, gap: 12 },
  articleCard: {
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  articleTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  articleSummary: { fontSize: 13, lineHeight: 19 },
  articleMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },

  // Admin actions
  adminActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adminButtonText: { fontSize: 13, fontWeight: '700' },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
