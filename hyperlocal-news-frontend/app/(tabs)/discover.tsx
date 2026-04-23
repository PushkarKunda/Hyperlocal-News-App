import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

// Data definitions
const TRENDING = [
  { id: '1', title: '#LocalElection', count: '4.2k stories this morning', icon: 'trending-up' },
  { id: '2', title: '#MetroUpdate', count: '1.8k stories', icon: 'trending-up' },
  { id: '3', title: '#WeatherAlert', count: '900 stories', icon: 'cloud' }
];

const TOPICS = [
  { id: '1', title: 'Business', icon: 'briefcase', library: 'FontAwesome5' },
  { id: '2', title: 'Politics', icon: 'gavel', library: 'FontAwesome5' },
  { id: '3', title: 'Tech', icon: 'laptop', library: 'MaterialIcons' },
  { id: '4', title: 'Crime', icon: 'shield', library: 'Ionicons' },
  { id: '5', title: 'Sports', icon: 'sports-soccer', library: 'MaterialIcons' },
  { id: '6', title: 'Lifestyle', icon: 'star', library: 'Ionicons' }
];

const SOURCES = [
  { id: '1', name: 'Times' },
  { id: '2', name: 'Daily' },
  { id: '3', name: 'Watch' },
  { id: '4', name: 'Metro' },
  { id: '5', name: 'Bulletin' }
];

const LOCALITIES = [
  { id: '1', name: 'Gachibowli', count: '12 new stories' },
  { id: '2', name: 'Madhapur', count: '8 new stories' },
  { id: '3', name: 'Jubilee Hills', count: '15 new stories' }
];

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const renderIcon = (library: string, name: string, color: string, size: number) => {
    switch (library) {
      case 'FontAwesome5': return <FontAwesome5 name={name as any} size={size} color={color} />;
      case 'Ionicons': return <Ionicons name={name as any} size={size} color={color} />;
      case 'MaterialCommunityIcons': return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
      default: return <MaterialIcons name={name as any} size={size} color={color} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
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
            {TRENDING.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity style={styles.listItem}>
                  <View style={styles.listItemContent}>
                    <Text style={[styles.itemTitle, { color: colors.primary }]}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: colors.textTertiary }]}>{item.count}</Text>
                  </View>
                  <Ionicons name={item.icon as any} size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                {index < TRENDING.length - 1 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
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
            {TOPICS.map((topic) => (
              <TouchableOpacity key={topic.id} style={[styles.gridItem, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                  {renderIcon(topic.library, topic.icon, colors.primary, 20)}
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
            {SOURCES.map((source) => (
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
            {LOCALITIES.map((locality, index) => (
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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