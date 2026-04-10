import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - Spacing.lg * 2 - Spacing.sm * 2) / 3;

interface Topic {
  id: string;
  name: string;
  emoji: string;
}

const TOPICS: Topic[] = [
  { id: 'politics', name: 'Politics', emoji: '🏛️' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'business', name: 'Business', emoji: '💼' },
  { id: 'tech', name: 'Tech', emoji: '💻' },
  { id: 'health', name: 'Health', emoji: '🏥' },
  { id: 'showbiz', name: 'Showbiz', emoji: '🎬' },
  { id: 'local', name: 'Local', emoji: '📍' },
  { id: 'national', name: 'National', emoji: '🇮🇳' },
  { id: 'crime', name: 'Crime', emoji: '🚔' },
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'weather', name: 'Weather', emoji: '🌤️' },
  { id: 'lifestyle', name: 'Lifestyle', emoji: '✨' },
];

const MIN_SELECTIONS = 3;

export default function InterestsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'politics',
    'sports',
    'local',
  ]);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      }
      return [...prev, topicId];
    });
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleContinue = () => {
    if (selectedTopics.length >= MIN_SELECTIONS) {
      router.push('/(onboarding)/complete');
    }
  };

  const isButtonDisabled = selectedTopics.length < MIN_SELECTIONS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Background Decoration */}
      <View style={[styles.bgDecoration1, { backgroundColor: colors.primaryLight }]} />
      <View style={[styles.bgDecoration2, { backgroundColor: colors.primaryLight }]} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background + 'E6' }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={[styles.stepText, { color: colors.textTertiary }]}>
          Step 3 of 4
        </Text>

        <View style={styles.spacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            What interests you?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select at least {MIN_SELECTIONS} topics to personalize your hyperlocal feed.
          </Text>
        </View>

        {/* Topics Grid */}
        <View style={styles.topicsGrid}>
          {TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id);

            return (
              <TouchableOpacity
                key={topic.id}
                style={[
                  styles.topicCard,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderColor: isSelected ? colors.primary : 'transparent',
                  },
                  !isSelected && Shadows.sm,
                ]}
                onPress={() => toggleTopic(topic.id)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                    <MaterialIcons name="check" size={12} color="#FFF" />
                  </View>
                )}
                <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                <Text
                  style={[
                    styles.topicName,
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                >
                  {topic.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Bar - Fixed at bottom */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        {/* Counter */}
        <View
          style={[
            styles.counterBadge,
            {
              backgroundColor: colors.primaryLight,
              borderColor: colors.primary + '30',
            },
          ]}
        >
          <Text style={[styles.counterText, { color: colors.primary }]}>
            {selectedTopics.length} selected
          </Text>
        </View>

        {/* Continue Button */}
        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
          <Pressable
            style={[
              styles.continueButton,
              {
                backgroundColor: isButtonDisabled ? colors.textTertiary : colors.primary,
              },
              !isButtonDisabled && Shadows.primaryGlow,
            ]}
            onPress={handleContinue}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isButtonDisabled}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </Animated.View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDecoration1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  spacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  titleSection: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  topicCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  topicName: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
  counterBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  buttonWrapper: {
    width: '100%',
  },
  continueButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  homeIndicatorContainer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  homeIndicator: {
    width: 128,
    height: 5,
    borderRadius: 100,
  },
});