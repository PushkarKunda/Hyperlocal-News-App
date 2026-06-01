import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { NewsArticle } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

interface NewsCardProps {
  article: NewsArticle;
  onPress?: () => void;
  onBookmarkPress?: () => void;
  onSharePress?: () => void;
}

export function NewsCard({ article, onPress, onBookmarkPress, onSharePress }: NewsCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  return (
    <Pressable style={[styles.card, { backgroundColor: colors.surface }]} onPress={onPress}>
      <Image source={{ uri: article.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.category, { color: article.category.color || colors.primary }]}>
            {article.category.name}
          </Text>
          <Text style={[styles.time, { color: colors.textTertiary }]}>{formattedDate}</Text>
        </View>
        <Text style={[styles.headline, { color: colors.text }]} numberOfLines={2}>
          {article.headline}
        </Text>
        <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
          {article.summary}
        </Text>
        
        <View style={styles.footerRow}>
          <View style={styles.sourceContainer}>
            <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
              {article.source.name}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={onSharePress} style={styles.actionButton}>
              <MaterialIcons name="share" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={onBookmarkPress} style={styles.actionButton}>
              <MaterialIcons
                name={article.isBookmarked ? "bookmark" : "bookmark-border"}
                size={20}
                color={article.isBookmarked ? colors.primary : colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 12,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 12,
  },
});
