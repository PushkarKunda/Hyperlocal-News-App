import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, useColorScheme, Text, Image,
  ActivityIndicator, Share, Pressable, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { NotificationItem } from '@/components/common/NotificationItem';
import { NewsCard } from '@/components/news/NewsCard';
import { useNotifications } from '@/hooks/useNotifications';
import { useBookmarkedNews } from '@/hooks/useNews';
import { useStore } from '@/store/useStore';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const toggleBookmark = useStore((state) => state.toggleBookmark);
  const user = useStore((state) => state.user);
  const publisherRequestStatus = useStore((state) => state.publisherRequestStatus);
  const requestPublisherAccess = useStore((state) => state.requestPublisherAccess);
  const approvePublisherRequest = useStore((state) => state.approvePublisherRequest);

  const { data: notifications, isLoading: isLoadingNotifs } = useNotifications();
  const { data: bookmarkedNews, isLoading: isLoadingNews } = useBookmarkedNews();
  const isLoading = isLoadingNotifs || isLoadingNews;

  // Publisher request email state
  const [publisherEmail, setPublisherEmail] = useState(user.email ?? '');

  // Derived states
  const isPhoneVerified = !!user.phone;
  const isEmailVerified = !!user.email;
  const canRequestPublisher =
    isPhoneVerified &&
    isEmailVerified &&
    !user.isPublisher &&
    publisherRequestStatus === 'none';

  const handlePublisherRequest = () => {
    if (!publisherEmail.trim() || !publisherEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address to request publisher status.');
      return;
    }
    requestPublisherAccess();
    Alert.alert(
      'Request Submitted',
      'Your publisher request has been sent to the admin for review. You will be notified once approved.',
      [{ text: 'OK' }]
    );
  };

  const handleShare = async (title: string, url: string) => {
    try {
      await Share.share({ message: `${title}\n\nRead more at: ${url}`, url, title });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Profile Card ── */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
            {user.handle && (
              <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@{user.handle}</Text>
            )}
            {user.isPublisher && (
              <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                <MaterialIcons name="verified" size={14} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>Publisher</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Account Details ── */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>

          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user.phone}</Text>
            </View>
            <View style={[styles.verifiedChip, { backgroundColor: '#dcfce7' }]}>
              <MaterialIcons name="check-circle" size={14} color="#16a34a" />
              <Text style={[styles.verifiedText, { color: '#16a34a' }]}>Verified</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user.email ?? 'Not set'}</Text>
            </View>
            {isEmailVerified ? (
              <View style={[styles.verifiedChip, { backgroundColor: '#dcfce7' }]}>
                <MaterialIcons name="check-circle" size={14} color="#16a34a" />
                <Text style={[styles.verifiedText, { color: '#16a34a' }]}>Verified</Text>
              </View>
            ) : (
              <View style={[styles.verifiedChip, { backgroundColor: '#fef3c7' }]}>
                <MaterialIcons name="error-outline" size={14} color="#d97706" />
                <Text style={[styles.verifiedText, { color: '#d97706' }]}>Unverified</Text>
              </View>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {user.location.city}, {user.location.district}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <MaterialIcons name="interests" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Interests</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {user.interests.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(' · ')}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Publisher Section ── */}
        {user.isPublisher ? (
          /* ── Publisher Dashboard Access ── */
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Publisher Dashboard</Text>
            <Text style={[styles.publisherDesc, { color: colors.textSecondary }]}>
              You have publisher access. Create and manage articles for your community.
            </Text>

            <Pressable
              style={[styles.dashboardButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(publisher)/dashboard' as any)}
            >
              <MaterialIcons name="dashboard" size={20} color="#fff" />
              <Text style={styles.dashboardButtonText}>Open Publisher Dashboard</Text>
            </Pressable>

            <Pressable
              style={[styles.createButton, { borderColor: colors.primary }]}
              onPress={() => router.push('/(publisher)/create' as any)}
            >
              <MaterialIcons name="edit" size={20} color={colors.primary} />
              <Text style={[styles.createButtonText, { color: colors.primary }]}>Write New Article</Text>
            </Pressable>
          </View>
        ) : (
          /* ── Become a Publisher ── */
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Become a Publisher</Text>
            <Text style={[styles.publisherDesc, { color: colors.textSecondary }]}>
              Publish news stories for your local community. Both your phone and email must be verified to apply.
            </Text>

            <View style={styles.verificationStatus}>
              <View style={styles.verificationItem}>
                <MaterialIcons
                  name={isPhoneVerified ? 'check-circle' : 'radio-button-unchecked'}
                  size={18}
                  color={isPhoneVerified ? '#16a34a' : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.verificationLabel,
                    { color: isPhoneVerified ? '#16a34a' : colors.textSecondary },
                  ]}
                >
                  Phone verified
                </Text>
              </View>
              <View style={styles.verificationItem}>
                <MaterialIcons
                  name={isEmailVerified ? 'check-circle' : 'radio-button-unchecked'}
                  size={18}
                  color={isEmailVerified ? '#16a34a' : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.verificationLabel,
                    { color: isEmailVerified ? '#16a34a' : colors.textSecondary },
                  ]}
                >
                  Email verified
                </Text>
              </View>
            </View>

            {!isEmailVerified && (
              <TextInput
                style={[
                  styles.emailInput,
                  { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
                ]}
                placeholder="Enter your email address"
                placeholderTextColor={colors.textTertiary}
                value={publisherEmail}
                onChangeText={setPublisherEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            {publisherRequestStatus === 'pending' ? (
              <View>
                <View style={[styles.requestSentBanner, { backgroundColor: '#dcfce7' }]}>
                  <MaterialIcons name="hourglass-top" size={20} color="#16a34a" />
                  <Text style={[styles.requestSentText, { color: '#15803d' }]}>
                    Request submitted — awaiting admin review.
                  </Text>
                </View>
                {/* Dev shortcut: simulate admin approval */}
                <Pressable
                  style={[styles.devApproveButton, { borderColor: '#16a34a' }]}
                  onPress={() => {
                    approvePublisherRequest();
                    Alert.alert('✅ Approved!', 'You are now a publisher. Access the dashboard from your profile.');
                  }}
                >
                  <MaterialIcons name="admin-panel-settings" size={16} color="#16a34a" />
                  <Text style={[styles.devApproveText, { color: '#16a34a' }]}>
                    Simulate Admin Approval
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[
                  styles.publisherButton,
                  { backgroundColor: canRequestPublisher ? colors.primary : colors.border },
                ]}
                onPress={handlePublisherRequest}
                disabled={!canRequestPublisher}
              >
                <MaterialIcons
                  name="edit"
                  size={18}
                  color={canRequestPublisher ? '#fff' : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.publisherButtonText,
                    { color: canRequestPublisher ? '#fff' : colors.textTertiary },
                  ]}
                >
                  Request Publisher Access
                </Text>
              </Pressable>
            )}

            {publisherRequestStatus === 'none' && !canRequestPublisher && (
              <Text style={[styles.publisherHint, { color: colors.textTertiary }]}>
                Verify both phone and email to enable this button.
              </Text>
            )}
          </View>
        )}

        {/* ── Notifications ── */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Notifications</Text>
          {notifications?.length ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => console.log('Notification pressed', notification.id)}
              />
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No new notifications.</Text>
          )}
        </View>

        {/* ── Saved Articles ── */}
        <View style={styles.savedSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Saved Articles</Text>
            <Text style={[styles.countText, { color: colors.textSecondary }]}>
              {bookmarkedNews?.length ?? 0} saved
            </Text>
          </View>
          {bookmarkedNews?.length ? (
            bookmarkedNews.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onPress={() => router.push(`/news/${article.id}` as any)}
                onBookmarkPress={() => toggleBookmark(article.id)}
                onSharePress={() => handleShare(article.headline, article.url)}
              />
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="bookmark-border" size={48} color={colors.border} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No saved articles yet</Text>
              <Text style={[styles.emptyStateDesc, { color: colors.textSecondary }]}>
                Tap the bookmark icon on any article to save it here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginRight: 16, backgroundColor: '#E2E8F0' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  userHandle: { fontSize: 14, marginBottom: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },

  section: {
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 12,
  },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '500' },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: { fontSize: 11, fontWeight: '600' },

  publisherDesc: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  verificationStatus: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  verificationItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verificationLabel: { fontSize: 14, fontWeight: '500' },
  emailInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  publisherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  publisherButtonText: { fontSize: 15, fontWeight: '700' },
  publisherHint: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  requestSentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  requestSentText: { fontSize: 14, fontWeight: '600', flex: 1 },

  // Publisher dashboard buttons
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  dashboardButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  createButtonText: { fontSize: 15, fontWeight: '700' },

  // Dev approval
  devApproveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  devApproveText: { fontSize: 13, fontWeight: '600' },

  emptyText: { textAlign: 'center', paddingVertical: 16 },

  savedSection: { padding: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  countText: { fontSize: 13 },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
  },
  emptyStateTitle: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  emptyStateDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});