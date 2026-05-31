import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

const { width: screenWidth } = Dimensions.get('window');

export default function EventSuccessScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(20, insets.top) }]}>
      {/* Success Content Container */}
      <View style={styles.contentContainer}>
        
        {/* Icon & Confetti Area */}
        <View style={styles.iconConfettiWrapper}>
          {/* Abstract Confetti Shapes */}
          {/* Yellow Circle - Top Left */}
          <View style={[styles.confettiCircle, { backgroundColor: '#FACC15', top: -12, left: -28 }]} />
          
          {/* Pink Square - Mid Left */}
          <View style={[styles.confettiSquare, { backgroundColor: '#F472B6', top: 40, left: -44 }]} />
          
          {/* Blue Pill - Top Mid */}
          <View style={[styles.confettiPill, { backgroundColor: '#60A5FA', top: -38, left: 20, transform: [{ rotate: '45deg' }] }]} />
          
          {/* Green Square - Mid Right */}
          <View style={[styles.confettiSquare, { backgroundColor: '#4ADE80', top: 12, right: -36, transform: [{ rotate: '-12deg' }] }]} />
          
          {/* Orange Circle - Bottom Right */}
          <View style={[styles.confettiCircle, { backgroundColor: '#FB923C', bottom: 4, right: -40, width: 12, height: 12, borderRadius: 6 }]} />
          
          {/* Purple Pill - Bottom Left */}
          <View style={[styles.confettiPill, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.6)' : 'rgba(70, 72, 212, 0.4)', bottom: -28, left: 10, transform: [{ rotate: '-45deg' }] }]} />

          {/* Main Success Circle */}
          <View style={[styles.successCircleOuter, { backgroundColor: colors.primaryLight }]}>
            <View style={[styles.successCircleInner, { backgroundColor: colors.primary }, Shadows.glow]}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Headline Group */}
        <View style={styles.headlineGroup}>
          <Text style={[styles.heading, { color: colors.text }]}>Event Submitted!</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Thank you for contributing to your community.
          </Text>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? colors.surface : '#F9FAFB', borderColor: colors.border }]}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="time" size={20} color={colors.primary} style={styles.clockIcon} />
            <Text style={[styles.infoCardTitle, { color: colors.text }]}>What's next?</Text>
          </View>
          <Text style={[styles.infoCardDescription, { color: colors.textSecondary }]}>
            Our team will review your event within 24 hours. Once approved, it will be visible to everyone in your neighborhood.
          </Text>
        </View>

      </View>

      {/* Action Buttons Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }, Shadows.primaryGlow]}
          activeOpacity={0.85}
          onPress={() => router.replace('/events' as any)}
        >
          <Text style={styles.primaryButtonText}>View My Events</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => router.replace('/' as any)}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconConfettiWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  successCircleOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircleInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiCircle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    opacity: 0.6,
  },
  confettiSquare: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 3,
    opacity: 0.6,
  },
  confettiPill: {
    position: 'absolute',
    width: 20,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  headlineGroup: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 36,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 342,
    gap: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clockIcon: {
    marginTop: -1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  infoCardDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  secondaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});
