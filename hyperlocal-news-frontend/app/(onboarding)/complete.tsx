import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useAuthStore } from '@/store/authStore';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

interface SummaryItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}

export default function CompleteScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();
  const { completeOnboarding, user } = useAuthStore();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Summary data - In real app, this would come from store/context
  const summaryItems: SummaryItem[] = [
    { icon: 'language', label: 'Language', value: user?.language || 'English' },
    { icon: 'place', label: 'Location', value: user?.district ? `${user.district}, ${user.state || ''}` : (user?.state || 'Hyderabad, Telangana') },
    { icon: 'bookmark-border', label: 'Interests', value: `${user?.interests?.length || 0} Topic${(user?.interests?.length || 0) !== 1 ? 's' : ''} Selected` },
  ];

  useEffect(() => {
    const onBackPress = () => {
      // Once onboarding is complete, pressing physical back button should exit the app
      // instead of going back to previous onboarding screens.
      BackHandler.exitApp();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Staggered animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleStartReading = () => {
    completeOnboarding();
    (navigation as any).reset({
      index: 0,
      routes: [{ name: '(tabs)' }],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Success Icon Section */}
      <View style={styles.successSection}>
        {/* Confetti Particles */}
        <View style={styles.confettiContainer}>
          <View style={[styles.confetti, styles.confetti1, { backgroundColor: colors.primary }]} />
          <View style={[styles.confetti, styles.confetti2, { backgroundColor: '#F472B6' }]} />
          <View style={[styles.confetti, styles.confetti3, { backgroundColor: '#FBBF24' }]} />
          <View style={[styles.confetti, styles.confetti4, { backgroundColor: '#34D399' }]} />
          <View style={[styles.confetti, styles.confetti5, { backgroundColor: colors.primary + '66' }]} />
        </View>

        {/* Success Icon */}
        <Animated.View
          style={[
            styles.successIconOuter,
            { backgroundColor: colors.primaryLight },
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={[styles.successIconInner, { backgroundColor: colors.primary }, Shadows.primaryGlow]}>
            <MaterialIcons name="check" size={48} color="#FFF" />
          </View>
        </Animated.View>
      </View>

      {/* Title Section */}
      <Animated.View
        style={[
          styles.titleSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          You're All Set!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Start exploring local news personalized for you
        </Text>
      </Animated.View>

      {/* Summary Card */}
      <Animated.View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {summaryItems.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.summaryRow,
              index < summaryItems.length - 1 && styles.summaryRowBorder,
              index < summaryItems.length - 1 && { borderBottomColor: 'rgba(70, 72, 212, 0.1)' },
            ]}
          >
            <View style={styles.summaryIcon}>
              <MaterialIcons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.summaryText}>
              <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
                {item.label.toUpperCase()}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={{ width: '100%' }}
          onPress={handleStartReading}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View
            style={[
              styles.startButton,
              { backgroundColor: colors.primary, transform: [{ scale: buttonScale }] },
              Shadows.primaryGlow,
            ]}
          >
            <Text style={styles.startButtonText}>Start Reading</Text>
          </Animated.View>
        </Pressable>

        <Text style={[styles.versionText, { color: colors.textTertiary }]}>
          HyperLocal News v2.4
        </Text>
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicatorContainer}>
        <View
          style={[
            styles.homeIndicator,
            { backgroundColor: colorScheme === 'dark' ? colors.border : colors.divider },
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
  statusBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  statusTime: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  successSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  confetti1: {
    top: 40,
    left: 60,
    transform: [{ rotate: '12deg' }],
  },
  confetti2: {
    top: 80,
    right: 40,
    transform: [{ rotate: '-12deg' }],
  },
  confetti3: {
    bottom: 40,
    left: 40,
    transform: [{ rotate: '45deg' }],
  },
  confetti4: {
    top: 120,
    right: 80,
    transform: [{ rotate: '12deg' }],
  },
  confetti5: {
    bottom: 80,
    right: 100,
    transform: [{ rotate: '-45deg' }],
  },
  successIconOuter: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 26,
  },
  summaryCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    padding: Spacing.lg,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  summaryRowBorder: {
    borderBottomWidth: 1.5,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    backgroundColor: 'rgba(70, 72, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(70, 72, 212, 0.1)',
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 1,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  startButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
    marginTop: Spacing.md,
  },
  homeIndicatorContainer: {
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 128,
    height: 6,
    borderRadius: 100,
  },
});