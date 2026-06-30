import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

import { useCategoriesAll, useDistrictsList } from '@/hooks/useApi';
import { useTrendingNews, usePopularNews } from '@/hooks/useNews';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'expo-router';

const TOPIC_STYLES: Record<string, {
  iconName: any;
  iconType: 'feather' | 'ionicons';
  iconColor: string;
  iconBg: string;
  selectedBg: string;
  span?: boolean;
}> = {
  technology: { iconName: 'monitor', iconType: 'feather', iconColor: '#6063ee', iconBg: 'rgba(96, 99, 238, 0.08)', selectedBg: '#DDDEFC' },
  tech: { iconName: 'monitor', iconType: 'feather', iconColor: '#6063ee', iconBg: 'rgba(96, 99, 238, 0.08)', selectedBg: '#DDDEFC' },
  design: { iconName: 'color-palette-outline', iconType: 'ionicons', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.08)', selectedBg: '#CBDFE3' },
  sports: { iconName: 'basketball-outline', iconType: 'ionicons', iconColor: '#4648d4', iconBg: 'rgba(70, 72, 212, 0.08)', selectedBg: '#D8D9F7' },
  music: { iconName: 'music', iconType: 'feather', iconColor: '#E11D48', iconBg: 'rgba(225, 29, 72, 0.08)', selectedBg: '#F4D1DE' },
  art: { iconName: 'brush-outline', iconType: 'ionicons', iconColor: '#4648d4', iconBg: 'rgba(70, 72, 212, 0.08)', selectedBg: '#D8D9F7' },
  travel: { iconName: 'compass', iconType: 'feather', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.08)', selectedBg: '#CBDFE3' },
  food: { iconName: 'restaurant-outline', iconType: 'ionicons', iconColor: '#6063ee', iconBg: 'rgba(96, 99, 238, 0.08)', selectedBg: '#DDDEFC' },
  gaming: { iconName: 'game-controller-outline', iconType: 'ionicons', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.08)', selectedBg: '#CBDFE3' },
  wellness: { iconName: 'heart', iconType: 'feather', iconColor: '#E11D48', iconBg: 'rgba(225, 29, 72, 0.08)', selectedBg: '#F4D1DE' },
  health: { iconName: 'heart', iconType: 'feather', iconColor: '#E11D48', iconBg: 'rgba(225, 29, 72, 0.08)', selectedBg: '#F4D1DE' },
  business: { iconName: 'briefcase-outline', iconType: 'ionicons', iconColor: '#B90538', iconBg: 'rgba(185, 5, 56, 0.08)', selectedBg: '#F4D1DE' },
  entertainment: { iconName: 'film-outline', iconType: 'ionicons', iconColor: '#6063ee', iconBg: 'rgba(96, 99, 238, 0.08)', selectedBg: '#DDDEFC' },
  science: { iconName: 'flask-outline', iconType: 'ionicons', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.08)', selectedBg: '#CBDFE3' },
  education: { iconName: 'book-outline', iconType: 'ionicons', iconColor: '#4648d4', iconBg: 'rgba(70, 72, 212, 0.08)', selectedBg: '#D8D9F7' },
  politics: { iconName: 'people-outline', iconType: 'ionicons', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.08)', selectedBg: '#CBDFE3' },
};

