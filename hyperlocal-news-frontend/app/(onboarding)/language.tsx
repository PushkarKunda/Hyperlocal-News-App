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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

interface Language {
  id: string;
  name: string;
  nativeName: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const LANGUAGES: Language[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: '',
    description: 'Read news in English',
    icon: 'translate',
  },
  {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    description: 'తెలుగులో వార్తలను చదవండి',
    icon: 'language',
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    description: 'हिंदी में समाचार पढ़ें',
    icon: 'public',
  },
];

export default function LanguageScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const buttonScale = useRef(new Animated.Value(1)).current;

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
    router.push('/(onboarding)/location');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={[styles.statusTime, { color: colors.text }]}>9:41</Text>
        <View style={styles.statusIcons}>
          <MaterialIcons name="signal-cellular-alt" size={14} color={colors.text} />
          <MaterialIcons name="wifi" size={14} color={colors.text} />
          <MaterialIcons name="battery-full" size={14} color={colors.text} />
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.stepIndicator}>
          <Text style={[styles.stepText, { color: colors.primary }]}>
            STEP 1 OF 4
          </Text>
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.dotActive, { backgroundColor: colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
          </View>
        </View>

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
            Choose Your Language
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select your preferred language for news updates
          </Text>
        </View>

        {/* Language Cards */}
        <View style={styles.languageList}>
          {LANGUAGES.map((language) => {
            const isSelected = selectedLanguage === language.id;
            
            return (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageCard,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedLanguage(language.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.languageIcon,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={language.icon}
                    size={24}
                    color={isSelected ? '#FFF' : colors.textSecondary}
                  />
                </View>

                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text }]}>
                    {language.name}
                    {language.nativeName ? ` (${language.nativeName})` : ''}
                  </Text>
                  <Text style={[styles.languageDesc, { color: colors.textSecondary }]}>
                    {language.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: isSelected ? colors.primary : colors.border },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={[
              styles.continueButton,
              { backgroundColor: colors.primary },
              Shadows.primaryGlow,
            ]}
            onPress={handleContinue}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
        </Animated.View>

        <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
          You can change your language preferences later in the application settings.
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
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  statusTime: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: BorderRadius.full,
  },
  dotActive: {
    // Active styles applied inline
  },
  spacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing['2xl'],
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
  },
  languageList: {
    gap: Spacing.md,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
  },
  languageIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  languageDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  continueButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  footerNote: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },
  homeIndicatorContainer: {
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 128,
    height: 5,
    borderRadius: 100,
  },
});