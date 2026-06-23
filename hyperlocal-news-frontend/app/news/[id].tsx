import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useArticleDetails } from '@/hooks/useApi';
import { formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Load article dynamically using React Query Hook
  const { data: article, isLoading } = useArticleDetails(id as string);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />
        <LoadingSpinner fullScreen text="Loading story details..." colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />
        <Text style={{ color: colors.text, fontFamily: 'Poppins_500Medium', fontSize: 16 }}>Article not found</Text>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          style={styles.backButton}
        >
          <Text style={{ color: colors.primary, fontFamily: 'Poppins_600SemiBold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Immersive Top Bar */}
      <View style={[styles.topBar, { top: Math.max(insets.top, 20) }]}>
        <TouchableOpacity 
          style={styles.circularButton} 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
        >
          <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={styles.blur}>
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.circularButton}>
            <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={styles.blur}>
              <Feather name="share" size={20} color="#FFF" />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.circularButton, { marginLeft: Spacing.sm }]}>
            <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={styles.blur}>
              <MaterialIcons name="bookmark-border" size={24} color="#FFF" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={true} scrollEventThrottle={16}>
        {/* Immersive Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={1000}
          />
          <LinearGradient
            colors={['transparent', colors.surface]}
            style={styles.heroGradient}
          />
        </View>

        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          {/* Metadata Row */}
          <View style={styles.categoryRow}>
            <Badge 
              label={article.category.name} 
              color={article.category.color || colors.primary} 
              variant="subtle"
              size="md"
            />
            <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.readTime, { color: colors.textTertiary }]}>
              {article.readTime}
            </Text>
          </View>

          {/* Premium Headline */}
          <Text style={[styles.headline, { color: colors.text }]}>
            {article.headline}
          </Text>

          {/* Refined Byline */}
          <View style={[styles.byline, { borderBottomColor: colors.divider }]}>
             <Image 
              source={{ uri: article.author?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }} 
              style={styles.authorAvatar} 
            />
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {article.author?.name || 'Editorial Team'}
              </Text>
              <Text style={[styles.publishedDate, { color: colors.textSecondary }]}>
                {article.source.name} • {formatDate(article.publishedAt)}
              </Text>
            </View>
            <TouchableOpacity style={[styles.followBtn, { borderColor: colors.primary }]}>
              <Text style={[styles.followBtnText, { color: colors.primary }]}>Follow</Text>
            </TouchableOpacity>
          </View>

          {/* Article Body */}
          <View style={styles.articleBody}>
            <Text style={[styles.leadIn, { color: colors.text }]}>
              {article.summary}
            </Text>
            
            <Text style={[styles.bodyText, { color: isDark ? '#E2E8F0' : '#334155' }]}>
              {article.content || "Experience the future of local storytelling. Our deep dive into this developing situation reveals critical insights for the community..."}
            </Text>

            <Text style={[styles.bodyText, { color: isDark ? '#E2E8F0' : '#334155' }]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </Text>

            <Text style={[styles.bodyText, { color: isDark ? '#E2E8F0' : '#334155' }]}>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </Text>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    zIndex: 100,
  },
  circularButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
  },
  heroContainer: {
    width: '100%',
    height: 420,
  },
  heroImage: {
    flex: 1,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
    backgroundColor: 'inherit',
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingTop: Spacing.xl,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: Spacing.sm,
  },
  readTime: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  headline: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 40,
    marginBottom: Spacing.xl,
    letterSpacing: -0.5,
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    marginBottom: Spacing.xl,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  publishedDate: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  followBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  articleBody: {
    marginTop: Spacing.sm,
  },
  leadIn: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 30,
    marginBottom: Spacing.lg,
    opacity: 0.9,
  },
  bodyText: {
    fontSize: 19,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 32,
    letterSpacing: 0.3,
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
});