export default function DiscoverScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const user = useAuthStore(state => state.user);

  // Fetch Server Data
  const { data: trendingNews = [], isLoading: isLoadingTrending } = useTrendingNews();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesAll();
  const { data: popularNews = [], isLoading: isLoadingPopular } = usePopularNews();
  const { data: districts = [], isLoading: isLoadingDistricts } = useDistrictsList(user?.state ?? null);

  const isLoading = isLoadingTrending || isLoadingCategories || isLoadingPopular || isLoadingDistricts;

  // Extract unique sources dynamically from Popular News
  const sources = React.useMemo(() => {
    const sourceMap = new Map<string, { id: string; name: string }>();
    popularNews.forEach(article => {
      if (article.source && !sourceMap.has(article.source)) {
        sourceMap.set(article.source, { id: article.source, name: article.source });
      }
    });
    return Array.from(sourceMap.values()).slice(0, 8);
  }, [popularNews]);

  // Map Districts to Localities format
  const localities = React.useMemo(() => {
    return districts.map(d => ({
      id: d.id,
      name: d.name,
      count: 'District',
    }));
  }, [districts]);

  // Map Categories to Topic Grid
  const mappedTopics = categories.map((cat) => {
    const style = TOPIC_STYLES[cat.slug] || {
      iconName: 'star-outline',
      iconType: 'ionicons',
      iconColor: '#4648d4',
      iconBg: 'rgba(70, 72, 212, 0.08)',
      selectedBg: '#D8D9F7',
    };
    return {
      id: String(cat.id),
      title: cat.name,
      slug: cat.slug,
      ...style,
    };
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner fullScreen text="Discovering local channels..." colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Discover</Text>
      </View>

      {/* Search Bar Container */}
      <View style={styles.searchBarContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <MaterialIcons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search news, topics, or locations..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Trending Now */}
        {trendingNews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>🔥 TRENDING NOW</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              {trendingNews.slice(0, 5).map((item, index) => (
                <React.Fragment key={item.news_uid}>
                  <TouchableOpacity style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={[styles.itemTitle, { color: colors.primary }]}>{item.title}</Text>
                      <Text style={[styles.itemSubtitle, { color: colors.textTertiary }]}>{`${item.views} views`}</Text>
                    </View>
                    <Ionicons name="trending-up-outline" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                  {index < Math.min(trendingNews.length, 5) - 1 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Browse by Topic */}
        {mappedTopics.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>📂 BROWSE BY TOPIC</Text>
            </View>
            <View style={styles.gridContainer}>
              {mappedTopics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.divider }]}
                  onPress={() => router.push(`/news/category/${topic.id}` as any)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: topic.iconBg }]}>
                    {topic.iconType === 'feather' ? (
                      <Feather name={topic.iconName} size={20} color={topic.iconColor} />
                    ) : (
                      <Ionicons name={topic.iconName} size={20} color={topic.iconColor} />
                    )}
                  </View>
                  <Text style={[styles.gridItemText, { color: colors.text }]}>{topic.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Top Sources */}
        {sources.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>📰 TOP SOURCES</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {sources.map((source) => (
                <TouchableOpacity key={source.id} style={styles.sourceItem}>
                  <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                    <Text style={[styles.avatarText, { color: colors.textSecondary }]}>{source.name.charAt(0)}</Text>
                  </View>
                  <Text style={[styles.sourceText, { color: colors.textSecondary }]}>{source.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Nearby Localities */}
        {localities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>📍 NEARBY LOCALITIES</Text>
            </View>
            <View style={styles.listContainer}>
              {localities.map((locality) => (
                <React.Fragment key={locality.id}>
                  <TouchableOpacity style={[styles.localityItem, { backgroundColor: colors.surface }]}>
                    <View style={[styles.localityIconContainer, { backgroundColor: colors.background }]}>
                      <MaterialIcons name="location-on" size={20} color={colors.textSecondary} />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={[styles.localityTitle, { color: colors.text }]}>{locality.name}</Text>
                      <Text style={[styles.localitySubtitle, { color: colors.primary }]}>{locality.count}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerLeftButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100, // Extra padding for bottom tab
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  seeAllText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.semiBold,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
  },
  listContainer: {
    gap: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  listItemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.semiBold,
    marginBottom: Spacing.xs,
  },
  itemSubtitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    height: 102,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  gridItemText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
  },
  horizontalScroll: {
    paddingRight: Spacing.lg,
  },
  sourceItem: {
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.bold,
  },
  sourceText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
  },
  localityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  localityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  localityTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.semiBold,
    marginBottom: Spacing.xs,
  },
  localitySubtitle: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
  },
});