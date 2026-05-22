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

const DRAWER_WIDTH = 320;

interface MenuOptionsProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MenuOptions({ isVisible, onClose }: MenuOptionsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

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
      route: '/bookmarks',
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
      if (route === '/' || route === '/shorts' || route === '/local' || route === '/discover' || route === '/profile' || route === '/settings') {
        router.replace(route as any);
      } else {
        router.push(route as any);
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
      // Gracefully redirect back to onboarding language selector
      router.replace('/(onboarding)/language' as any);
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
            },
          ]}
        >
          {/* Header row: profile picture + close button */}
          <View style={styles.headerRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('@/assets/immersive_feed/f8a7444eb4e0445e94186837bf33bd7f2f8b5681.png')}
                style={styles.avatarImage}
                contentFit="cover"
              />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#464554" />
            </TouchableOpacity>
          </View>

          {/* User detail info headings */}
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>Alex Rivera</Text>
            <Text style={styles.userSubtitle}>Premium Subscriber</Text>
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
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.menuItem,
                      isActive ? styles.activeMenuItem : styles.inactiveMenuItem,
                    ]}
                    onPress={() => handleNavigate(option.route)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={(isActive && option.activeIcon ? option.activeIcon : option.icon) as any}
                      size={22}
                      color={isActive ? '#006F66' : '#464554'}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive ? styles.activeMenuLabel : styles.inactiveMenuLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Separator Divider */}
            <View style={styles.divider} />

            {/* Bottom Stack of Links */}
            <View style={styles.bottomList}>
              {/* App Settings */}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  cleanPath === '/settings' ? styles.activeMenuItem : styles.inactiveMenuItem,
                ]}
                onPress={() => handleNavigate('/settings')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cleanPath === '/settings' ? 'settings' : 'settings-outline'}
                  size={22}
                  color={cleanPath === '/settings' ? '#006F66' : '#464554'}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuLabel,
                    cleanPath === '/settings' ? styles.activeMenuLabel : styles.inactiveMenuLabel,
                  ]}
                >
                  App Settings
                </Text>
              </TouchableOpacity>

              {/* Help & Support */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('/settings')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color="#464554"
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuLabel, styles.inactiveMenuLabel]}>
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
              <Text style={styles.footerBrand}>Aura News</Text>
              <Text style={styles.footerVersion}>VERSION 2.4.0</Text>
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
    borderColor: '#6063EE',
    padding: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'Inter_700Bold',
    color: '#4648D4',
    lineHeight: 32,
  },
  userSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter_500Medium',
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
  activeMenuItem: {
    backgroundColor: '#86F2E4',
    borderRadius: 9999,
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
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.6,
  },
  activeMenuLabel: {
    color: '#006F66',
  },
  inactiveMenuLabel: {
    color: '#464554',
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
    fontFamily: 'Inter_700Bold',
    color: 'rgba(96, 99, 238, 0.4)',
    letterSpacing: 0.6,
    lineHeight: 28,
  },
  footerVersion: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#767586',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    lineHeight: 16,
    marginTop: 4,
  },
});
