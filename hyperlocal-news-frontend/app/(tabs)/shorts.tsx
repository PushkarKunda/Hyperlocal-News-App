import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, Dimensions, FlatList,
  Image, Pressable, Share, ActivityIndicator, ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useNews } from '@/hooks/useNews';
import { useStore } from '@/store/useStore';
import { NewsArticle } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT;

function ShortCard({ article, isActive }: { article: NewsArticle; isActive: boolean }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const toggleBookmark = useStore((s) => s.toggleBookmark);

  const handleShare = async () => {
    try {
      await Share.share({ message: `${article.headline}\n\nRead more at: ${article.url}`, title: article.headline });
    } catch {}
  };

  return (
    <View style={[styles.card, { height: CARD_HEIGHT }]}>
      <Image source={{ uri: article.imageUrl }} style={styles.cardImage} />
      {/* Dark gradient overlay */}
      <View style={styles.overlay} />

      {/* Category chip */}
      <View style={[styles.categoryChip, { backgroundColor: article.category.color || '#6567f1' }]}>
        <Text style={styles.categoryChipText}>{article.category.name}</Text>
      </View>

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        <View style={styles.textArea}>
          <Text style={styles.source}>{article.source.name}</Text>
          <Text style={styles.headline} numberOfLines={3}>{article.headline}</Text>
          <Text style={styles.summary} numberOfLines={3}>{article.summary}</Text>

          <Pressable
            style={styles.readMoreBtn}
            onPress={() => router.push(`/news/${article.id}` as any)}
          >
            <Text style={styles.readMoreText}>Read full article</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={() => toggleBookmark(article.id)}>
            <MaterialIcons
              name={article.isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={28}
              color={article.isBookmarked ? '#6567f1' : '#fff'}
            />
            <Text style={styles.actionLabel}>Save</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <MaterialIcons name="share" size={28} color="#fff" />
            <Text style={styles.actionLabel}>Share</Text>
          </Pressable>
          <View style={styles.actionBtn}>
            <MaterialIcons name="visibility" size={28} color="rgba(255,255,255,0.7)" />
            <Text style={styles.actionLabel}>{article.stats.views}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ShortsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { data: news, isLoading } = useNews();
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: '#000' }]}>
        <ActivityIndicator size="large" color="#6567f1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ShortCard article={item} isActive={index === activeIndex} />
        )}
        pagingEnabled
        snapToInterval={CARD_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Swipe hint */}
      <SafeAreaView style={styles.topHint} edges={['top']}>
        <View style={styles.hintRow}>
          <MaterialIcons name="play-circle-outline" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.hintText}>Swipe up for next story</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },

  card: {
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  categoryChip: {
    position: 'absolute',
    top: 60,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 100,
  },
  textArea: {
    flex: 1,
    marginRight: 16,
  },
  source: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headline: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 8,
  },
  summary: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  readMoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  topHint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  hintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
});