import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Pressable, useColorScheme, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useNewsArticle } from '@/hooks/useNews';
import { useStore } from '@/store/useStore';
import { formatDistanceToNow } from 'date-fns';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { data: article, isLoading } = useNewsArticle(id as string);
  const toggleBookmark = useStore((state) => state.toggleBookmark);

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({
        message: `${article.headline}\n\nRead more at: ${article.url}`,
        url: article.url,
        title: article.headline,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Article not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={() => toggleBookmark(article.id)} style={styles.iconButton}>
            <MaterialIcons 
              name={article.isBookmarked ? "bookmark" : "bookmark-border"} 
              size={24} 
              color={article.isBookmarked ? colors.primary : colors.text} 
            />
          </Pressable>
          <Pressable onPress={handleShare} style={styles.iconButton}>
            <MaterialIcons name="share" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />
        
        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category.name.toUpperCase()}</Text>
          </View>
          
          <Text style={[styles.headline, { color: colors.text }]}>{article.headline}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.sourceInfo}>
              <MaterialIcons name="business" size={16} color={colors.textSecondary} />
              <Text style={[styles.sourceName, { color: colors.textSecondary }]}>{article.source.name}</Text>
            </View>
            <View style={styles.dot} />
            <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>{timeAgo}</Text>
          </View>

          {/* Fake Article Content */}
          <Text style={[styles.bodyText, { color: colors.text }]}>
            This is a full article view. In a real application, the article body text would be fetched from the backend API.
            {'\n\n'}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.
            {'\n\n'}
            Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet. Nunc eu ullamcorper orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus.
          </Text>

          {/* Stats */}
          <View style={[styles.statsContainer, { borderTopColor: 'rgba(0,0,0,0.05)' }]}>
            <View style={styles.statItem}>
              <MaterialIcons name="visibility" size={20} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{article.stats.views} Views</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="thumb-up" size={20} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{article.stats.likes} Likes</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{article.stats.comments} Comments</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: 'rgba(101, 103, 241, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  categoryText: {
    color: '#6567f1',
    fontSize: 12,
    fontWeight: '700',
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9ca3af',
    marginHorizontal: 8,
  },
  timeAgo: {
    fontSize: 14,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
  },
});
