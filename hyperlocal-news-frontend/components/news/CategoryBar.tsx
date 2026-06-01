import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Category } from '@/types';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Configuration ──────────────────────────────────────────────────────────
const ITEM_WIDTH = SCREEN_WIDTH * 0.7; // Large, clear cards
const ITEM_SPACING = 16;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;
const HORIZONTAL_PADDING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

interface CategoryBarProps {
  categories: Category[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  onViewFocused?: (slug: string) => void;
}

const CategoryCard = memo(({ 
  item, 
  isFocused, 
  onPress, 
  colors 
}: { 
  item: Category; 
  isFocused: boolean; 
  onPress: () => void;
  colors: any;
}) => (
  <View style={[styles.cardContainer, { width: ITEM_WIDTH }]}>
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isFocused ? item.color ?? colors.primary : colors.surface,
          borderColor: isFocused ? 'transparent' : colors.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          // Fixed height for stability
          height: 80,
        },
      ]}
    >
      <View style={[
        styles.iconBox, 
        { backgroundColor: isFocused ? 'rgba(255,255,255,0.25)' : colors.primaryLight }
      ]}>
        <MaterialIcons
          name={item.icon as any}
          size={24}
          color={isFocused ? '#FFFFFF' : colors.primary}
        />
      </View>
      
      <View style={styles.textDetails}>
        <Text
          style={[
            styles.title,
            { color: isFocused ? '#FFFFFF' : colors.text },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={[
          styles.subtitle, 
          { color: isFocused ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
        ]}>
          Swipe to see more
        </Text>
      </View>
    </Pressable>
  </View>
));

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedSlug,
  onSelect,
  onViewFocused,
}) => {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const flatListRef = useRef<FlatList>(null);
  
  // Track the current index to avoid redundant updates
  const currentIndexRef = useRef(categories.findIndex(c => c.slug === selectedSlug));

  // Sync scroll on mount and category change
  useEffect(() => {
    const idx = categories.findIndex(c => c.slug === selectedSlug);
    if (idx !== -1 && idx !== currentIndexRef.current) {
      currentIndexRef.current = idx;
      flatListRef.current?.scrollToOffset({
        offset: idx * SNAP_INTERVAL,
        animated: true,
      });
    }
  }, [selectedSlug, categories]);

  // Use momentum scroll end for buttery smooth state updates
  // This ensures we only update data when the user HAS finished their interaction
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SNAP_INTERVAL);
    
    if (index >= 0 && index < categories.length) {
      const newCategory = categories[index];
      if (newCategory.slug !== selectedSlug) {
        currentIndexRef.current = index;
        if (onViewFocused) {
          onViewFocused(newCategory.slug);
        }
      }
    }
  }, [categories, selectedSlug, onViewFocused]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: SNAP_INTERVAL,
    offset: SNAP_INTERVAL * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            item={item}
            isFocused={item.slug === selectedSlug}
            onPress={() => onSelect(item.slug)}
            colors={colors}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: HORIZONTAL_PADDING }]}
        
        // ── Smoothness Engine ──────────────────────────────────────────────
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        scrollEventThrottle={16}
        
        // ── Performance Engine ─────────────────────────────────────────────
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        
        // ── Interaction Engine ─────────────────────────────────────────────
        onMomentumScrollEnd={handleScrollEnd}
        // Also handle when user stops dragging manually
        onScrollEndDrag={handleScrollEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  listContent: {
    // This allows the first and last items to be perfectly centered
    paddingRight: HORIZONTAL_PADDING, 
  },
  cardContainer: {
    marginRight: ITEM_SPACING,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    // Soft shadow for premium feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textDetails: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
});
