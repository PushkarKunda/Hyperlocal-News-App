import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { CreateArticleModal } from '@/components/CreateArticleModal';
import { useDeleteArticle, useCreateArticle } from '@/hooks/useNews';
import { useBookmarks } from '@/hooks/useEngagement';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usersApi } from '@/services/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfileScreen() {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user, logout, updateProfile, updateProfileLocal, checkPublisherEligibility, switchToPublisher } = useAuthStore();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // API Mutations
  const { mutate: createArticleMutate } = useCreateArticle();
  const { mutate: deleteArticleMutate } = useDeleteArticle();
  const { data: bookmarks = [] } = useBookmarks();

  // Profile Active Tab State
  const [activeTab, setActiveTab] = useState<'posts' | 'news' | 'saved' | 'verify'>('posts');
  // News Filter Pill State
  const [newsFilter, setNewsFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  // Sorting Mode State
  const [newsSort, setNewsSort] = useState<'date' | 'views' | 'likes'>('date');
  const [showSortModal, setShowSortModal] = useState(false);

  // Floating Actions / Create Modals
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showCreateArticleModal, setShowCreateArticleModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Post Modal Form State
  const [postCaption, setPostCaption] = useState('');
  const [postCoverImage, setPostCoverImage] = useState('');

  // Since there is no specific "My Articles" or "My Posts" endpoint provided, we initialize empty.
  // The Create functions will push to the server via APIs.
  const [posts, setPosts] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    total_news: 0,
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Verification Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.district || '');
  const [bio, setBio] = useState('');
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  const isPublisher = user?.isPublisher || false;

  const displayName = user?.name || 'User';

  // Auto-generate username handle dynamically based on user name
  const userHandle = '@' + displayName.toLowerCase().trim().replace(/\s+/g, '_');
  const userLocation = [user?.city_name || user?.district_name || user?.district, user?.state_name || user?.state]
    .filter(Boolean)
    .join(', ') || 'Set Location';

  const stats = {
    posts: String(dashboardStats.total_news ?? 0),
    likes: String(dashboardStats.total_likes ?? 0),
    comments: String(dashboardStats.total_comments ?? 0),
    level: 'Level 1',
    coins: '0',
    points: '0',
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      setIsLoadingProfile(true);
      try {
        const [profileResponse, dashboardResponse] = await Promise.all([
          usersApi.me(),
          usersApi.dashboard({ detailed: true, page: 1, limit: 20, recent_limit: 5 }),
        ]);

        if (!isMounted) return;

        updateProfileLocal({
          ...profileResponse,
          avatar: profileResponse.profile_picture ?? profileResponse.avatar ?? null,
          profile_picture: profileResponse.profile_picture ?? profileResponse.avatar ?? null,
        });

        setDashboardStats({
          total_news: dashboardResponse.stats?.total_posts ?? dashboardResponse.total_news ?? 0,
          total_views: dashboardResponse.total_views ?? 0,
          total_likes: dashboardResponse.stats?.total_likes ?? dashboardResponse.total_likes ?? 0,
          total_comments: dashboardResponse.stats?.total_comments ?? dashboardResponse.total_comments ?? 0,
          total_shares: dashboardResponse.total_shares ?? 0,
        });
      } catch (error: any) {
        console.error('[profile] Failed to load profile data:', error);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [updateProfileLocal]);

  const requestImagePermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraRollStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraRollStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera and library permissions to change profile pictures.');
        return false;
      }
      return true;
    }
    return true;
  };

  const uploadAndSaveAvatar = async (localUri: string) => {
    setIsUploadingAvatar(true);
    try {
      const { compressImage } = require('@/services/image');
      const compressed = await compressImage(localUri);
      const { uploadImageToSupabase } = require('@/services/supabase');
      const serverUrl = await uploadImageToSupabase(compressed.uri);

      await usersApi.updateMe({
        profile_picture: serverUrl,
      });

      updateProfileLocal({
        avatar: serverUrl ?? null,
        profile_picture: serverUrl ?? null,
      });

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile picture:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAndSaveAvatar(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handlePickLibrary = async () => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAndSaveAvatar(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open gallery.');
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option to update your photo:',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handlePickLibrary },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleApplyVerification = async () => {
    setIsSubmittingVerify(true);
    try {
      await switchToPublisher();
      Alert.alert('Congratulations!', 'You are now a Verified Publisher!');
      setActiveTab('posts');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Could not switch to publisher. Make sure your email and phone are verified.');
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  const handleCreateNewsArticle = (data: any) => {
    createArticleMutate({
      title: data.headline,
      summary: data.summary || '',
      category_id: parseInt(data.category, 10) ?? '',
      image_url: data.imageUrl || '',
    }, {
      onSuccess: () => {
        Alert.alert('Submitted!', 'Your news article has been submitted for review.');
      },
      onError: (err: any) => {
        Alert.alert('Error', err.message || 'Failed to publish article.');
      }
    });
  };

  const handlePickPostImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPostCoverImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = () => {
    if (!postCoverImage) {
      Alert.alert('Validation Error', 'Please select a photo for your post.');
      return;
    }
    if (!postCaption.trim()) {
      Alert.alert('Validation Error', 'Please write a caption.');
      return;
    }

    // Append to local state for immediate visibility, actual upload would need a postsApi
    const newPost = {
      id: 'p_' + Date.now(),
      imageUrl: postCoverImage,
      status: 'Pending',
      likes: 0,
      comments: 0,
      caption: postCaption.trim(),
    };

    setPosts([newPost, ...posts]);
    setPostCaption('');
    setPostCoverImage('');
    setShowCreatePostModal(false);
    Alert.alert('Success', 'Your post has been submitted!');
  };

  const handleDeleteArticle = (uid: string) => {
    Alert.alert('Delete Article', 'Are you sure you want to delete this article?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteArticleMutate(uid);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>

      {/* Symmetrical Svelte Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.push('/(tabs)/notifications')}
          activeOpacity={0.7}
        >
          <View>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>0</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Card Block with City background gradient */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={isDark ? ['#1e1e38', '#12122b'] : ['#e0ebff', '#ffffff']}
            style={styles.profileCardBg}
          >
            {/* User Info Container */}
            <View style={styles.profileInfoContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: user?.avatar || 'https://placehold.co/200x200/E2E8F0/E2E8F0?text=U' }}
                  style={styles.avatarImage}
                />
                <TouchableOpacity style={styles.avatarEditBadge} activeOpacity={0.8} onPress={handleAvatarPress}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.profileDetails}>
                <View style={styles.nameRow}>
                  <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
                  {isPublisher && (
                    <Ionicons name="checkmark-circle" size={18} color="#1E88E5" style={{ marginLeft: 6 }} />
                  )}
                </View>

                <View style={styles.handleRow}>
                  <Text style={[styles.profileHandle, { color: colors.textSecondary }]}>{userHandle}</Text>
                  {isPublisher ? (
                    <View style={styles.verifiedBadgeBadge}>
                      <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
                      <Text style={styles.verifiedBadgeBadgeText}>Publisher</Text>
                    </View>
                  ) : (
                    <View style={[styles.userBadge, { borderColor: colors.primary }]}>
                      <Text style={[styles.userBadgeText, { color: colors.primary }]}>User</Text>
                    </View>
                  )}
                </View>

                {/* Location & Join Date */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{userLocation}</Text>
                  </View>
                  <View style={[styles.metaItem, { marginLeft: 12 }]}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</Text>
                  </View>
                </View>

                {/* Followers */}
                <Text style={[styles.followersText, { color: colors.textSecondary }]}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>0</Text> Followers   |   <Text style={{ fontWeight: '700', color: colors.text }}>0</Text> Following
                </Text>
              </View>
            </View>

            {/* Profile Action Buttons */}
            <View style={styles.profileActionButtons}>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} activeOpacity={0.7} onPress={() => router.push('/(onboarding)/edit-profile')}>
                <Ionicons name="pencil" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} activeOpacity={0.7} onPress={() => router.push('/(tabs)/settings')}>
                <Ionicons name="settings-outline" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Settings</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Profile update banner */}
        {!isPublisher && (
          <View style={styles.verifyBannerWrapper}>
            <View style={[styles.verifyBanner, { backgroundColor: isDark ? '#1C1C35' : '#F0F5FF', borderColor: colors.border }]}>
              <View style={styles.verifyBannerIconContainer}>
                <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.verifyBannerContent}>
                <Text style={[styles.verifyBannerTitle, { color: colors.text }]}>Keep your profile up to date</Text>
                <Text style={[styles.verifyBannerSubtitle, { color: colors.textSecondary }]}>
                  Update your name, photo, and location anytime from the profile editor.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.verifyBannerButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => router.push('/(onboarding)/edit-profile')}
              >
                <Text style={styles.verifyBannerButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* My Stats Bento Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Stats</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(70, 72, 212, 0.1)' }]}>
              <Ionicons name="document-text-outline" size={20} color="#4648D4" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.posts}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="heart-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.likes}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Likes</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.comments}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Comments</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="trophy-outline" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.level}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Contributor</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <FontAwesome5 name="coins" size={18} color="#F59E0B" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.coins}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coins</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="star-outline" size={20} color="#F59E0B" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.points}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Points</Text>
            </View>
          </View>
        </View>

        {/* Navigation Tabs Header */}
        <View style={[styles.tabsHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'posts' && styles.tabButtonActive]} onPress={() => setActiveTab('posts')}>
            <Ionicons name="document-text" size={16} color={activeTab === 'posts' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'posts' ? colors.primary : colors.textSecondary }]}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'news' && styles.tabButtonActive]} onPress={() => setActiveTab('news')}>
            <Ionicons name="newspaper" size={16} color={activeTab === 'news' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'news' ? colors.primary : colors.textSecondary }]}>News</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, activeTab === 'saved' && styles.tabButtonActive]} onPress={() => setActiveTab('saved')}>
            <Ionicons name="bookmark" size={16} color={activeTab === 'saved' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'saved' ? colors.primary : colors.textSecondary }]}>Saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'verify' && styles.tabButtonActive]}
            onPress={() => {
              if (isPublisher) {
                setShowCreatePostModal(true);
              } else {
                setActiveTab('verify');
              }
            }}
          >
            {isPublisher ? (
              <View style={styles.plusTabCircle}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </View>
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={16} color={activeTab === 'verify' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabLabel, { color: activeTab === 'verify' ? colors.primary : colors.textSecondary }]}>Verify</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Contents */}
        {activeTab === 'posts' && (
          <View style={styles.postsGrid}>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>My Posts</Text>
            {posts.length === 0 ? (
              <View style={styles.emptyTabContent}>
                <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} style={{ marginBottom: 12 }} />
                <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No posts yet. Create your first post!</Text>
              </View>
            ) : (
              <View style={styles.postsWrapper}>
                {posts.map((post) => (
                  <View key={post.id} style={styles.postCard}>
                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                    <View style={[styles.postBadge, { backgroundColor: 'rgba(255, 152, 0, 0.9)' }]}>
                      <Text style={styles.postBadgeText}>{post.status}</Text>
                    </View>
                    <View style={styles.postOverlay}>
                      <View style={styles.overlayStat}>
                        <Ionicons name="heart" size={12} color="#FFFFFF" />
                        <Text style={styles.overlayStatText}>{post.likes}</Text>
                      </View>
                      <View style={[styles.overlayStat, { marginLeft: 8 }]}>
                        <Ionicons name="chatbubble" size={10} color="#FFFFFF" />
                        <Text style={styles.overlayStatText}>{post.comments}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'news' && (
          <View style={styles.newsSection}>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>News Overview</Text>

            {!isPublisher ? (
              <View style={[styles.unverifiedNewsPrompt, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="shield-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 8 }} />
                <Text style={[styles.promptTitle, { color: colors.text }]}>Publisher Verification Required</Text>
                <Text style={[styles.promptSubtitle, { color: colors.textSecondary }]}>
                  You need to be verified as a publisher to view news insights and manage news articles.
                </Text>
                <TouchableOpacity style={[styles.promptButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={() => setActiveTab('verify')}>
                  <Text style={styles.promptButtonText}>Get Verified</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyTabContent}>
                <Ionicons name="newspaper-outline" size={48} color={colors.textTertiary} style={{ marginBottom: 12 }} />
                <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Your published articles will appear here.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'saved' && (
          <View style={styles.postsGrid}>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>Saved Articles</Text>
            {bookmarks.length === 0 ? (
              <View style={styles.emptyTabContent}>
                <Ionicons name="bookmark-outline" size={48} color={colors.textTertiary} style={{ marginBottom: 12 }} />
                <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No saved bookmarks found.</Text>
              </View>
            ) : (
              <View style={styles.postsWrapper}>
                {bookmarks.filter(b => b.news).map((b) => (
                  <View key={b.news_uid} style={styles.postCard}>
                    <Image source={{ uri: b.news?.image_url || 'https://placehold.co/200x200/E2E8F0/E2E8F0?text=N' }} style={styles.postImage} />
                    <View style={styles.postOverlay}>
                      <View style={styles.overlayStat}>
                        <Ionicons name="heart" size={12} color="#FFFFFF" />
                        <Text style={styles.overlayStatText}>{b.news?.likes || 0}</Text>
                      </View>
                      <View style={[styles.overlayStat, { marginLeft: 8 }]}>
                        <Ionicons name="chatbubble" size={10} color="#FFFFFF" />
                        <Text style={styles.overlayStatText}>{b.news?.comments || 0}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'verify' && (
          <View style={styles.verifySection}>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>Apply for Publisher Verification</Text>

            <View style={[styles.verifyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.verifyStepHeader}>
                <Ionicons name="ribbon-outline" size={32} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={[styles.verifyStepTitle, { color: colors.text }]}>Join the HyperLocal Publisher Program</Text>
                <Text style={[styles.verifyStepSubtitle, { color: colors.textSecondary }]}>
                  Publish local reports directly to your community feed, gain followers, and earn badges.
                </Text>
              </View>

              <View style={styles.formWrapper}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name / Publisher Brand Name</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter full name or news brand"
                    placeholderTextColor={colors.textTertiary}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Target Reporting City / District</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g. Visakhapatnam, AP"
                    placeholderTextColor={colors.textTertiary}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Brief Bio / Credentials</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="Describe your background or brand value proposition..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    value={bio}
                    onChangeText={setBio}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitVerifyBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                  onPress={handleApplyVerification}
                  disabled={isSubmittingVerify}
                >
                  <Text style={styles.submitVerifyBtnText}>
                    {isSubmittingVerify ? 'Submitting Request...' : 'Submit Application'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <View style={styles.fabContainer}>
        {showFabMenu && (
          <View style={[styles.fabMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.fabMenuItem}
              activeOpacity={0.7}
              onPress={() => {
                setShowFabMenu(false);
                setShowCreatePostModal(true);
              }}
            >
              <Ionicons name="create-outline" size={16} color={colors.text} style={{ marginRight: 10 }} />
              <Text style={[styles.fabMenuText, { color: colors.text }]}>Create Post</Text>
            </TouchableOpacity>

            <View style={[styles.fabDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.fabMenuItem}
              activeOpacity={0.7}
              onPress={() => {
                setShowFabMenu(false);
                if (isPublisher) {
                  setShowCreateArticleModal(true);
                } else {
                  Alert.alert('Access Denied', 'Write News is only available for verified publishers. Please verify first.', [
                    { text: 'Apply Now', onPress: () => setActiveTab('verify') },
                    { text: 'Cancel', style: 'cancel' }
                  ]);
                }
              }}
            >
              <Ionicons name="document-text-outline" size={16} color={colors.text} style={{ marginRight: 10 }} />
              <Text style={[styles.fabMenuText, { color: colors.text }]}>Write News</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => setShowFabMenu(!showFabMenu)}
        >
          <Ionicons name={showFabMenu ? 'close' : 'add'} size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <CreateArticleModal
        isVisible={showCreateArticleModal}
        onClose={() => setShowCreateArticleModal(false)}
        onSubmit={handleCreateNewsArticle}
      />

      {/* Create Post Modal */}
      <Modal
        visible={showCreatePostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreatePostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowCreatePostModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Post</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalFormContent} showsVerticalScrollIndicator={false}>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Caption</Text>
                <TextInput
                  style={[styles.modalTextInput, styles.modalTextArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Share a story or what's on your mind..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  value={postCaption}
                  onChangeText={setPostCaption}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Cover Image</Text>
                {postCoverImage ? (
                  <View style={styles.postCoverContainer}>
                    <Image source={{ uri: postCoverImage }} style={styles.postCoverImg} />
                    <TouchableOpacity style={styles.postCoverRemoveBtn} onPress={() => setPostCoverImage('')}>
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.textInput, { alignItems: 'center', justifyContent: 'center', height: 100 }]}
                    onPress={handlePickPostImage}
                  >
                    <Ionicons name="image-outline" size={24} color={colors.textSecondary} style={{ marginBottom: 4 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Pick from Gallery</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.publishPostBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={handleCreatePost}
              >
                <Text style={styles.publishPostBtnText}>Publish Post</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontFamily: 'Poppins_700Bold',
  },
  headerBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  profileSection: {
    width: '100%',
  },
  profileCardBg: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  profileHandle: {
    fontSize: 13,
    fontWeight: '500',
  },
  userBadge: {
    marginLeft: 8,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  userBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  verifiedBadgeBadge: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedBadgeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    marginLeft: 4,
  },
  followersText: {
    fontSize: 12,
    marginTop: 8,
  },
  profileActionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  verifyBannerWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  verifyBannerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  verifyBannerContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  verifyBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  verifyBannerSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  verifyBannerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  verifyBannerButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  infoRowText: {
    fontSize: 11,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 44) / 2,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  tabsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginTop: 32,
    height: 48,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabButtonActive: {
    borderBottomColor: '#4648D4',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  plusTabCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4648D4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContentTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  postsGrid: {
    width: '100%',
  },
  postsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  postCard: {
    width: (screenWidth - 44) / 2,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  postBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayStatText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  newsSection: {
    width: '100%',
  },
  unverifiedNewsPrompt: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    marginTop: 8,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  promptButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  promptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyTabContent: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  verifySection: {
    width: '100%',
  },
  verifyCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  verifyStepHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyStepTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  verifyStepSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
  },
  formWrapper: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitVerifyBtn: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitVerifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'flex-end',
    gap: 8,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  fabMenu: {
    borderRadius: 12,
    borderWidth: 1,
    width: 140,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  fabMenuText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fabDivider: {
    height: 1,
  },
  formGroup: {
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: screenHeight * 0.85,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  modalFormContent: {
    padding: 20,
    gap: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalTextInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  postCoverContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  postCoverImg: {
    width: '100%',
    height: '100%',
  },
  postCoverRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishPostBtn: {
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  publishPostBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});