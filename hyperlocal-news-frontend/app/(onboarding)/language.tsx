import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useLanguagesList } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

import { Language } from '@/types';


interface LanguageCardProps {
  name: string;
  glyph: string;
  isSelected: boolean;
  onPress: () => void;
}

function LanguageCard({ name, glyph, isSelected, onPress }: LanguageCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <Animated.View
        style={[
          styles.languageCard,
          isSelected ? styles.languageCardSelected : styles.languageCardUnselected,
          {
            backgroundColor: isSelected 
              ? (isDark ? '#2A2A4D' : '#E6E7FB') 
              : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          { transform: [{ scale }] },
        ]}
      >
        {/* Sleek Selection Indicator in Top Right Corner */}
        {isSelected && (
          <View style={[styles.checkBadge, { backgroundColor: 'transparent' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          </View>
        )}

        {/* Large Script Preview Circle */}
        <View 
          style={[
            styles.glyphCircle, 
            { 
              backgroundColor: isSelected ? colors.primary : (isDark ? '#2A2A3C' : '#F1F5F9'),
              borderColor: isSelected ? colors.primary : colors.border,
            }
          ]}
        >
          <Text style={[styles.glyphText, { color: isSelected ? '#FFFFFF' : colors.primary }]}>
            {glyph}
          </Text>
        </View>

        {/* Language Name */}
        <Text 
          style={[
            styles.languageName, 
            { color: isSelected ? colors.primary : colors.text },
            isSelected && styles.languageNameSelected
          ]} 
          numberOfLines={1}
        >
          {name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function LanguageScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { data: languagesList = [], isLoading } = useLanguagesList();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleContinuePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleContinuePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const { updateLanguage } = useAuthStore();

  const handleContinue = () => {
    const matchedLanguage = languagesList.find(l => l.id === selectedLanguage);
    if (matchedLanguage) {
      updateLanguage(matchedLanguage.name);
    }
    router.push('/(onboarding)/location');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner fullScreen text="Loading languages..." colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Simulated Background Blur Vectors */}
      <View style={[styles.purpleBlur, { backgroundColor: colorScheme === 'dark' ? 'rgba(70, 72, 212, 0.12)' : 'rgba(70, 72, 212, 0.05)' }]} />
      <View style={[styles.tealBlur, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 106, 97, 0.12)' : 'rgba(0, 106, 97, 0.05)' }]} />

      {/* Header Container */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <View style={styles.headerSpacer} />

        <Text style={[styles.headerTitle, { color: colors.primary }]}>HyperLocal</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Headline Section */}
        <View style={styles.headlineSection}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>Choose your language</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select your preferred language to read stories.
          </Text>
        </View>

        {/* Bento Grid of Language Cards */}
        <View style={styles.gridContainer}>
          {languagesList.map((language) => (
            <LanguageCard
              key={language.id}
              name={language.name}
              glyph={language.glyph ?? ''}
              isSelected={selectedLanguage === language.id}
              onPress={() => setSelectedLanguage(language.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={styles.continueButton}
            onPress={handleContinue}
            onPressIn={handleContinuePressIn}
            onPressOut={handleContinuePressOut}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" style={styles.continueIcon} />
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
  purpleBlur: {
    position: 'absolute',
    right: -39,
    top: -98,
    width: 156,
    height: 393.59,
    borderRadius: 9999,
    backgroundColor: 'rgba(70, 72, 212, 0.05)',
    zIndex: -1,
  },
  tealBlur: {
    position: 'absolute',
    left: -19.5,
    bottom: -49.19,
    width: 117,
    height: 295.19,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 106, 97, 0.05)',
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(199, 196, 215, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4648D4',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  headlineSection: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.64,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464554',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardContainer: {
    width: '47.5%',
    height: 130,
  },
  languageCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'solid',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  languageCardSelected: {
    backgroundColor: '#E6E7FB',
    borderColor: '#4648D4',
    borderStyle: 'solid',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  languageCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderStyle: 'solid',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    zIndex: 1,
  },
  glyphCircle: {
    width: 52,
    height: 52,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E6E7FB',
  },
  glyphText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  languageName: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  languageNameSelected: {
    color: '#4648D4',
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: '#F8F9FF',
  },
  continueButton: {
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
  continueButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 28,
  },
  continueIcon: {
    marginLeft: 8,
    marginTop: 2,
  },
});