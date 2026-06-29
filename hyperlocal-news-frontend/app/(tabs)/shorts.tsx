import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ViewToken, useWindowDimensions, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image } from 'expo-image';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { useNewsShorts } from '@/hooks/useNews';
import { useQuery } from '@tanstack/react-query';
import { contentApi, Advertisement } from '@/services/api/content';
import { NewsArticle } from '@/services/api/news';
import { injectAdsIntoFeed, isAdvertisement } from '@/hooks/feedInjection';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type ShortFeedItem = NewsArticle | { type: 'ad'; data: Advertisement; position: number };

const ShortAdCard = React.memo(({ item, itemHeight }: { item: { type: 'ad'; data: Advertisement }; itemHeight: number }) => {
  return (
    <View style={[styles.itemContainer, { height: itemHeight, backgroundColor: '#000' }]}>
      <Image source={{ uri: item.data.image_url }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={[styles.bottomGradient, { paddingBottom: 40 }]}>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.data.title}</Text>
          {item.data.redirect_url && (
            <TouchableOpacity style={styles.adCtaButton}>
              <Text style={styles.adCtaText}>Learn More</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.adDisclaimer}>Sponsored</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const ShortVideoItem = React.memo(({ item, isActive, shouldLoad, itemHeight }: { item: NewsArticle; isActive: boolean; shouldLoad: boolean; itemHeight: number }) => {
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(shouldLoad && item.image_url ? { uri: item.image_url } : null, player => {
    player.loop = true;
  });

  React.useEffect(() => {
    if (isActive && shouldLoad) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, shouldLoad, player]);

  const handlePress = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={[styles.itemContainer, { height: itemHeight }]}>
      <VideoView
        player={player}
        style={styles.backgroundImage}
        contentFit="cover"
        nativeControls={false}
      />
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* Right Interaction Stack */}
      <View style={styles.rightStack}>
        <View style={styles.actionItem}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.source ? item.source.charAt(0) : 'U'}</Text>
            </View>
            <View style={styles.plusIconContainer}>
              <MaterialIcons name="add" size={12} color="white" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="heart" size={32} color="white" style={styles.iconShadow} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="chatbubble" size={30} color="white" style={styles.iconShadow} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <MaterialIcons name="reply" size={32} color="white" style={[styles.iconShadow, { transform: [{ scaleX: -1 }] }]} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <MaterialIcons name="more-horiz" size={32} color="white" style={styles.iconShadow} />
        </TouchableOpacity>
      </View>

      {/* Bottom Info Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.5, 1]}
        style={[styles.bottomGradient, { paddingBottom: 40 }]}
      >
        <View style={styles.infoContainer}>
          {/* User Info */}
          <View style={styles.userInfoRow}>
            <Text style={styles.username}>@{item.source || 'unknown'}</Text>
            {item.is_breaking && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.summary}
          </Text>

          {/* Hashtags */}
          <View style={styles.hashtagsRow}>
            {(item.category_names || []).map((tag, index) => (
              <Text key={index} style={styles.hashtag}>#{tag}</Text>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Progress Bar Placeholder */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '33.34%' }]} />
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.shouldLoad === nextProps.shouldLoad &&
    prevProps.itemHeight === nextProps.itemHeight &&
    prevProps.item.news_uid === nextProps.item.news_uid
  );
});

export default function ShortsScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'Following' | 'For You'>('Following');
  const [activeIndex, setActiveIndex] = useState(0);
  const [listHeight, setListHeight] = useState(height);

  const { data: rawShorts = [], isLoading: isLoadingShorts } = useNewsShorts();
  const { data: ads = [], isLoading: isLoadingAds } = useQuery({
    queryKey: ['active-ads', 'shorts'],
    queryFn: () => contentApi.getActiveAdvertisements(),
  });

  const shortsFeed = useMemo(() => {
    return injectAdsIntoFeed(rawShorts, ads, 5);
  }, [rawShorts, ads]);

  const isLoading = isLoadingShorts || isLoadingAds;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderVideoItem = useCallback(({ item, index }: { item: ShortFeedItem; index: number }) => {
    const shouldLoad = Math.abs(index - activeIndex) <= 1;

    if (isAdvertisement(item)) {
      return <ShortAdCard item={item} itemHeight={listHeight} />;
    }

    return (
      <ShortVideoItem
        item={item}
        isActive={index === activeIndex}
        shouldLoad={shouldLoad}
        itemHeight={listHeight}
      />
    );
  }, [activeIndex, listHeight]);

  const keyExtractor = useCallback((item: ShortFeedItem, index: number) => {
    if (isAdvertisement(item)) return `ad-${item.data.ad_id}-${index}`;
    return item.news_uid;
  }, []);

  if (isLoading) {
    return (
      <View style={styles.darkLoaderContainer}>
        <LoadingSpinner fullScreen text="Loading shorts..." colorScheme="dark" color="#4648D4" />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
      <FlatList
        data={shortsFeed}
        keyExtractor={keyExtractor}
        renderItem={renderVideoItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={listHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
      />

      {/* Top Bar Overlay (Static across list) */}
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'transparent']}
        style={[styles.topGradient, { paddingTop: insets.top + Spacing.sm }]}
        pointerEvents="box-none"
      >
        <View style={styles.topBar}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity onPress={() => setActiveTab('Following')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>Following</Text>
              {activeTab === 'Following' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab('For You')} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === 'For You' && styles.activeTabText]}>For You</Text>
              {activeTab === 'For You' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  itemContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingTop: Spacing.sm,
    height: 48,
  },
  menuLeftButton: {
    position: 'absolute',
    left: 0,
    paddingTop: Spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.bold,
    marginBottom: 4,
  },
  activeTabText: {
    color: '#FFF',
  },
  activeTabIndicator: {
    height: 2,
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 1,
  },
  rightStack: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 120,
    alignItems: 'center',
    gap: Spacing.xl,
    zIndex: 10,
  },
  actionItem: {
    alignItems: 'center',
  },
  iconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  actionText: {
    color: '#FFF',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.semiBold,
    marginTop: Spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarContainer: {
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4648D4',
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.bold,
  },
  plusIconContainer: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: '#4648D4',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
  },
  infoContainer: {
    width: '80%',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  username: {
    color: '#FFF',
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.bold,
    marginRight: Spacing.sm,
  },
  liveBadge: {
    backgroundColor: 'rgba(70, 72, 212, 0.2)',
    borderColor: 'rgba(70, 72, 212, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  liveText: {
    color: '#4648D4',
    fontSize: 10,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFF',
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.bold,
    lineHeight: 25,
    marginBottom: Spacing.xs,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  hashtagsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  hashtag: {
    color: '#4648D4',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.semiBold,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    paddingHorizontal: 4,
    zIndex: 100,
    elevation: 10,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4648D4',
  },
  darkLoaderContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adCtaButton: {
    marginTop: 12,
    backgroundColor: '#4648D4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
  },
  adCtaText: {
    color: '#FFF',
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.sm,
  },
  adDisclaimer: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: Typography.sizes.xs,
    marginTop: 8,
    fontFamily: Typography.fonts.medium,
  },
});