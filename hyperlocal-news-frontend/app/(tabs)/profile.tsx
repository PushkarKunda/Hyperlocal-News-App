import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileMenuItem } from '@/components/ui/ProfileMenuItem';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { user, logout } = useAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const handleSignOut = () => {
    logout();
    router.replace('/login');
  };

  const displayName = 'Julian Alexander';
  const displayPhone = user?.phoneNumber || '+1 (555) 012-3456';
  const avatarUrl = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'; // Generic avatar

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerIconButton}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="more-vert" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={[styles.avatarWrapper, { borderColor: colors.surface }]}>
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={12} color="#FFF" />
            </View>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{displayPhone}</Text>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>128</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bookmarks</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>452</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Read</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statColumn}>
            <Text style={styles.statNumber}>34</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Shared</Text>
          </View>
        </View>

        {/* Menu List */}
        <View style={styles.menuList}>
          <ProfileMenuItem 
            iconName="bookmark" 
            title="My Bookmarks" 
          />
          <ProfileMenuItem 
            iconName="notifications" 
            title="Notifications" 
            badgeCount={3} 
          />
          <ProfileMenuItem 
            iconName="language" 
            title="Language" 
            trailingText="English (US)" 
          />
          <ProfileMenuItem 
            iconName="location-on" 
            title="Location" 
            trailingText="Seattle, WA" 
          />
          <ProfileMenuItem 
            iconName="favorite" 
            title="My Interests" 
          />
          <ProfileMenuItem 
            iconName="dark-mode" 
            title="Dark Mode" 
            isToggle={true}
            toggleValue={isDarkMode}
            onToggle={setIsDarkMode}
          />
          <ProfileMenuItem 
            iconName="text-fields" 
            title="Text Size" 
            trailingText="Medium" 
          />
        </View>

        {/* Danger Zone */}
        <View style={[styles.dangerZone, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={18} color="#ba1a1a" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // accommodate bottom tab
    gap: 40,
  },
  userInfoSection: {
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6567F1',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    color: '#4648d4',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    height: 48,
  },
  menuList: {
    gap: 8,
  },
  dangerZone: {
    borderTopWidth: 1,
    paddingTop: 25,
    alignItems: 'flex-start',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    width: '100%',
  },
  signOutText: {
    color: '#ba1a1a',
    fontSize: 16,
    fontWeight: '400',
  },
});