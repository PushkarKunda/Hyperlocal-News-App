import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useAppTextScale } from '@/hooks/useAppTextScale';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LocalNewsCard, LocalNewsItem } from '@/components/LocalNewsCard';
import { LocalEventCard, LocalEventItem } from '@/components/LocalEventCard';
import MenuOptions from '@/components/MenuOptions';

const FILTERS = ['All Time', 'Today', 'This Week', 'Newest', 'Nearest'];

const TODAY_NEWS: LocalNewsItem[] = [
  {
    id: '1',
    variant: 'vertical',
    title: 'New Community Park Opening Ceremony Tomorrow morning',
    distance: '0.5 km away',
    timeAgo: '45m ago',
    views: '850 views',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
  },
  {
    id: '2',
    variant: 'horizontal',
    title: 'Road Closure Alert: Main Street construction update',
    distance: '1.2 km away',
    timeAgo: '2h ago',
    views: '1.2k',
    imageUrl: 'https://images.unsplash.com/photo-1584984647266-9abf05353846?w=400',
  }
];

const YESTERDAY_NEWS: LocalNewsItem[] = [
  {
    id: '3',
    variant: 'vertical',
    title: 'Artisanal Bakery \'The Crust\' opens near the station',
    distance: '0.8 km away',
    timeAgo: '1d ago',
    views: '2.4k views',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  }
];

const YESTERDAY_EVENT: LocalEventItem = {
  id: 'e1',
  category: 'Neighborhood Alert',
  title: 'Charity Run starting point: JNTU Ground',
  distance: '2.5 km away',
  schedule: 'Scheduled: Sat, 7:00 AM',
  mapImageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800',
};

export default function LocalScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All Time');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  const scale = useAppTextScale();
  const scaledFontSize = (size: number) => ({ fontSize: size * scale });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.headerLeftButton} 
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Local News</Text>
      </View>

      <View style={styles.headerLocationContainer}>
        <TouchableOpacity style={[styles.locationPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialIcons name="location-on" size={20} color={colors.textSecondary} />
          <Text style={[styles.locationText, { color: colors.text }, scaledFontSize(14)]}>Kukatpally, Hyderabad</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} style={styles.locationDropdownIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Filters Section */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    { 
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.filterText,
                    { color: isActive ? '#FFF' : colors.textSecondary },
                    scaledFontSize(12)
                  ]}>
                    {filter}
                  </Text>
                  {filter === 'Newest' && (
                    <MaterialIcons name="arrow-downward" size={12} color={isActive ? '#FFF' : colors.textSecondary} style={{ marginLeft: 4 }} />
                  )}
                  {filter === 'Nearest' && (
                    <MaterialIcons name="near-me" size={12} color={isActive ? '#FFF' : colors.textSecondary} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Feed Content */}
        <View style={styles.feedContent}>
          
          {/* TODAY Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }, scaledFontSize(12)]}>TODAY</Text>
            <View style={styles.cardsContainer}>
              {TODAY_NEWS.map(item => (
                <LocalNewsCard 
                  key={item.id} 
                  item={item} 
                  onPress={() => router.push({ pathname: '/(tabs)', params: { newsId: item.id } })}
                />
              ))}
            </View>
          </View>

          {/* YESTERDAY Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }, scaledFontSize(12)]}>YESTERDAY</Text>
            <View style={styles.cardsContainer}>
              {YESTERDAY_NEWS.map(item => (
                <LocalNewsCard 
                  key={item.id} 
                  item={item} 
                  onPress={() => router.push({ pathname: '/(tabs)', params: { newsId: item.id } })}
                />
              ))}
              <LocalEventCard item={YESTERDAY_EVENT} />
            </View>
          </View>

        </View>
      </ScrollView>
      <MenuOptions isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
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
  headerLocationContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  locationDropdownIcon: {
    marginLeft: 'auto',
  },
  scrollContent: {
    paddingBottom: 120, // Leave space for bottom tab bar
  },
  filtersWrapper: {
    marginBottom: 24,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedContent: {
    paddingHorizontal: 16,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardsContainer: {
    gap: 16,
  },
});