import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInterestsList } from '@/hooks/useApi';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';

const TOPIC_STYLES: Record<string, {
  iconName: any;
  iconType: 'feather' | 'ionicons';
  iconColor: string;
  iconBg: string;
  selectedBg: string;
  darkSelectedBg: string;
  span?: boolean;
}> = {
  tech: { iconName: 'monitor', iconType: 'feather', iconColor: '#6063ee', iconBg: 'rgba(96, 99, 238, 0.08)', selectedBg: '#DDDEFC', darkSelectedBg: '#2A2A4D' },
  design: { iconName: 'color-palette-outline', iconType: 'ionicons', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.08)', selectedBg: '#CBDFE3', darkSelectedBg: '#1C3030' },
  sports: { iconName: 'basketball-outline', iconType: 'ionicons', iconColor: '#4648d4', iconBg: 'rgba(70, 72, 212, 0.08)', selectedBg: '#D8D9F7', darkSelectedBg: '#222244' },
  music: { iconName: 'music', iconType: 'feather', iconColor: '#E11D48', iconBg: 'rgba(225, 29, 72, 0.08)', selectedBg: '#F4D1DE', darkSelectedBg: '#3C1020' },
  art: { iconName: 'brush-outline', iconType: 'ionicons', iconColor: '#4648d4', iconBg: 'rgba(70, 72, 212, 0.08)', selectedBg: '#D8D9F7', darkSelectedBg: '#222244' },
  travel: { iconName: 'compass', iconType: 'feather', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.08)', selectedBg: '#CBDFE3', darkSelectedBg: '#1C3030' },
  food: { iconName: 'restaurant-outline', iconType: 'ionicons', iconColor: '#6063ee', iconBg: 'rgba(96, 99, 238, 0.08)', selectedBg: '#DDDEFC', darkSelectedBg: '#2A2A4D' },
  gaming: { iconName: 'game-controller-outline', iconType: 'ionicons', iconColor: '#006A61', iconBg: 'rgba(0, 106, 97, 0.08)', selectedBg: '#CBDFE3', darkSelectedBg: '#1C3030' },
  wellness: { iconName: 'heart', iconType: 'feather', iconColor: '#E11D48', iconBg: 'rgba(225, 29, 72, 0.08)', selectedBg: '#F4D1DE', darkSelectedBg: '#3C1020', span: true },
};

const MIN_SELECTIONS = 3;

