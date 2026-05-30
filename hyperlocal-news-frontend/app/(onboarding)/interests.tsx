import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInterestsList } from '@/hooks/useApi';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

const { width } = Dimensions.get('window');

// Responsive bento grid calculation
// Total screen padding = 40 (20 left, 20 right)
// Gap between cards = 16
const CARD_WIDTH = (width - 40 - 16) / 2;

interface Topic {
  id: string;
  name: string;
  iconName: any;
  iconType: 'feather' | 'ionicons';
  iconColor: string;
  iconBg: string;
  selectedBg: string;
  description?: string;
  span?: boolean;
}

const TOPIC_STYLES: Record<string, {
  iconName: any;
  iconType: 'feather' | 'ionicons';
  iconColor: string;
  iconBg: string;
  selectedBg: string;
  span?: boolean;
}> = {
  tech: { iconName: 'monitor', iconType: 'feather', iconColor: '#6063ee', iconBg: 'rgba(96, 99, 238, 0.06)', selectedBg: '#DDDEFC' },
  design: { iconName: 'color-palette-outline', iconType: 'ionicons', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.06)', selectedBg: '#CBDFE3' },
  sports: { iconName: 'basketball-outline', iconType: 'ionicons', iconColor: '#4648d4', iconBg: 'rgba(70, 72, 212, 0.06)', selectedBg: '#D8D9F7' },
  music: { iconName: 'music', iconType: 'feather', iconColor: '#E11D48', iconBg: 'rgba(225, 29, 72, 0.06)', selectedBg: '#F4D1DE' },
  art: { iconName: 'brush-outline', iconType: 'ionicons', iconColor: '#4648d4', iconBg: 'rgba(70, 72, 212, 0.06)', selectedBg: '#D8D9F7' },
  travel: { iconName: 'compass', iconType: 'feather', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.06)', selectedBg: '#CBDFE3' },
  wellness: { iconName: 'heart', iconType: 'feather', iconColor: '#E11D48', iconBg: 'rgba(225, 29, 72, 0.06)', selectedBg: '#F4D1DE', span: true },
  food: { iconName: 'restaurant-outline', iconType: 'ionicons', iconColor: '#6063ee', iconBg: 'rgba(96, 99, 238, 0.06)', selectedBg: '#DDDEFC' },
  gaming: { iconName: 'game-controller-outline', iconType: 'ionicons', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.06)', selectedBg: '#CBDFE3' },
};

const MIN_SELECTIONS = 3;

