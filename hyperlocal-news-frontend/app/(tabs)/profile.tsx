import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MenuOptions from '@/components/MenuOptions';

export default function ProfileScreen() {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { user, logout } = useAuthStore();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of HyperLocal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const isGuest = user?.isGuest;
  const displayName = user?.name || (isGuest ? 'Guest User' : 'Complete Profile');
  const displayPhone = user?.phoneNumber || (isGuest ? 'No phone added' : 'Setup Phone');

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* Header - Top App Bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.headerLeftButton} 
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        
        <TouchableOpacity 
          style={styles.headerRightButton} 
          onPress={() => router.push('/(tabs)/discover')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card Section */}
        <View style={styles.profileSection}>
          {/* Glassmorphic Background Decor */}
          <View style={[styles.glassDecor, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.15)' : 'rgba(96, 99, 238, 0.1)' }]} />
          
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Double Bordered Linear Gradient Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#4648D4', '#86F2E4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <View style={[styles.avatarInner, { borderColor: colors.surface, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#1C1C2E' : '#EFF4FF' }]}>
                  {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={40} color={colors.primary} />
                  )}
                </View>
              </LinearGradient>
              
              {/* Teal Verified Badge */}
              {!isGuest && (
                <View style={[styles.verifiedBadge, { borderColor: colors.surface }]}>
                  <Ionicons name="checkmark-sharp" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            {/* User Details */}
            <View style={styles.detailsContainer}>
              <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
              
              <View style={styles.badgeWrapper}>
                {user?.isPublisher ? (
                  <View style={[styles.publisherBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 6 }]}>
                    <Ionicons name="shield-checkmark" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.publisherBadgeText, { color: colors.primary, fontSize: 12, fontWeight: '800' }]}>Publisher</Text>
                  </View>
                ) : (
                  isGuest ? (
                    <View style={[styles.premiumBadge, { backgroundColor: isDark ? '#2A2A3C' : 'rgba(70, 72, 212, 0.08)' }]}>
                      <Text style={[styles.premiumBadgeText, { color: colors.primary }]}>Guest Mode</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.publisherVerifyButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary, paddingHorizontal: 14, paddingVertical: 6 }]}
                      onPress={() => router.push('/(onboarding)/profile')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="shield-checkmark" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.publisherVerifyButtonText, { color: colors.primary, fontWeight: '700', fontSize: 11 }]}>Get Verified to Publish</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={[styles.userBio, { color: isDark ? colors.textSecondary : '#464554' }]}>
                {isGuest 
                  ? 'Enjoying HyperLocal? Log in to personalize your profile, customize your news feed, and save reading preferences.'
                  : 'Tech enthusiast & daily reader. Always seeking the deeper story behind the headlines.'
                }
              </Text>
            </View>

            {/* Stats Row */}
            {!isGuest && (
              <View style={[styles.statsRow, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(199, 196, 215, 0.2)' }]}>
                <View style={styles.statColumn}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>124</Text>
                  <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : '#464554' }]}>Stories Read</Text>
                </View>
                
                <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(199, 196, 215, 0.3)' }]} />
                
                <View style={styles.statColumn}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>12</Text>
                  <Text style={[styles.statLabel, { color: isDark ? colors.textSecondary : '#464554' }]}>Active Lists</Text>
                </View>
              </View>
            )}

          </View>
        </View>

        {/* Bento Menu Grid / List Items */}
        <View style={styles.menuGrid}>
          
          {/* My Interests */}
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => router.push('/(tabs)/profile-interests' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.25)' : 'rgba(70, 72, 212, 0.1)' }]}>
              <MaterialIcons name="favorite" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>My Interests</Text>
              <Text style={[styles.menuSubtitle, { color: isDark ? colors.textSecondary : '#464554' }]}>Customize your news feed topics</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Reading History */}
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => router.push('/(tabs)/profile-reading-history' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: isDark ? 'rgba(20, 184, 166, 0.25)' : 'rgba(134, 242, 228, 0.3)' }]}>
              <MaterialIcons name="history" size={24} color="#0D9488" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Reading History</Text>
              <Text style={[styles.menuSubtitle, { color: isDark ? colors.textSecondary : '#464554' }]}>Stories you've read recently</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Account Settings */}
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(70, 69, 84, 0.1)' }]}>
              <MaterialIcons name="settings" size={24} color={isDark ? colors.textSecondary : '#464554'} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Account Settings</Text>
              <Text style={[styles.menuSubtitle, { color: isDark ? colors.textSecondary : '#464554' }]}>Security, Privacy & Email</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </TouchableOpacity>

        </View>

        {/* Guest Authentication Call to Action Banner */}
        {isGuest ? (
          <View style={[styles.subscriptionBanner, { backgroundColor: colors.primary }]}>
            {/* Decorative Translucent Circles */}
            <View style={styles.decorCircleLarge} />
            <View style={styles.decorCircleSmall} />

            <View style={styles.subBannerContent}>
              <Text style={styles.subBannerTitle}>Unlock Full Access</Text>
              <Text style={styles.subBannerSubtitle}>Log in or register to customize your news feed, bookmark stories, and unlock all features.</Text>
              
              <TouchableOpacity 
                style={styles.billingButton} 
                activeOpacity={0.8}
                onPress={() => {
                  logout();
                  router.replace('/(auth)/login');
                }}
              >
                <Text style={styles.billingButtonText}>Log In / Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Logout Trigger */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <MaterialIcons name="logout" size={18} color="#ba1a1a" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      <MenuOptions isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerLeftButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 32,
  },
  profileSection: {
    position: 'relative',
    width: '100%',
  },
  glassDecor: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    zIndex: 0,
  },
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#3E3E46',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    borderWidth: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#006A61',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  detailsContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: 'Poppins_700Bold',
  },
  badgeWrapper: {
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: '#86F2E4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  premiumBadgeText: {
    color: '#006F66',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userBio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 20,
    width: '100%',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  menuGrid: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    shadowColor: '#3E3E46',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  subscriptionBanner: {
    backgroundColor: '#4648D4',
    borderRadius: 12,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  decorCircleLarge: {
    position: 'absolute',
    bottom: -32,
    right: -32,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircleSmall: {
    position: 'absolute',
    right: 48,
    top: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  subBannerContent: {
    gap: 4,
  },
  subBannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  subBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    marginBottom: 16,
  },
  billingButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  billingButtonText: {
    color: '#4648D4',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    alignSelf: 'center',
  },
  logoutText: {
    color: '#ba1a1a',
    fontSize: 16,
    fontWeight: '700',
  },
  publisherBadge: {
    backgroundColor: '#006A61',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginTop: 8,
  },
  publisherBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  publisherVerifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    marginTop: 8,
  },
  publisherVerifyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});