import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTabBarStore } from '@/store/tabBarStore';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { visible } = useTabBarStore();
  const translateY = useRef(new Animated.Value(0)).current;

  // Inspect route descriptors to check if tabBarStyle has display: 'none' (e.g. for secondary screens)
  const activeRoute = state.routes[state.index];
  const activeDescriptor = descriptors[activeRoute.key];
  const activeOptions = activeDescriptor?.options;

  // The tab bar should only hide/show on the home page (index).
  // On all other primary tabs, it must remain visible!
  const isHome = activeRoute?.name === 'index';
  const isTabBarVisible = isHome ? visible : true;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isTabBarVisible ? 0 : 100,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start();
  }, [isTabBarVisible]);

  const isTabHiddenByScreen = activeOptions?.tabBarStyle && 
    (activeOptions.tabBarStyle as any).display === 'none';

  if (isTabHiddenByScreen) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          transform: [{ translateY }],
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 1000,
          zIndex: 9999,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        // Only render the 5 primary tabs in the bottom bar
        const allowedTabs = ['index', 'shorts', 'local', 'discover', 'more'];
        if (!allowedTabs.includes(route.name)) {
          return null;
        }

        const { options } = descriptors[route.key];
        const opt = options as any;

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Determine icon name
        let iconName: any = 'home';
        if (route.name === 'index') iconName = 'home';
        else if (route.name === 'shorts') iconName = 'play-circle-outline';
        else if (route.name === 'local') iconName = 'near-me';
        else if (route.name === 'discover') iconName = 'explore';
        else if (route.name === 'more') iconName = 'more-horiz';

        const color = isFocused ? colors.primary : colors.textTertiary;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={opt.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name={iconName} size={24} color={color} />
            <Text style={[styles.label, { color, fontFamily: 'Poppins_600SemiBold' }]}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 0,
    paddingTop: 10,
    zIndex: 9999,
    elevation: 1000,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
