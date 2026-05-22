import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Spacing';

export default function MenuScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const menuOptions = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home-outline',
      library: 'Ionicons',
      route: '/(tabs)',
    },
    {
      id: 'local',
      label: 'Local News',
      icon: 'near-me',
      library: 'MaterialIcons',
      route: '/(tabs)/local',
    },
    {
      id: 'shorts',
      label: 'shorts',
      icon: 'play-circle',
      library: 'Feather',
      route: '/(tabs)/shorts',
    },
    {
      id: 'discover',
      label: 'discover',
      icon: 'compass-outline',
      library: 'Ionicons',
      route: '/(tabs)/discover',
    },
    {
      id: 'events',
      label: 'events',
      icon: 'calendar-outline',
      library: 'Ionicons',
      route: '/(tabs)/events',
    },
    {
      id: 'articles',
      label: 'articles',
      icon: 'book-open',
      library: 'Feather',
      route: '/(tabs)/articles',
    },
    {
      id: 'bookmarks',
      label: 'bookmarks',
      icon: 'bookmark-outline',
      library: 'Ionicons',
      route: '/(tabs)/bookmarks',
    },
    {
      id: 'notifications',
      label: 'notifications',
      icon: 'notifications-outline',
      library: 'Ionicons',
      route: '/(tabs)/notifications',
    },
  ];

  const handleNavigate = (route: string) => {
    if (route === '/(tabs)') {
      router.replace(route as any);
    } else {
      router.push(route as any);
    }
  };

  const renderIcon = (option: typeof menuOptions[0], color: string) => {
    const size = 24;
    if (option.library === 'MaterialIcons') {
      return <MaterialIcons name={option.icon as any} size={size} color={color} />;
    }
    if (option.library === 'Feather') {
      return <Feather name={option.icon as any} size={size} color={color} />;
    }
    return <Ionicons name={option.icon as any} size={size} color={color} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Menu Options</Text>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Summary */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>Praveen Kumar</Text>
            <Text style={[styles.profileSubtitle, { color: colors.textSecondary }]}>Active Reader</Text>
          </View>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuList}>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleNavigate(option.route)}
              activeOpacity={0.65}
            >
              <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
                {renderIcon(option, colors.primary)}
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                {option.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} style={styles.chevron} />
            </TouchableOpacity>
          ))}

          {/* Subtly Separated App Settings Option */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={[styles.menuItem, styles.settingsItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleNavigate('/(tabs)/settings')}
            activeOpacity={0.65}
          >
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(101, 103, 241, 0.15)' }]}>
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, styles.settingsLabel, { color: colors.text }]}>
              App settings
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} style={styles.chevron} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Branding */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          HYPERLOCAL NEWS • VERSION 1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6567F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  profileInfo: {
    marginLeft: 14,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  profileSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  menuList: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'capitalize',
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.6,
  },
  settingsItem: {
    borderStyle: 'dashed',
  },
  settingsLabel: {
    textTransform: 'none',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: 'Inter_600SemiBold',
  },
});