export default function ProfileInterestsScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const CARD_WIDTH = (width - 40 - 16) / 2 - 1;

  const { data: interestsList = [], isLoading } = useInterestsList();

  const mappedTopics = interestsList.map((interest) => {
    const style = TOPIC_STYLES[interest.id] || {
      iconName: 'star-outline',
      iconType: 'ionicons' as const,
      iconColor: '#4648d4',
      iconBg: 'rgba(70, 72, 212, 0.08)',
      selectedBg: '#D8D9F7',
      darkSelectedBg: '#222244',
    };
    return {
      id: interest.id,
      name: interest.name,
      description: interest.description,
      ...style,
    };
  });

  const user = useAuthStore((state) => state.user);

  // Pre-select some defaults — in a real app you'd load from user profile
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    user?.interests && user.interests.length > 0 ? user.interests : ['sports', 'art', 'tech']
  );
  const cardScaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;
  const saveScale = useRef(new Animated.Value(1)).current;

  const handleCardPressIn = (id: string) => {
    if (!cardScaleAnims[id]) cardScaleAnims[id] = new Animated.Value(1);
    Animated.spring(cardScaleAnims[id], { toValue: 0.94, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handleCardPressOut = (id: string) => {
    if (!cardScaleAnims[id]) cardScaleAnims[id] = new Animated.Value(1);
    Animated.spring(cardScaleAnims[id], { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const isButtonDisabled = selectedTopics.length < MIN_SELECTIONS;

  const handleSave = () => {
    if (isButtonDisabled) return;

    useAuthStore.setState((prev) => ({
      user: prev.user ? { ...prev.user, interests: selectedTopics } : null
    }));

    Alert.alert(
      'Interests Saved!',
      `Your ${selectedTopics.length} interests have been updated.`,
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner fullScreen text="Loading interests..." colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Background blurs */}
      <View style={[styles.purpleBlur, { backgroundColor: isDark ? 'rgba(70, 72, 212, 0.12)' : 'rgba(70, 72, 212, 0.04)' }]} />
      <View style={[styles.tealBlur, { backgroundColor: isDark ? 'rgba(0, 106, 97, 0.12)' : 'rgba(0, 106, 97, 0.04)' }]} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.headerLeftButton, { backgroundColor: 'rgba(70, 72, 212, 0.05)' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Interests</Text>
        {/* Selection counter badge */}
        <View style={[styles.headerRight, { backgroundColor: selectedTopics.length >= MIN_SELECTIONS ? colors.primary : colors.border }]}>
          <Text style={styles.counterText}>{selectedTopics.length}</Text>
        </View>
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleSection}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select at least {MIN_SELECTIONS} topics to personalize your feed
        </Text>
      </View>

      {/* Interest Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bentoGrid}>
          {(() => {
            let singleItemCount = 0;
            return mappedTopics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              if (!cardScaleAnims[topic.id]) {
                cardScaleAnims[topic.id] = new Animated.Value(1);
              }
              const scale = cardScaleAnims[topic.id];
              const isSpan = !!topic.span;
              const marginRight = isSpan ? '0%' : (singleItemCount++ % 2 === 0 ? '6%' : '0%');

              return (
                <Pressable
                  key={topic.id}
                  onPressIn={() => handleCardPressIn(topic.id)}
                  onPressOut={() => handleCardPressOut(topic.id)}
                  onPress={() => toggleTopic(topic.id)}
                  style={[
                    isSpan ? styles.bentoCardSpan : styles.bentoCardSingle,
                    {
                      width: isSpan ? '100%' : '47%',
                      marginRight,
                      marginBottom: 16
                    }
                  ]}
                >
                <Animated.View
                  style={[
                    styles.cardInner,
                    isSelected
                      ? [
                        styles.cardSelected,
                        {
                          backgroundColor: isDark ? topic.darkSelectedBg : topic.selectedBg,
                          borderColor: topic.iconColor,
                          shadowColor: topic.iconColor,
                        },
                      ]
                      : [
                        styles.cardUnselected,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ],
                    { transform: [{ scale }] },
                  ]}
                >
                  {topic.span ? (
                    // Full-width span layout (Wellness)
                    <View style={styles.spanRow}>
                      <View style={[styles.iconContainer, { backgroundColor: isSelected ? topic.iconColor : topic.iconBg }]}>
                        {topic.iconType === 'feather' ? (
                          <Feather name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                        ) : (
                          <Ionicons name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                        )}
                      </View>
                      <View style={styles.spanTextContainer}>
                        <View style={styles.spanTitleRow}>
                          <Text style={[styles.cardTitle, { color: colors.text }]}>{topic.name}</Text>
                          {isSelected && <Ionicons name="checkmark-circle" size={20} color={topic.iconColor} />}
                        </View>
                        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{topic.description}</Text>
                      </View>
                    </View>
                  ) : (
                    // Normal 2-column bento card
                    <View style={styles.singleLayout}>
                      <View style={styles.singleTopRow}>
                        <View style={[styles.iconContainer, { backgroundColor: isSelected ? topic.iconColor : topic.iconBg }]}>
                          {topic.iconType === 'feather' ? (
                            <Feather name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                          ) : (
                            <Ionicons name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                          )}
                        </View>
                        <View style={styles.spanTextContainer}>
                          <View style={styles.spanTitleRow}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>{topic.name}</Text>
                            {isSelected && <Ionicons name="checkmark-circle" size={20} color={topic.iconColor} />}
                          </View>
                          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{topic.description}</Text>
                        </View>
                      </View>
                    ) : (
                      // Normal 2-column bento card
                      <View style={styles.singleLayout}>
                        <View style={styles.singleTopRow}>
                          <View style={[styles.iconContainer, { backgroundColor: isSelected ? topic.iconColor : topic.iconBg }]}>
                            {topic.iconType === 'feather' ? (
                              <Feather name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                            ) : (
                              <Ionicons name={topic.iconName} size={20} color={isSelected ? '#FFF' : topic.iconColor} />
                            )}
                          </View>
                        </View>
                        <View style={styles.singleTitleRow}>
                          <Text style={[styles.cardTitle, { color: colors.text }]}>{topic.name}</Text>
                          {isSelected && <Ionicons name="checkmark-circle" size={20} color={topic.iconColor} />}
                        </View>
                      </View>
                    </View>
                  )}
                </Animated.View>
              </Pressable>
              );
            });
          })()}
        </View>
      </ScrollView>

      {/* Save Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16, borderTopColor: colors.border }]}>
        {isButtonDisabled && (
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            Select {MIN_SELECTIONS - selectedTopics.length} more to continue
          </Text>
        )}
        <Animated.View style={{ transform: [{ scale: saveScale }] }}>
          <Pressable
            style={[styles.saveButton, isButtonDisabled && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isButtonDisabled}
            onPressIn={() => Animated.spring(saveScale, { toValue: 0.95, useNativeDriver: true, tension: 180, friction: 12 }).start()}
            onPressOut={() => Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start()}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>
              {isButtonDisabled
                ? `Select ${MIN_SELECTIONS - selectedTopics.length} more`
                : `Save Interests (${selectedTopics.length} selected)`}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  purpleBlur: {
    position: 'absolute',
    right: -39,
    top: -98,
    width: 156,
    height: 393.59,
    borderRadius: 9999,
    zIndex: -1,
  },
  tealBlur: {
    position: 'absolute',
    left: -19.5,
    bottom: -49.19,
    width: 117,
    height: 295.19,
    borderRadius: 9999,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerLeftButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  headerRight: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  subtitleSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  bentoCardSingle: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
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
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  hintText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  saveButton: {
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#4648D4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#A5A6F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});