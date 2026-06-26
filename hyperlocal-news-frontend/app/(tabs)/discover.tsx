import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Image } from 'expo-image';


import { useTrendingList, useCategoriesList, useSourcesList, useLocalitiesList } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DiscoverScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');



  // Load discover page segments dynamically from simulated Axios client using React Query hooks
  const { data: trending = [], isLoading: isLoadingTrending } = useTrendingList();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesList();
  const { data: sources = [], isLoading: isLoadingSources } = useSourcesList();
  const { data: localities = [], isLoading: isLoadingLocalities } = useLocalitiesList();

  const renderIcon = (library: string, name: string, color: string, size: number) => {
    switch (library) {
      case 'FontAwesome5': return <FontAwesome5 name={name as any} size={size} color={color} />;
      case 'Ionicons': return <Ionicons name={name as any} size={size} color={color} />;
      case 'MaterialCommunityIcons': return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
      default: return <MaterialIcons name={name as any} size={size} color={color} />;
    }
  };

  const isLoading = isLoadingTrending || isLoadingCategories || isLoadingSources || isLoadingLocalities;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <LoadingSpinner fullScreen text="Discovering local channels..." colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  // Map backend categories/interests nicely to the 6 bento grid items with custom gorgeous icons
  const mappedTopics = categories.map((cat) => {
    let library = 'MaterialIcons';
    let icon = cat.icon || 'star';
    const slug = cat.slug?.toLowerCase();
    
    if (slug === 'business') {
      library = 'FontAwesome5';
      icon = 'briefcase';
    } else if (slug === 'politics') {
      library = 'FontAwesome5';
      icon = 'gavel';
    } else if (slug === 'technology' || slug === 'tech') {
      library = 'MaterialIcons';
      icon = 'laptop';
    } else if (slug === 'crime') {
      library = 'Ionicons';
      icon = 'shield';
    } else if (slug === 'health' || slug === 'wellness') {
      library = 'MaterialIcons';
      icon = 'healing';
    } else if (slug === 'sports') {
      library = 'MaterialIcons';
      icon = 'sports-soccer';
    } else if (slug === 'education') {
      library = 'MaterialIcons';
      icon = 'school';
    }
    return {
      id: cat.id,
      title: cat.name,
      icon,
      library
    };
  }).slice(0, 6);

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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>🔥 TRENDING NOW</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {trending.map((item: any, index: number) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity style={styles.listItem}>
                  <View style={styles.listItemContent}>
                    <Text style={[styles.itemTitle, { color: colors.primary }]}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: colors.textTertiary }]}>{item.count}</Text>
                  </View>
                  <Ionicons name={item.icon as any} size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                {index < trending.length - 1 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Browse by Topic */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>📂 BROWSE BY TOPIC</Text>
          </View>
          <View style={styles.gridContainer}>
            {mappedTopics.map((topic) => (
              <TouchableOpacity key={topic.id} style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                  {topic.icon.startsWith('http') || topic.icon.includes('/') ? (
                    <Image
                      source={{ uri: topic.icon }}
                      style={{ width: 20, height: 20, tintColor: colors.primary }}
                      contentFit="contain"
                    />
                  ) : (
                    renderIcon(topic.library, topic.icon, colors.primary, 20)
                  )}
                </View>
                <Text style={[styles.gridItemText, { color: colors.text }]}>{topic.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Sources */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>📰 TOP SOURCES</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {sources.map((source: any) => (
              <TouchableOpacity key={source.id} style={styles.sourceItem}>
                <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                  <Text style={[styles.avatarText, { color: colors.textSecondary }]}>{source.name.charAt(0)}</Text>
                </View>
                <Text style={[styles.sourceText, { color: colors.textSecondary }]}>{source.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nearby Localities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>📍 NEARBY LOCALITIES</Text>
          </View>
          <View style={styles.listContainer}>
            {localities.map((locality: any, index: number) => (
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