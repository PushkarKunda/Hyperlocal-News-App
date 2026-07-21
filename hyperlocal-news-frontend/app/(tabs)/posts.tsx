import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { usePublicPostsFeed, useCreatePost } from '@/hooks/usePosts';
import { useBookmarks } from '@/hooks/useEngagement';
import { PostCard } from '@/components/PostCard';
import { PostCommentsModal } from '@/components/PostCommentsModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useTabBarStore } from '@/store/tabBarStore';

export default function PostsScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { height: screenHeight } = useWindowDimensions();
  const setTabBarVisible = useTabBarStore((s) => s.setVisible);

  // ─── State & Animation ─────────────────────────────────────────────────
  const [scrollHeight, setScrollHeight] = useState(screenHeight);
  const [selectedPostUid, setSelectedPostUid] = useState<string | null>(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const headerAnim = useRef(new Animated.Value(0)).current;
  const isHeaderVisible = useRef(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showHeader = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    isHeaderVisible.current = true;
    setTabBarVisible(true);
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    hideTimerRef.current = setTimeout(() => hideHeader(), 4000);
  }, [setTabBarVisible, headerAnim]);

  const hideHeader = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    isHeaderVisible.current = false;
    setTabBarVisible(false);
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [setTabBarVisible, headerAnim]);

  const toggleHeader = useCallback(() => {
    if (isHeaderVisible.current) {
      hideHeader();
    } else {
      showHeader();
    }
  }, [hideHeader, showHeader]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      hideHeader();
    });
    return unsub;
  }, [navigation, hideHeader]);

  const onTouchStart = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    touchStartRef.current = { x: pageX, y: pageY, time: Date.now() };
  };

  const onTouchEnd = (e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    const dx = Math.abs(pageX - touchStartRef.current.x);
    const dy = Math.abs(pageY - touchStartRef.current.y);
    const dt = Date.now() - touchStartRef.current.time;
    if (dx < 10 && dy < 10 && dt < 300) {
      toggleHeader();
    }
  };

  // ─── Data ──────────────────────────────────────────────────────────────
  const { data: feedData, isLoading, isRefetching, refetch } = usePublicPostsFeed(20);
  const { data: postBookmarks = [] } = useBookmarks('post');
  const { mutate: createPost, isPending: isCreating } = useCreatePost();

  const bookmarkedPostUids = new Set(
    postBookmarks.map((b: any) => b.content_uid || b.post_uid)
  );

  const posts = feedData?.posts || [];

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleOpenComments = useCallback((postUid: string) => {
    setSelectedPostUid(postUid);
    setIsCommentsVisible(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setIsCommentsVisible(false);
    setSelectedPostUid(null);
  }, []);

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !newPostImageUrl.trim()) {
      Alert.alert('Empty Post', 'Please write something or provide an image link.');
      return;
    }

    createPost(
      {
        content: newPostContent.trim() || null,
        image_url: newPostImageUrl.trim() || null,
      },
      {
        onSuccess: () => {
          setNewPostContent('');
          setNewPostImageUrl('');
          setIsCreateModalOpen(false);
          Alert.alert('Success', 'Your post has been published!');
        },
        onError: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to create post. Please try again.');
        },
      }
    );
  };

  const renderPostItem = useCallback(
    ({ item }: { item: any }) => (
      <PostCard
        post={item}
        onOpenComments={handleOpenComments}
        isBookmarked={bookmarkedPostUids.has(item.post_uid)}
        containerHeight={scrollHeight}
        onToggleHeaderFooter={toggleHeader}
      />
    ),
    [handleOpenComments, bookmarkedPostUids, scrollHeight, toggleHeader]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: scrollHeight,
      offset: scrollHeight * index,
      index,
    }),
    [scrollHeight]
  );

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 0],
  });

  const headerOpacity = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Animated Header Overlay */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Community Posts</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Share updates and engage with local discussions
          </Text>
        </View>
      </Animated.View>

      {/* Main Posts Feed */}
      <View
        style={styles.feedWrapper}
        onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner fullScreen text="Loading community posts..." colorScheme={colorScheme ?? 'light'} />
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={56} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Posts Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Be the first to share something with your community!
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => setIsCreateModalOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyActionBtnText}>Create a Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.post_uid || String(item.id)}
            renderItem={renderPostItem}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={scrollHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            bounces={false}
            getItemLayout={getItemLayout}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={5}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsCreateModalOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="create-outline" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Comments Modal */}
      <PostCommentsModal
        visible={isCommentsVisible}
        onClose={handleCloseComments}
        postUid={selectedPostUid}
      />

      {/* Create Post Modal */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsCreateModalOpen(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Community Post</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[
                  styles.postTextInput,
                  { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
                ]}
                placeholder="What's happening in your area?"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={newPostContent}
                onChangeText={setNewPostContent}
              />

              <TextInput
                style={[
                  styles.imageInput,
                  { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
                ]}
                placeholder="Optional image URL (https://...)"
                placeholderTextColor={colors.textTertiary}
                value={newPostImageUrl}
                onChangeText={setNewPostImageUrl}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsCreateModalOpen(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: colors.primary },
                  isCreating && styles.disabledSubmit,
                ]}
                onPress={handleCreatePost}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Publish Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 5,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  feedWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  emptyActionBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    marginVertical: 16,
  },
  postTextInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    minHeight: 120,
    marginBottom: 12,
  },
  imageInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledSubmit: {
    opacity: 0.6,
  },
});
