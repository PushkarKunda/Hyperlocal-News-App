import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
  BackHandler,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function FeedSetupLoaderScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Orbit rotation animation
  const orbitRotation = useRef(new Animated.Value(0)).current;

  // Ripple breathing scale and opacity animations
  const rippleScale1 = useRef(new Animated.Value(0.95)).current;
  const rippleOpacity1 = useRef(new Animated.Value(0.2)).current;
  const rippleScale2 = useRef(new Animated.Value(0.95)).current;
  const rippleOpacity2 = useRef(new Animated.Value(0.15)).current;

  // Bouncing dots animations
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  // Skeletons pulse animation
  const skeletonPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const onBackPress = () => {
      // Prevent user from going back during the critical feed setup loading process
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // 1. Progress Bar filling animation (3.5 seconds)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // width needs layout
    }).start(({ finished }) => {
      if (finished) {
        // Redirection to the Complete screen on completion
        router.replace('/(onboarding)/complete');
      }
    });

    // 2. Orbit rotation animation (continuous spinning)
    Animated.loop(
      Animated.timing(orbitRotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Ripple 1 breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rippleScale1, {
            toValue: 1.25,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity1, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rippleScale1, {
            toValue: 0.95,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity1, {
            toValue: 0.25,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 4. Ripple 2 breathing animation (staggered delay)
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rippleScale2, {
            toValue: 1.4,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity2, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(rippleScale2, {
            toValue: 0.95,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity2, {
            toValue: 0.2,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 5. Blinking dots animation loop
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(dot1Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dot2Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dot3Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
          Animated.delay(200),
        ])
      ).start();
    };
    animateDots();

    // 6. Pulse effect for skeleton cards at bottom
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, {
          toValue: 0.6,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(skeletonPulse, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);

  // Interpolations
  const rotationInterpolate = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const oppositeRotationInterpolate = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const barWidthInterpolation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Simulated Background Blur Vectors */}
      <View style={[styles.purpleBlur, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.1)' : 'rgba(96, 99, 238, 0.15)' }]} />
      <View style={[styles.tealBlur, { backgroundColor: isDark ? 'rgba(0, 106, 97, 0.1)' : 'rgba(134, 242, 228, 0.15)' }]} />

      <View style={styles.mainCanvas}>
        
        {/* Animated Loader Section */}
        <View style={styles.loaderSectionContainer}>
          <View style={styles.loaderOuterCircle}>
            
            {/* Ripple Wave 2 */}
            <Animated.View
              style={[
                styles.rippleRing,
                { borderColor: colors.primary },
                {
                  transform: [{ scale: rippleScale2 }],
                  opacity: rippleOpacity2,
                }
              ]}
            />

            {/* Ripple Wave 1 */}
            <Animated.View
              style={[
                styles.rippleRing,
                { borderColor: colors.primary },
                {
                  transform: [{ scale: rippleScale1 }],
                  opacity: rippleOpacity1,
                }
              ]}
            />

            {/* Base Background Circle */}
            <View style={[styles.loaderBaseCircle, { backgroundColor: colors.primaryLight }]} />

            {/* Rotating Orbit Container for Particles */}
            <Animated.View
              style={[
                styles.orbitContainer,
                { transform: [{ rotate: rotationInterpolate }] }
              ]}
            >
              {/* Teal Orbiting Particle */}
              <View style={[styles.orbitParticleTeal, styles.particle1]} />
              
              {/* Red Orbiting Particle */}
              <View style={[styles.orbitParticleRed, styles.particle2]} />
            </Animated.View>

            {/* Central White Newspaper Badge */}
            <View style={[styles.centerIconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="newspaper-outline" size={38} color={colors.primary} />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>Setting up your feed...</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We're curating the best stories based on{'\n'}your interests.
          </Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: isDark ? '#2A2A3C' : '#DCE9FF' }]}>
            <Animated.View
              style={[
                styles.progressBar,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                { width: barWidthInterpolation }
              ]}
            />
          </View>

          <View style={styles.indicatorSubRow}>
            <Text style={[styles.finalizingText, { color: colors.primary }]}>FINALIZING YOUR HYPERLOCAL</Text>
            <View style={styles.dotRow}>
              <Animated.View style={[styles.loadingDot, { backgroundColor: colors.primary, opacity: dot1Opacity }]} />
              <Animated.View style={[styles.loadingDot, { backgroundColor: colors.primary, opacity: dot2Opacity }]} />
              <Animated.View style={[styles.loadingDot, { backgroundColor: colors.primary, opacity: dot3Opacity }]} />
            </View>
          </View>
        </View>

        {/* Visual Context Preview Bento Cards */}
        <Animated.View
          style={[
            styles.skeletonContainer,
            { opacity: skeletonPulse }
          ]}
        >
          {/* Card Left */}
          <View style={[styles.skeletonCard, { backgroundColor: isDark ? '#2A2A3C' : '#E5EEFF' }]}>
            <View style={styles.skeletonMargin}>
              <View style={[styles.skeletonShortLine, { backgroundColor: isDark ? '#464554' : '#C7C4D7' }]} />
            </View>
            <View style={[styles.skeletonLongLine, { backgroundColor: isDark ? 'rgba(199, 196, 215, 0.2)' : 'rgba(199, 196, 215, 0.5)' }]} />
          </View>

          {/* Card Right */}
          <View style={[styles.skeletonCard, { backgroundColor: isDark ? '#2A2A3C' : '#E5EEFF' }]}>
            <View style={styles.skeletonMargin}>
              <View style={[styles.skeletonShortLine, { backgroundColor: isDark ? '#464554' : '#C7C4D7', width: '60%' }]} />
            </View>
            <View style={[styles.skeletonLongLine, { backgroundColor: isDark ? 'rgba(199, 196, 215, 0.2)' : 'rgba(199, 196, 215, 0.5)', width: '85%' }]} />
          </View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  purpleBlur: {
    position: 'absolute',
    left: -59,
    top: -108,
    width: 195,
    height: 442,
    borderRadius: 9999,
    backgroundColor: '#6063ee',
    opacity: 0.15,
    zIndex: -1,
  },
  tealBlur: {
    position: 'absolute',
    right: -19,
    bottom: -68,
    width: 156,
    height: 353,
    borderRadius: 9999,
    backgroundColor: '#86f2e4',
    opacity: 0.15,
    zIndex: -1,
  },
  mainCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loaderSectionContainer: {
    height: 232,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loaderOuterCircle: {
    width: 192,
    height: 192,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rippleRing: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    borderWidth: 2,
    borderColor: '#4648D4',
  },
  loaderBaseCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(70, 72, 212, 0.08)',
  },
  orbitContainer: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitParticleTeal: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#006A61',
  },
  orbitParticleRed: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2C4F',
  },
  particle1: {
    top: 0,
    left: 78,
  },
  particle2: {
    bottom: 4,
    right: 32,
  },
  centerIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  textContent: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0B1C30',
    lineHeight: 40,
    letterSpacing: -0.8,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#464554',
    lineHeight: 29.25,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    opacity: 0.9,
  },
  progressSection: {
    width: 280,
    alignItems: 'center',
    gap: 12,
    marginBottom: 48,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#DCE9FF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4648D4',
    borderRadius: 3,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  indicatorSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finalizingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4648D4',
    letterSpacing: 1.2,
    fontFamily: 'Inter_600SemiBold',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4648D4',
  },
  skeletonContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 12,
  },
  skeletonCard: {
    flex: 1,
    height: 96,
    backgroundColor: '#E5EEFF',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'flex-end',
  },
  skeletonMargin: {
    height: 16,
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  skeletonShortLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C7C4D7',
    width: '70%',
  },
  skeletonLongLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(199, 196, 215, 0.5)',
    width: '100%',
  },
});
