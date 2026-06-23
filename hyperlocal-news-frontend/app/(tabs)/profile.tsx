import React, { useState } from 'react';
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
import MenuOptions from '@/components/MenuOptions';
import { CreateArticleModal } from '@/components/CreateArticleModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Cover / Preset themes for quick post selection
const POST_PRESETS = [
  { id: '1', label: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500' },
  { id: '2', label: 'Harbor', url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500' },
  { id: '3', label: 'Temple', url: 'https://images.unsplash.com/photo-1542397284385-6010176424b2?w=500' },
  { id: '4', label: 'Sunset', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500' },
  { id: '5', label: 'Night View', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=500' },
  { id: '6', label: 'Forest Road', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500' },
];

const INITIAL_POSTS: any[] = [];
const INITIAL_NEWS: any[] = [];

export default function ProfileScreen() {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user, logout, updateProfile } = useAuthStore();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

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

  // Mock Data States
  const [posts, setPosts] = useState<any[]>(INITIAL_POSTS);
  const [newsList, setNewsList] = useState<any[]>(INITIAL_NEWS);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  // Verification Form State
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  const isPublisher = user?.isPublisher || false;
  const isGuest = user?.isGuest;

  // Custom simulation variables based on verification status
  const displayName = user?.name || (isGuest ? 'Guest User' : 'User');
  
  // Auto-generate username handle dynamically based on user name
  const userHandle = '@' + displayName.toLowerCase().trim().replace(/\s+/g, '_');
  const userLocation = user?.district ? `${user.district}, ${user.state || ''}`.trim() : 'Location not set';
  
  const totalLikes = newsList.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalComments = newsList.reduce((acc, curr) => acc + (curr.comments || 0), 0);

  // Dynamic Stats
  const stats = {
    posts: String(newsList.length),
    likes: String(totalLikes),
    comments: String(totalComments),
    level: 'Level 1',
    coins: '0',
    points: '0',
  };

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
        updateProfile(displayName, result.assets[0].uri, user?.email || undefined, user?.phoneNumber, isPublisher);
        Alert.alert('Success', 'Profile picture updated successfully!');
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
        updateProfile(displayName, result.assets[0].uri, user?.email || undefined, user?.phoneNumber, isPublisher);
        Alert.alert('Success', 'Profile picture updated successfully!');
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

  const handleVerifyEmail = () => {
    updateProfile(
      user?.name || 'User',
      user?.avatar,
      user?.email || undefined,
      user?.phoneNumber,
      isPublisher,
      true
    );
    Alert.alert('Email Verified', 'Your email address has been successfully verified.');
  };

  const handleApplyVerification = () => {
    // Sets isPublisher directly in the state to demonstrate verification approval
    setIsSubmittingVerify(true);
    setTimeout(() => {
      updateProfile(
        user?.name || 'User',
        user?.avatar || undefined,
        user?.email || undefined,
        user?.phoneNumber || undefined,
        true,
        true
      );
      setIsSubmittingVerify(false);
      setActiveTab('posts');
      Alert.alert('Congratulations!', 'Your verification request has been approved instantly for demo purposes. You are now a Verified Publisher!');
    }, 1200);
  };

  const handleCreateNewsArticle = (data: {
    headline: string;
    summary: string;
    category: string;
    sourceName: string;
    readingTime: string;
    imageUrl: string;
  }) => {
    const newArticle = {
      id: 'n_' + Date.now(),
      title: data.headline,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      views: '0 Views',
      likes: 0,
      comments: 0,
      shares: 0,
      status: 'Approved',
      imageUrl: data.imageUrl,
    };
    setNewsList([newArticle, ...newsList]);
    Alert.alert('Published!', 'Your news article has been published and is now live under Approved news.');
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

    const newPost = {
      id: 'p_' + Date.now(),
      imageUrl: postCoverImage,
      status: 'Approved',
      likes: 0,
      comments: 0,
      caption: postCaption.trim(),
    };

    setPosts([newPost, ...posts]);
    setPostCaption('');
    setPostCoverImage('');
    setShowCreatePostModal(false);
    Alert.alert('Success', 'Your post has been published successfully!');
  };

  const handleDeleteArticle = (id: string) => {
    Alert.alert('Delete Article', 'Are you sure you want to delete this article?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setNewsList(newsList.filter(item => item.id !== id));
        },
      },
    ]);
  };

  // Filter & Sort newsList dynamically
  const getFilteredAndSortedNews = () => {
    let list = [...newsList];
    if (newsFilter !== 'all') {
      list = list.filter(item => item.status.toLowerCase() === newsFilter);
    }
    // Apply sorting
    if (newsSort === 'views') {
      list.sort((a, b) => {
        const valA = parseInt(a.views?.replace(/,/g, '') || '0');
        const valB = parseInt(b.views?.replace(/,/g, '') || '0');
        return valB - valA;
      });
    } else if (newsSort === 'likes') {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (newsSort === 'date') {
      // standard sort by ID / custom date logic
      list.sort((a, b) => b.id.localeCompare(a.id));
    }
    return list;
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
              <Text style={styles.headerBadgeText}>3</Text>
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
                  source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }}
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
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>Joined Jan 2024</Text>
                  </View>
                </View>

                {/* Followers */}
                <Text style={[styles.followersText, { color: colors.textSecondary }]}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{isPublisher ? '1,234' : '234'}</Text> Followers   |   <Text style={{ fontWeight: '700', color: colors.text }}>{isPublisher ? '567' : '178'}</Text> Following
                </Text>
              </View>
            </View>

            {/* Profile Action Buttons */}
            <View style={styles.profileActionButtons}>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} activeOpacity={0.7} onPress={() => router.push('/(onboarding)/profile')}>
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

        {/* Want to Publish news banner? (Only if not verified publisher) */}
        {!isPublisher && (
          <View style={styles.verifyBannerWrapper}>
            {!user?.email_verified ? (
              // Email Verification Banner
              <View style={[styles.verifyBanner, { backgroundColor: isDark ? '#2D1F1F' : '#FFF0F0', borderColor: '#FFCDD2' }]}>
                <View style={[styles.verifyBannerIconContainer, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
                  <Ionicons name="mail-unread" size={24} color="#F44336" />
                </View>
                <View style={styles.verifyBannerContent}>
                  <Text style={[styles.verifyBannerTitle, { color: colors.text }]}>Verify Your Email Address</Text>
                  <Text style={[styles.verifyBannerSubtitle, { color: colors.textSecondary }]}>
                    Please verify your email address to unlock publisher options and secure your account.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.verifyBannerButton, { backgroundColor: '#F44336' }]}
                  activeOpacity={0.8}
                  onPress={handleVerifyEmail}
                >
                  <Text style={styles.verifyBannerButtonText}>Verify Email</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Publisher Verification Banner
              <View style={[styles.verifyBanner, { backgroundColor: isDark ? '#1C1C35' : '#F0F5FF', borderColor: colors.border }]}>
                <View style={styles.verifyBannerIconContainer}>
                  <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                </View>
                <View style={styles.verifyBannerContent}>
                  <Text style={[styles.verifyBannerTitle, { color: colors.text }]}>Want to Publish News?</Text>
                  <Text style={[styles.verifyBannerSubtitle, { color: colors.textSecondary }]}>
                    Get verified as a Publisher to write and publish news for your city.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.verifyBannerButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('verify')}
                >
                  <Text style={styles.verifyBannerButtonText}>Apply for Verification</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.infoRowText, { color: colors.textSecondary }]}>
                {!user?.email_verified 
                  ? 'Email verification is required before applying for publisher verification.' 
                  : 'News Publishing is available only for verified publishers. Learn More'
                }
              </Text>
            </View>
          </View>
        )}

        {/* My Stats Bento Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Stats</Text>
        </View>

        <View style={styles.statsGrid}>
          {/* Card 1: Posts */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(70, 72, 212, 0.1)' }]}>
              <Ionicons name="document-text-outline" size={20} color="#4648D4" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.posts}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
            </View>
          </View>

          {/* Card 2: Likes */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="heart-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.likes}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Likes</Text>
            </View>
          </View>

          {/* Card 3: Comments */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.comments}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Comments</Text>
            </View>
          </View>

          {/* Card 4: Contributor Level */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="trophy-outline" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.level}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Contributor</Text>
            </View>
          </View>

          {/* Card 5: Coins */}
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <FontAwesome5 name="coins" size={18} color="#F59E0B" />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.coins}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coins</Text>
            </View>
          </View>

          {/* Card 6: Points */}
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

        {/* News Articles Status (Verified Publisher Only) */}
        {isPublisher && (
          <View style={styles.newsStatsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>News Articles Status</Text>
            </View>
            <View style={styles.newsStatsWrapper}>
              <View style={styles.newsStatsGrid1}>
                {/* Approved */}
                <View style={[styles.newsStatBox, { backgroundColor: colors.surface }]}>
                  <View style={[styles.newsStatIndicator, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.newsStatVal, { color: colors.text }]}>18</Text>
                  <Text style={[styles.newsStatLbl, { color: colors.textSecondary }]}>Approved</Text>
                </View>

                {/* Pending */}
                <View style={[styles.newsStatBox, { backgroundColor: colors.surface }]}>
                  <View style={[styles.newsStatIndicator, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.newsStatVal, { color: colors.text }]}>5</Text>
                  <Text style={[styles.newsStatLbl, { color: colors.textSecondary }]}>Pending</Text>
                </View>

                {/* Rejected */}
                <View style={[styles.newsStatBox, { backgroundColor: colors.surface }]}>
                  <View style={[styles.newsStatIndicator, { backgroundColor: '#F44336' }]}>
                    <Ionicons name="close-sharp" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.newsStatVal, { color: colors.text }]}>2</Text>
                  <Text style={[styles.newsStatLbl, { color: colors.textSecondary }]}>Rejected</Text>
                </View>
              </View>

              <View style={styles.newsStatsGrid2}>
                <View style={[styles.newsStatRowBox, { backgroundColor: colors.surface }]}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                  <View>
                    <Text style={[styles.newsStatVal, { color: colors.text }]}>25</Text>
                    <Text style={[styles.newsStatLbl, { color: colors.textSecondary }]}>Total News</Text>
                  </View>
                </View>

                <View style={[styles.newsStatRowBox, { backgroundColor: colors.surface }]}>
                  <Ionicons name="trending-up-outline" size={20} color="#8B5CF6" style={{ marginRight: 10 }} />
                  <View>
                    <Text style={[styles.newsStatVal, { color: colors.text }]}>72%</Text>
                    <Text style={[styles.newsStatLbl, { color: colors.textSecondary }]}>Approval Rate</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Navigation Tabs Header */}
        <View style={[styles.tabsHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'posts' && styles.tabButtonActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons name="document-text" size={16} color={activeTab === 'posts' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'posts' ? colors.primary : colors.textSecondary }]}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'news' && styles.tabButtonActive]}
            onPress={() => setActiveTab('news')}
          >
            <Ionicons name="newspaper" size={16} color={activeTab === 'news' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'news' ? colors.primary : colors.textSecondary }]}>News</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'saved' && styles.tabButtonActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons name="bookmark" size={16} color={activeTab === 'saved' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'saved' ? colors.primary : colors.textSecondary }]}>Saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'verify' && styles.tabButtonActive]}
            onPress={() => {
              if (isPublisher) {
                // Verified user "+" Tab Shortcut opens post creation directly!
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
            <View style={styles.postsWrapper}>
              {posts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                  
                  {/* Status Badge */}
                  <View style={[
                    styles.postBadge,
                    {
                      backgroundColor:
                        post.status === 'Approved' ? 'rgba(76, 175, 80, 0.9)' :
                        post.status === 'Pending' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(244, 67, 54, 0.9)'
                    }
                  ]}>
                    <Text style={styles.postBadgeText}>{post.status}</Text>
                  </View>

                  {/* Likes / Comments overlay */}
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
            <TouchableOpacity style={[styles.loadMoreButton, { borderColor: colors.border }]} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.loadMoreText, { color: colors.primary }]}>Load More</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'news' && (
          <View style={styles.newsSection}>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>News Overview</Text>

            {/* News Overview Mini Stats Section for Unverified */}
            {!isPublisher && (
              <View style={[styles.unverifiedNewsPrompt, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="shield-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 8 }} />
                <Text style={[styles.promptTitle, { color: colors.text }]}>Publisher Verification Required</Text>
                <Text style={[styles.promptSubtitle, { color: colors.textSecondary }]}>
                  You need to be verified as a publisher to view news insights and manage news articles.
                </Text>
                <TouchableOpacity
                  style={[styles.promptButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('verify')}
                >
                  <Text style={styles.promptButtonText}>Get Verified</Text>
                </TouchableOpacity>
              </View>
            )}

            {isPublisher && (
              <>
                {/* Horizontal filter pills */}
                <View style={{ height: 50 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity
                      style={[styles.filterPill, newsFilter === 'all' && [styles.filterPillActive, { backgroundColor: colors.primary }]]}
                      onPress={() => setNewsFilter('all')}
                    >
                      <Text style={[styles.filterLabel, newsFilter === 'all' && styles.filterLabelActive]}>All ({newsList.length})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterPill, newsFilter === 'approved' && [styles.filterPillActive, { backgroundColor: '#4CAF50' }]]}
                      onPress={() => setNewsFilter('approved')}
                    >
                      <Text style={[styles.filterLabel, newsFilter === 'approved' && styles.filterLabelActive]}>
                        Approved ({newsList.filter((item) => item.status === 'Approved').length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterPill, newsFilter === 'pending' && [styles.filterPillActive, { backgroundColor: '#FF9800' }]]}
                      onPress={() => setNewsFilter('pending')}
                    >
                      <Text style={[styles.filterLabel, newsFilter === 'pending' && styles.filterLabelActive]}>
                        Pending ({newsList.filter((item) => item.status === 'Pending').length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterPill, newsFilter === 'rejected' && [styles.filterPillActive, { backgroundColor: '#F44336' }]]}
                      onPress={() => setNewsFilter('rejected')}
                    >
                      <Text style={[styles.filterLabel, newsFilter === 'rejected' && styles.filterLabelActive]}>
                        Rejected ({newsList.filter((item) => item.status === 'Rejected').length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.filterPill, { borderColor: colors.border }]} 
                      activeOpacity={0.7}
                      onPress={() => setShowSortModal(true)}
                    >
                      <Ionicons name="filter-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.filterLabel, { marginLeft: 4, color: colors.textSecondary }]}>
                        Filter ({newsSort === 'date' ? 'Date' : newsSort === 'views' ? 'Views' : 'Likes'})
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* News Article List */}
                <View style={styles.articleList}>
                  {(() => {
                    const sortedNews = getFilteredAndSortedNews();
                    
                    const renderArticleCard = (item: any) => (
                      <View key={item.id} style={[styles.articleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Image source={{ uri: item.imageUrl }} style={styles.articleImage} />
                        
                        <View style={styles.articleDetails}>
                          <View style={styles.articleHeaderRow}>
                            {/* Status badge */}
                            <View style={[
                              styles.statusIndicatorBadge,
                              {
                                backgroundColor:
                                  item.status === 'Approved' ? 'rgba(76, 175, 80, 0.1)' :
                                  item.status === 'Pending' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                borderColor:
                                  item.status === 'Approved' ? '#4CAF50' :
                                  item.status === 'Pending' ? '#FF9800' : '#F44336'
                              }
                            ]}>
                              <Text style={[
                                styles.statusIndicatorText,
                                {
                                  color:
                                    item.status === 'Approved' ? '#4CAF50' :
                                    item.status === 'Pending' ? '#FF9800' : '#F44336'
                                }
                              ]}>{item.status}</Text>
                            </View>

                            <TouchableOpacity activeOpacity={0.6} onPress={() => handleDeleteArticle(item.id)}>
                              <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                          </View>

                          <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                          
                          {/* Metadata row */}
                          {item.status === 'Approved' && (
                            <>
                              <View style={styles.articleMetaRow}>
                                <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                                <Text style={[styles.articleMetaText, { color: colors.textSecondary }]}>{item.date}</Text>
                                <Text style={[styles.metaDivider, { color: colors.textSecondary }]}>•</Text>
                                <Ionicons name="eye-outline" size={13} color={colors.textSecondary} />
                                <Text style={[styles.articleMetaText, { color: colors.textSecondary }]}>{item.views}</Text>
                              </View>
                              <View style={styles.articleStatsRow}>
                                <View style={styles.statItem}>
                                  <Ionicons name="heart-outline" size={13} color={colors.textSecondary} />
                                  <Text style={[styles.statItemText, { color: colors.textSecondary }]}>{item.likes}</Text>
                                </View>
                                <View style={styles.statItem}>
                                  <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
                                  <Text style={[styles.statItemText, { color: colors.textSecondary }]}>{item.comments}</Text>
                                </View>
                                <View style={styles.statItem}>
                                  <Ionicons name="repeat-outline" size={13} color={colors.textSecondary} />
                                  <Text style={[styles.statItemText, { color: colors.textSecondary }]}>{item.shares}</Text>
                                </View>
                              </View>

                              {/* Approved Actions */}
                              <View style={styles.articleActionsRow}>
                                <TouchableOpacity style={[styles.outlineActionBtn, { borderColor: colors.primary }]} activeOpacity={0.7}>
                                  <Ionicons name="open-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                                  <Text style={[styles.outlineActionBtnText, { color: colors.primary }]}>View</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.outlineActionBtn, { borderColor: colors.primary, marginLeft: 8 }]} activeOpacity={0.7}>
                                  <Ionicons name="bar-chart-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                                  <Text style={[styles.outlineActionBtnText, { color: colors.primary }]}>Analytics</Text>
                                </TouchableOpacity>
                              </View>
                            </>
                          )}

                          {item.status === 'Pending' && (
                            <>
                              <Text style={[styles.articleMeta, { color: colors.textSecondary }]}>
                                Submitted on {item.date.replace('Submitted on ', '')}
                              </Text>
                              <Text style={styles.pendingReviewText}>
                                Estimated review time: {item.estimatedTime || '24–48 hours'}
                              </Text>

                              {/* Pending Actions */}
                              <View style={styles.articleActionsRow}>
                                <TouchableOpacity style={styles.simpleActionBtn} activeOpacity={0.7}>
                                  <Ionicons name="pencil-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.simpleActionBtn, { marginLeft: 16 }]} activeOpacity={0.7} onPress={() => handleDeleteArticle(item.id)}>
                                  <Ionicons name="trash-outline" size={14} color="#F44336" style={{ marginRight: 4 }} />
                                  <Text style={{ color: '#F44336', fontSize: 13, fontWeight: '600' }}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            </>
                          )}

                          {item.status === 'Rejected' && (
                            <>
                              <View style={styles.articleMetaRow}>
                                <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                                <Text style={[styles.articleMetaText, { color: colors.textSecondary }]}>{item.date}</Text>
                                <Text style={[styles.metaDivider, { color: colors.textSecondary }]}>•</Text>
                                <Ionicons name="eye-outline" size={13} color={colors.textSecondary} />
                                <Text style={[styles.articleMetaText, { color: colors.textSecondary }]}>{item.views}</Text>
                              </View>
                              <Text style={styles.rejectedReasonText}>
                                Reason: {item.reason}
                              </Text>

                              {/* Rejected Actions */}
                              <View style={styles.articleActionsRow}>
                                <TouchableOpacity style={styles.simpleActionBtn} activeOpacity={0.7} onPress={() => setShowCreateArticleModal(true)}>
                                  <Ionicons name="refresh-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Edit & Resubmit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.simpleActionBtn, { marginLeft: 16 }]} activeOpacity={0.7} onPress={() => handleDeleteArticle(item.id)}>
                                  <Ionicons name="trash-outline" size={14} color="#F44336" style={{ marginRight: 4 }} />
                                  <Text style={{ color: '#F44336', fontSize: 13, fontWeight: '600' }}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            </>
                          )}

                        </View>
                      </View>
                    );

                    const approved = sortedNews.filter(i => i.status === 'Approved');
                    const pending = sortedNews.filter(i => i.status === 'Pending');
                    const rejected = sortedNews.filter(i => i.status === 'Rejected');

                    const renderSection = (title: string, count: number, items: any[], color: string) => {
                      if (items.length === 0) return null;
                      return (
                        <View key={title} style={{ marginBottom: 24 }}>
                          <Text style={[styles.newsGroupHeader, { color }]}>{title} ({count})</Text>
                          <View style={{ gap: 16 }}>
                            {items.map(renderArticleCard)}
                          </View>
                        </View>
                      );
                    };

                    if (newsFilter === 'all') {
                      return (
                        <>
                          {renderSection('Approved', approved.length, approved, '#4CAF50')}
                          {renderSection('Pending', pending.length, pending, '#FF9800')}
                          {renderSection('Rejected', rejected.length, rejected, '#F44336')}
                        </>
                      );
                    } else if (newsFilter === 'approved') {
                      return renderSection('Approved', approved.length, approved, '#4CAF50');
                    } else if (newsFilter === 'pending') {
                      return renderSection('Pending', pending.length, pending, '#FF9800');
                    } else if (newsFilter === 'rejected') {
                      return renderSection('Rejected', rejected.length, rejected, '#F44336');
                    }
                    
                    return null;
                  })()}
                </View>

                <TouchableOpacity style={[styles.loadMoreButton, { borderColor: colors.border }]} activeOpacity={0.7}>
                  <Ionicons name="refresh-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.loadMoreText, { color: colors.primary }]}>Load More News</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {activeTab === 'saved' && (
          <View style={styles.postsGrid}>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>Saved Articles</Text>
            {savedPosts.length === 0 ? (
              <View style={styles.emptyTabContent}>
                <Ionicons name="bookmark-outline" size={48} color={colors.textTertiary} style={{ marginBottom: 12 }} />
                <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No saved bookmarks found.</Text>
              </View>
            ) : (
              <View style={styles.postsWrapper}>
                {savedPosts.map((post) => (
                  <View key={post.id} style={styles.postCard}>
                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
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

      {/* Drawer Overlay Option Menu */}
      <MenuOptions isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />

      {/* Create Article Modal */}
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
              
              {/* Caption */}
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

              {/* Photo Selector */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Select Image Cover Theme</Text>
                {postCoverImage ? (
                  <View style={styles.postCoverContainer}>
                    <Image source={{ uri: postCoverImage }} style={styles.postCoverImg} />
                    <TouchableOpacity style={styles.postCoverRemoveBtn} onPress={() => setPostCoverImage('')}>
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.presetsGridContainer}>
                    {POST_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        style={[styles.presetItemCard, postCoverImage === preset.url && styles.presetItemCardActive]}
                        activeOpacity={0.8}
                        onPress={() => setPostCoverImage(preset.url)}
                      >
                        <Image source={{ uri: preset.url }} style={styles.presetItemImg} />
                        <View style={styles.presetItemLabelWrapper}>
                          <Text style={styles.presetItemLabel}>{preset.label}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
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

      {/* News Sorting Filter Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.pickerOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Sort Articles By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerOptionsList}>
              <TouchableOpacity
                style={[styles.pickerOptionRow, newsSort === 'date' && { backgroundColor: colors.primaryLight }]}
                onPress={() => {
                  setNewsSort('date');
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.pickerOptionLabel, { color: colors.text }, newsSort === 'date' && { color: colors.primary, fontWeight: '700' }]}>
                  Newest Submissions
                </Text>
                {newsSort === 'date' && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickerOptionRow, newsSort === 'views' && { backgroundColor: colors.primaryLight }]}
                onPress={() => {
                  setNewsSort('views');
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.pickerOptionLabel, { color: colors.text }, newsSort === 'views' && { color: colors.primary, fontWeight: '700' }]}>
                  Most Viewed
                </Text>
                {newsSort === 'views' && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickerOptionRow, newsSort === 'likes' && { backgroundColor: colors.primaryLight }]}
                onPress={() => {
                  setNewsSort('likes');
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.pickerOptionLabel, { color: colors.text }, newsSort === 'likes' && { color: colors.primary, fontWeight: '700' }]}>
                  Most Liked
                </Text>
                {newsSort === 'likes' && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
  newsStatsSection: {
    marginTop: 8,
  },
  newsStatsWrapper: {
    paddingHorizontal: 16,
    gap: 12,
  },
  newsStatsGrid1: {
    flexDirection: 'row',
    gap: 12,
  },
  newsStatBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  newsStatIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsStatVal: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  newsStatLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  newsStatsGrid2: {
    flexDirection: 'row',
    gap: 12,
  },
  newsStatRowBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
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
  loadMoreButton: {
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  newsSection: {
    width: '100%',
  },
  newsGroupHeader: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    marginTop: 8,
    marginBottom: 12,
    marginHorizontal: 16,
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
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPillActive: {},
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  articleList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  articleCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
  },
  articleImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  articleDetails: {
    flex: 1,
    marginLeft: 12,
  },
  articleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicatorBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusIndicatorText: {
    fontSize: 9,
    fontWeight: '700',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    marginTop: 6,
    lineHeight: 18,
  },
  articleMeta: {
    fontSize: 11,
    marginTop: 6,
  },
  articleStats: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  articleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  articleMetaText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
  },
  metaDivider: {
    marginHorizontal: 4,
    fontSize: 11,
  },
  articleStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
  },
  articleActionsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outlineActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  simpleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingReviewText: {
    color: '#FF9800',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  rejectedReasonText: {
    color: '#F44336',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 15,
  },
  emptyTabContent: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Modal layout
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
  presetsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetItemCard: {
    width: (screenWidth - 60) / 3,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetItemCardActive: {
    borderColor: '#4648D4',
  },
  presetItemImg: {
    width: '100%',
    height: '100%',
  },
  presetItemLabelWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  presetItemLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  pickerOptionsList: {
    padding: 8,
  },
  pickerOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  pickerOptionLabel: {
    fontSize: 15,
  },
});
