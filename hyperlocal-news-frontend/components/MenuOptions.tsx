import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useAuthStore } from '@/store/authStore';

const DRAWER_WIDTH = 320;

interface MenuOptionsProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MenuOptions({ isVisible, onClose }: MenuOptionsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuthStore();
  const displayName = user?.name || 'Alex Rivera';

  // Tracks native modal visibility during slide close animations
  const [shouldRender, setShouldRender] = useState(isVisible);

  // Animated values for sliding and backdrop fade
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Animate open
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate close, then hide/unmount modal from tree
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  const menuOptions = [
    {
      id: 'home',
      label: 'Home Feed',
      icon: 'home-outline',
      activeIcon: 'home',
      route: '/',
    },
    {
      id: 'local',
      label: 'Local News',
      icon: 'location-outline',
      activeIcon: 'location',
      route: '/local',
    },
    {
      id: 'shorts',
      label: 'Shorts',
      icon: 'play-circle-outline',
      activeIcon: 'play-circle',
      route: '/shorts',
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: 'compass-outline',
      activeIcon: 'compass',
      route: '/discover',
    },
    {
      id: 'events',
      label: 'Events',
      icon: 'calendar-outline',
      activeIcon: 'calendar',
      route: '/events',
    },
    {
      id: 'articles',
      label: 'Articles',
      icon: 'newspaper-outline',
      activeIcon: 'newspaper',
      route: '/articles',
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: 'bookmark-outline',
      activeIcon: 'bookmark',
      route: '/menu-bookmarks',
    },
    {
      id: 'notifications',
      label: 'Notification Center',
      icon: 'notifications-outline',
      activeIcon: 'notifications',
      route: '/notifications',
    },
    {
      id: 'profile',
      label: 'User Profile',
      icon: 'person-outline',
      activeIcon: 'person',
      route: '/profile',
    },
  ];

  // Clean pathname prefix in expo-router to match keys exactly
  const cleanPath = pathname.replace(/^\/\(tabs\)/, '') || '/';

  const handleNavigate = (route: string) => {
    // Graceful exit animation inside native modal
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Navigate to target screen using replace/push
      if (route === '/' || route === '/shorts' || route === '/local' || route === '/discover' || route === '/profile') {
        router.replace(route as any);
      } else {
        let finalRoute = route;
        if (route === '/settings') {
          const fromTab = pathname.replace(/^\/\(tabs\)/, '') || '/';
          if (fromTab === '/articles') {
            finalRoute = '/(tabs)/settings?from=articles';
          } else if (fromTab === '/events') {
            finalRoute = '/(tabs)/settings?from=events';
          }
        }
        router.push(finalRoute as any);
      }
    });
  };

  const handleClose = () => {
    onClose(); // Triggers the exit transition in useEffect
  };

  const handleLogout = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Clear authenticated state and persisted AsyncStorage tokens
      logout();
      // Gracefully redirect back to auth flow
      router.replace('/(auth)/login' as any);
    });
  };

  return (
    <Modal
      transparent={true}
      visible={shouldRender}
      onRequestClose={handleClose}
      animationType="none"
    >
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {/* Semi-translucent backdrop wash */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={styles.backdropPressable} onPress={handleClose} />
        </Animated.View>

        {/* Drawer content container */}
        <Animated.View
          style={[
            styles.drawer,
            {
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom + 16, 24),
              transform: [{ translateX: slideAnim }],
              backgroundColor: isDark ? colors.surface : '#EFF4FF',
            },
          ]}
        >
          {/* Header row: profile picture + close button */}
          <View style={styles.headerRow}>
            <View style={[styles.avatarContainer, { borderColor: colors.primary, backgroundColor: isDark ? '#1C1C2E' : '#EFF4FF' }]}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={30} color={colors.primary} />
              )}
              {user?.isPublisher && (
                <View style={[styles.verifiedBadge, { borderColor: isDark ? colors.surface : '#EFF4FF' }]}>
                  <Ionicons name="checkmark-sharp" size={10} color="#FFFFFF" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* User detail info headings */}
          <View style={styles.userInfoContainer}>
            <Text style={[styles.userName, { color: isDark ? colors.text : '#4648D4' }]}>{displayName}</Text>
            {user?.isGuest ? (
              <Text style={[styles.userSubtitle, { color: colors.textSecondary }]}>Guest Account</Text>
            ) : user?.isPublisher ? (
              <View style={styles.drawerPublisherBadge}>
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                <Text style={[styles.drawerPublisherText, { color: colors.primary }]}>Publisher</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  handleClose();
                  setTimeout(() => {
                    router.push('/(onboarding)/profile');
                  }, 280);
                }}
                activeOpacity={0.7}
                style={styles.drawerVerifyButton}
              >
                <Text style={[styles.userSubtitle, { color: colors.primary, fontWeight: '700', marginTop: 0 }]}>Not Verified</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Navigation Links Scroll List */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.menuList}>
              {menuOptions.map((option) => {
                const isActive = cleanPath === option.route;
                const activeBgColor = isDark ? 'rgba(134, 242, 228, 0.15)' : '#86F2E4';
                const activeTextColor = isDark ? '#86F2E4' : '#006F66';
                const inactiveColor = colors.textSecondary;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.menuItem,
                      isActive ? { backgroundColor: activeBgColor, borderRadius: 9999 } : styles.inactiveMenuItem,
                    ]}
                    onPress={() => handleNavigate(option.route)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={(isActive && option.activeIcon ? option.activeIcon : option.icon) as any}
                      size={22}
                      color={isActive ? activeTextColor : inactiveColor}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        { color: isActive ? activeTextColor : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Separator Divider */}
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Bottom Stack of Links */}
            <View style={styles.bottomList}>
              {/* App Settings */}
              {(() => {
                const isSettingsActive = cleanPath === '/settings';
                const activeBgColor = isDark ? 'rgba(134, 242, 228, 0.15)' : '#86F2E4';
                const activeTextColor = isDark ? '#86F2E4' : '#006F66';
                const inactiveColor = colors.textSecondary;
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      isSettingsActive ? { backgroundColor: activeBgColor, borderRadius: 9999 } : styles.inactiveMenuItem,
                    ]}
                    onPress={() => handleNavigate('/settings')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSettingsActive ? 'settings' : 'settings-outline'}
                      size={22}
                      color={isSettingsActive ? activeTextColor : inactiveColor}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        { color: isSettingsActive ? activeTextColor : colors.text },
                      ]}
                    >
                      App Settings
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              {/* Help & Support */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('/help')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color={colors.textSecondary}
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuLabel, { color: colors.text }]}>
                  Help & Support
                </Text>
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color="#BA1A1A"
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuLabel, styles.logoutLabel]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer Brand Logo & Version Info */}
            <View style={styles.footer}>
              <Text style={[styles.footerBrand, { color: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(96, 99, 238, 0.4)' }]}>HyperLocal</Text>
              <Text style={[styles.footerVersion, { color: colors.textSecondary }]}>VERSION 2.4.0</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 28, 48, 0.3)',
  },
  backdropPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#EFF4FF',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#4648D4',
    padding: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  closeButton: {
    padding: 8,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    color: '#4648D4',
    lineHeight: 32,
  },
  userSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins_500Medium',
    color: '#464554',
    lineHeight: 20,
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
  },
  inactiveMenuItem: {
    backgroundColor: 'transparent',
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(199, 196, 215, 0.3)',
    marginVertical: 24,
    marginHorizontal: 8,
  },
  bottomList: {
    gap: 8,
    marginBottom: 40,
  },
  logoutLabel: {
    color: '#BA1A1A',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  footerBrand: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    color: 'rgba(96, 99, 238, 0.4)',
    letterSpacing: 0.6,
    lineHeight: 28,
  },
  footerVersion: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: '#767586',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    lineHeight: 16,
    marginTop: 4,
  },
  drawerPublisherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  drawerPublisherText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  drawerVerifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#006A61',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
});
