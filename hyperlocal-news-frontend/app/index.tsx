import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useColorScheme, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useAuthStore } from '@/store/authStore';

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  // Use getState() inside the timeout to ensure we have the fully hydrated state
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.brandingContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo */}
          <View 
            style={[
              styles.logoContainer, 
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <MaterialIcons 
              name="newspaper" 
              size={72} 
              color={colors.primary} 
            />
          </View>

          {/* App Name */}
          <Text style={[styles.appName, { color: colors.text }]}>
            HyperLocal
          </Text>

          {/* Tagline */}
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your Local Voice
          </Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={[styles.progressContainer, { backgroundColor: colors.indicator }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: colors.primary,
                ...Shadows.glow,
              },
            ]}
          />
        </View>

        {/* Home Indicator */}
        <View 
          style={[
            styles.homeIndicator,
            { 
              backgroundColor: colorScheme === 'dark' ? '#FFF' : '#000',
              opacity: colorScheme === 'dark' ? 0.2 : 0.1,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  brandingContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: 'Inter_700Bold',
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    alignItems: 'center',
  },
  progressContainer: {
    width: 200,
    height: 4,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing['2xl'],
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    marginBottom: Spacing.sm,
  },
});