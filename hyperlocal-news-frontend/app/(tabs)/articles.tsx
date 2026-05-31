import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Share, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useArticleStore, ArticleItem } from '@/store/articleStore';
import MenuOptions from '@/components/MenuOptions';
import { useAuthStore } from '@/store/authStore';
import { StatusBar } from 'expo-status-bar';


const { height: screenHeight } = Dimensions.get('window');

export default function ArticlesScreen() {
  const colorScheme = useAppColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Zustand Store
  const { articles, addArticle, deleteArticle, resetArticles } = useArticleStore();
  const { user } = useAuthStore();
  const isPublisher = user?.isPublisher || false;
  const [showGatedView, setShowGatedView] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>({
    '1': { count: 1200, liked: false },
    '2': { count: 820, liked: false },
    '3': { count: 2100, liked: false },
  });
  const [bookmarksState, setBookmarksState] = useState<Record<string, boolean>>({});

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const handleLike = (id: string, initialLikesCount: number) => {
    setLikesState((prev) => {
      const item = prev[id] || { count: initialLikesCount, liked: false };
      return {
        ...prev,
        [id]: {
          liked: !item.liked,
          count: item.liked ? item.count - 1 : item.count + 1,
        },
      };
    });
  };

  const handleBookmark = (id: string) => {
    setBookmarksState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `Check out this article: ${title}\nShared via HyperLocal News App.`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const formatLikesCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  // Render Figma Empty State
  const renderEmptyState = () => {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        {/* Decorative Top Gradient Glow */}
        <LinearGradient
          colors={['rgba(70, 72, 212, 0.15)', 'rgba(70, 72, 212, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientGlow}
        />

        {/* Custom Figma Header */}
        <View style={[styles.headerEmpty, { paddingTop: insets.top }]}>
          <View style={styles.headerLeftEmpty}>
            <TouchableOpacity
              style={[styles.menuButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setIsMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitleEmpty, { color: colors.text }]}>My Articles</Text>
          </View>
          <View style={styles.headerRightEmpty}>
            <TouchableOpacity
              style={[styles.headerIconButton, { backgroundColor: colors.primaryLight }]}
              onPress={resetArticles}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconButton, { backgroundColor: colors.primaryLight, marginLeft: 8 }]}
              onPress={() => router.push('/(tabs)/settings?from=articles')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-sharp" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Illustration Area */}
        <View style={styles.mainContentEmpty}>
          <View style={styles.illustrationContainer}>
            {/* Outer Abstract Circle */}
            <View style={[styles.outerCircle, { backgroundColor: colors.primaryLight }]} />
            {/* Inner Glow Circle */}
            <View style={styles.innerCircle} />

            {/* Central News Document Outline */}
            <View style={styles.centerIconWrapper}>
              <Ionicons name="newspaper-outline" size={48} color={colors.primary} />
            </View>

            {/* Top-Right Badge: Rotated Plus Box */}
            <View style={[styles.badgeTopRight, { backgroundColor: colors.primary, transform: [{ rotate: '12deg' }] }]}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </View>

            {/* Bottom-Left Badge: White Circle with Document Outline */}
            <View style={[styles.badgeBottomLeft, styles.shadow]}>
              <Ionicons name="create-outline" size={14} color={colors.primary} />
            </View>
          </View>

          {/* Text Stack */}
          <View style={styles.textStackEmpty}>
            <Text style={[styles.titleTextEmpty, { color: colors.text }]}>No articles yet</Text>
            <Text style={[styles.descTextEmpty, { color: colors.textSecondary }]}>
              Start your reporting journey by{"\n"}creating your first local news{"\n"}article.
            </Text>
          </View>
        </View>

        {/* Bottom CTA Button Area */}
        <View style={[styles.bottomActionEmpty, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
          <TouchableOpacity
            style={[styles.ctaButtonEmpty, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (isPublisher) {
                router.push('/create-article');
              } else {
                setShowGatedView(true);
              }
            }}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.ctaButtonTextEmpty}>Create First Article</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (showGatedView && !isPublisher) {
    return (
      <View style={[styles.gatedContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        {/* Decorative Blurs */}
        <View style={styles.topRightBlur} />
        <View style={styles.bottomLeftBlur} />
        
        {/* Header */}
        <View style={[styles.gatedHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(12, insets.top) }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowGatedView(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitleText, { color: colors.text }]}>Publisher Access</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={[styles.gatedScroll, { paddingBottom: Math.max(24, insets.bottom + 24) }]} showsVerticalScrollIndicator={false}>
          <View style={styles.gatedContent}>
            <View style={[styles.gatedIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
            </View>

            <Text style={[styles.gatedTitle, { color: colors.text }]}>Verify your Gmail</Text>
            <Text style={[styles.gatedSubtitle, { color: colors.textSecondary }]}>
              To write articles and host events in your local community, you must verify your Gmail address to establish your publisher identity.
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitleText, { color: colors.text }]}>Write Local Stories</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Share news, updates, and stories impacting your neighborhood.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitleText, { color: colors.text }]}>Host Local Events</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Organize and promote nearby community meetups & activities.</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.gatedButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(onboarding)/profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.gatedButtonText}>Verify Gmail Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gatedSecondaryButton}
              onPress={() => setShowGatedView(false)}
              hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
              activeOpacity={0.7}
            >
              <Text style={[styles.gatedSecondaryButtonText, { color: colors.textSecondary }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (articles.length === 0) {
    return (
      <>
        {renderEmptyState()}
        <MenuOptions 
          isVisible={isMenuVisible} 
          onClose={() => setIsMenuVisible(false)} 
        />
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Feed Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setIsMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Articles</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: colors.primaryLight, marginRight: 8 }]}
            onPress={resetArticles}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: colors.primaryLight }]}
            onPress={() => router.push('/(tabs)/settings?from=articles')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-sharp" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Articles List */}
      <FlatList
        data={articles}
        keyExtractor={(item: ArticleItem) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderItem={({ item, index }: { item: ArticleItem; index: number }) => {
          const initialLikesCount = parseInt(item.likes.replace(/k/, '000').replace(/[^\d]/g, '')) || 0;
          const likeData = likesState[item.id] || { count: initialLikesCount, liked: false };
          const isBookmarked = bookmarksState[item.id] || false;

          // Render vertical card for first/major article, horizontal card for others
          const isFirstItem = index === 0;

          if (!isFirstItem) {
            return (
              <TouchableOpacity
                style={[styles.horizontalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.9}
                onPress={() => router.push(`/news/${item.id}` as any)}
              >
                <View style={styles.horizontalLeft}>
                  <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{item.category}</Text>
                  </View>
                  <Text style={[styles.horizontalHeadline, { color: colors.text }]} numberOfLines={2}>
                    {item.headline}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.sourceName}
                    </Text>
                    <View style={styles.dot} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.publishedAt}</Text>
                  </View>

                  {/* Actions Bar inside Horizontal Card */}
                  <View style={styles.miniActions}>
                    <TouchableOpacity style={styles.miniActionBtn} onPress={() => handleLike(item.id, initialLikesCount)}>
                      <Ionicons
                        name={likeData.liked ? "heart" : "heart-outline"}
                        size={16}
                        color={likeData.liked ? '#E53E3E' : colors.textSecondary}
                      />
                      <Text style={[styles.miniActionText, { color: colors.textSecondary }]}>
                        {formatLikesCount(likeData.count)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.miniActionBtn} onPress={() => handleBookmark(item.id)}>
                      <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={16}
                        color={isBookmarked ? colors.primary : colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.miniActionBtn} onPress={() => deleteArticle(item.id)}>
                      <Ionicons name="trash-outline" size={16} color="#BA1A1A" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Image source={{ uri: item.imageUrl }} style={styles.horizontalImage} />
              </TouchableOpacity>
            );
          }

          // Full Vertical Card
          return (
            <TouchableOpacity
              style={[styles.verticalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.9}
              onPress={() => router.push(`/news/${item.id}` as any)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.verticalImage} />
              <View style={styles.verticalContent}>

                {/* Meta row: Tag, time, read duration */}
                <View style={styles.verticalMetaRow}>
                  <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{item.category}</Text>
                  </View>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.publishedAt}</Text>
                  <View style={styles.dot} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.readingTime}</Text>
                </View>

                {/* Headline */}
                <Text style={[styles.verticalHeadline, { color: colors.text }]} numberOfLines={3}>
                  {item.headline}
                </Text>

                {/* Summary */}
                <Text style={[styles.verticalSummary, { color: colors.textSecondary }]} numberOfLines={3}>
                  {item.summary}
                </Text>

                {/* Publisher & View details */}
                <View style={styles.publisherRow}>
                  <Text style={[styles.publisherName, { color: colors.text }]}>
                    source: <Text style={{ fontWeight: '700' }}>{item.sourceName}</Text>
                  </Text>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.views}</Text>
                </View>

                {/* Action button row */}
                <View style={[styles.actionRow, { borderTopColor: colors.divider }]}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleLike(item.id, initialLikesCount)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={likeData.liked ? "heart" : "heart-outline"}
                      size={20}
                      color={likeData.liked ? '#E53E3E' : colors.textSecondary}
                    />
                    <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                      {formatLikesCount(likeData.count)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleBookmark(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isBookmarked ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color={isBookmarked ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleShare(item.headline)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => deleteArticle(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color="#BA1A1A" />
                    <Text style={[styles.actionBtnText, { color: '#BA1A1A' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          if (isPublisher) {
            router.push('/create-article');
          } else {
            setShowGatedView(true);
          }
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Reusable Menu Drawer Overlay Component */}
      <MenuOptions 
        isVisible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)} 
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeftEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  verticalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  verticalContent: {
    padding: 16,
    gap: 12,
  },
  verticalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },
  verticalHeadline: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 28,
  },
  verticalSummary: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    lineHeight: 20,
  },
  publisherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publisherName: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  horizontalCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  horizontalLeft: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 6,
  },
  horizontalHeadline: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  horizontalImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  miniActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniActionText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  // Figma Empty State Styles
  emptyContainer: {
    flex: 1,
    position: 'relative',
  },
  gradientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 450,
  },
  headerEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 64 + 40, // Account for visual padding & layout
    zIndex: 10,
  },
  headerTitleEmpty: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  headerRightEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 72, 212, 0.15)',
  },
  mainContentEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustrationContainer: {
    width: 192,
    height: 192,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  outerCircle: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
  },
  innerCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(70, 72, 212, 0.08)',
  },
  centerIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeBottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textStackEmpty: {
    alignItems: 'center',
    gap: 12,
  },
  titleTextEmpty: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  descTextEmpty: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomActionEmpty: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  ctaButtonEmpty: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonTextEmpty: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  // Gated UI Styles
  gatedContainer: {
    flex: 1,
  },
  gatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  gatedHeaderTitleText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  gatedScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  gatedContent: {
    alignItems: 'center',
    gap: 16,
  },
  gatedIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gatedTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  gatedSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    width: '100%',
    gap: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
    gap: 4,
  },
  featureTitleText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
  },
  gatedButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  gatedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  gatedSecondaryButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gatedSecondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});
