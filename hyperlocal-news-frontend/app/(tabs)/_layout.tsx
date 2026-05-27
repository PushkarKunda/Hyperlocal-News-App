import { Tabs, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, BackHandler } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useEffect } from 'react';

export default function TabLayout() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const pathname = usePathname();

  useEffect(() => {
    const onBackPress = () => {
      // Intercept the physical back button press on Android when the user is on the main tabs screens
      // to exit the app instead of popping the stack back into onboarding screens in history.
      const cleanPath = pathname.replace(/^\/\(tabs\)/, '') || '/';
      if (
        cleanPath === '/' ||
        cleanPath === '/shorts' ||
        cleanPath === '/local' ||
        cleanPath === '/discover' ||
        cleanPath === '/profile' ||
        cleanPath === '/menu-bookmarks'
      ) {
        BackHandler.exitApp();
        return true; // Prevent default pop behavior
      }
      return false; // Allow standard backward pop for nested screens
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { display: 'none' },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: 'Inter_600SemiBold',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="shorts"
        options={{
          title: 'Shorts',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="play-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="local"
        options={{
          title: 'Local',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="near-me" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-article"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="menu-bookmarks"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}