export default function InterestsScreen() {
  const router = useRouter();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Load onboarding topics list dynamically from simulated backend
  const { data: interestsList = [], isLoading } = useInterestsList();

  // Map dynamically loaded interests to their gorgeous custom design attributes
  const mappedTopics = interestsList.map((interest) => {
    const style = TOPIC_STYLES[interest.id] || {
      iconName: 'star-outline',
      iconType: 'ionicons',
      iconColor: '#4648d4',
      iconBg: 'rgba(70, 72, 212, 0.06)',
      selectedBg: '#D8D9F7',
    };
    return {
      id: interest.id,
      name: interest.name,
      description: interest.description,
      ...style,
    };
  });

  // Pre-select 'sports' and 'art' as shown in the Figma mockup (making it 2/3 selected initially)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'sports',
    'art',
  ]);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardScaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;



  const handleCardPressIn = (topicId: string) => {
    if (!cardScaleAnims[topicId]) {
      cardScaleAnims[topicId] = new Animated.Value(1);
    }
    Animated.spring(cardScaleAnims[topicId], {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleCardPressOut = (topicId: string) => {
    if (!cardScaleAnims[topicId]) {
      cardScaleAnims[topicId] = new Animated.Value(1);
    }
    Animated.spring(cardScaleAnims[topicId], {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      }
      return [...prev, topicId];
    });
  };

  const animateButton = (toValue: number) => {
    Animated.spring(buttonScale, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleContinue = () => {
    if (selectedTopics.length >= MIN_SELECTIONS) {
      router.push('/(auth)/login');
    }
  };

  const isButtonDisabled = selectedTopics.length < MIN_SELECTIONS;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header - Top AppBar */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.primary }]}>HyperLocal</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Headline Section */}
        <View style={styles.headlineSection}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            What are you{'\n'}interested in?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select at least {MIN_SELECTIONS} to customize your feed
          </Text>
        </View>

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>
          {mappedTopics.map((topic) => {

            const isSelected = selectedTopics.includes(topic.id);
            if (!cardScaleAnims[topic.id]) {
              cardScaleAnims[topic.id] = new Animated.Value(1);
            }
            const scale = cardScaleAnims[topic.id];

            return (
              <Pressable
                key={topic.id}
                onPressIn={() => handleCardPressIn(topic.id)}
                onPressOut={() => handleCardPressOut(topic.id)}
                onPress={() => toggleTopic(topic.id)}
                style={topic.span ? styles.bentoCardSpan : styles.bentoCardSingle}
              >
                <Animated.View
                  style={[
                    styles.cardInner,
                    isSelected 
                      ? [
                          styles.cardSelected,
                          {
                            backgroundColor: isDark ? '#2A2A4D' : topic.selectedBg,
                            borderColor: topic.iconColor,
                            shadowColor: topic.iconColor,
                          }
                        ]
                      : [
                          styles.cardUnselected,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          }
                        ],
                    { transform: [{ scale }] }
                  ]}
                >
                  {topic.span ? (
                    // Wellness Spanning Layout
                    <View style={styles.spanRow}>
                      <View style={[
                        styles.iconContainer,
                        isSelected ? { backgroundColor: topic.iconColor } : { backgroundColor: topic.iconBg }
                      ]}>
                        {topic.iconType === 'feather' ? (
                          <Feather name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                        ) : (
                          <Ionicons name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                        )}
                      </View>
                      
                      <View style={styles.spanTextContainer}>
                        <View style={styles.spanTitleRow}>
                          <Text style={[styles.cardTitle, { color: colors.text }]}>{topic.name}</Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color={topic.iconColor} />
                          )}
                        </View>
                        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{topic.description}</Text>
                      </View>
                    </View>
                  ) : (
                    // Single Bento Box Layout
                    <View style={styles.singleLayout}>
                      <View style={styles.singleTopRow}>
                        <View style={[
                          styles.iconContainer,
                          isSelected ? { backgroundColor: topic.iconColor } : { backgroundColor: topic.iconBg }
                        ]}>
                          {topic.iconType === 'feather' ? (
                            <Feather name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                          ) : (
                            <Ionicons name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.singleTitleRow}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{topic.name}</Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={topic.iconColor} />
                        )}
                      </View>
                    </View>
                  )}
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Footer */}
      <View style={[styles.bottomBar, { backgroundColor: isDark ? 'rgba(17, 17, 34, 0.95)' : 'rgba(248, 249, 255, 0.95)', borderTopColor: colors.border }]}>
        {/* Progress Stepper Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.activeStepIndicator} />
          <View style={[styles.inactiveStepIndicator, { backgroundColor: colors.border }]} />
          <View style={[styles.inactiveStepIndicator, { backgroundColor: colors.border }]} />
        </View>

        {/* Continue Button */}
        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
          <Pressable
            style={[
              styles.continueButton,
              isButtonDisabled ? styles.continueButtonDisabled : styles.continueButtonActive,
            ]}
            onPressIn={() => animateButton(0.96)}
            onPressOut={() => animateButton(1)}
            onPress={handleContinue}
            disabled={isButtonDisabled}
          >
            <Text style={styles.continueButtonText}>
              {isButtonDisabled
                ? `Continue (${selectedTopics.length}/${MIN_SELECTIONS} selected)`
                : 'Continue'
              }
            </Text>
            <Feather name="chevron-right" size={16} color="#FFF" style={styles.btnChevron} />
          </Pressable>
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
  header: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FF',
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4648D4',
    fontFamily: 'Inter_700Bold',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 160, // Large space for the fixed footer overlay!
  },
  headlineSection: {
    marginBottom: 40,
    width: '100%',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0B1C30',
    letterSpacing: -0.64,
    lineHeight: 40,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464554',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  bentoCardSingle: {
    width: CARD_WIDTH,
    height: 140,
  },
  bentoCardSpan: {
    width: '100%',
    height: 100,
  },
  cardInner: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
  },
  cardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(199, 196, 215, 0.3)',
  },
  cardSelected: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  singleLayout: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  singleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#4648D4',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0B1C30',
    fontFamily: 'Inter_600SemiBold',
  },
  singleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  spanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: '100%',
  },
  spanTextContainer: {
    flex: 1,
  },
  spanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: '#464554',
    fontFamily: 'Inter_400Regular',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(199, 196, 215, 0.3)',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
    gap: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeStepIndicator: {
    backgroundColor: '#4648D4',
    width: 40,
    height: 6,
    borderRadius: 3,
  },
  inactiveStepIndicator: {
    backgroundColor: '#C7C4D7',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  buttonWrapper: {
    width: '100%',
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#A5A6F6', // Beautiful premium translucent indigo
  },
  continueButtonActive: {
    backgroundColor: '#4648D4',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold',
  },
  btnChevron: {
    marginTop: 1,
  },
});