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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Language {
  id: string;
  name: string;
}

const LANGUAGES: Language[] = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
  { id: 'de', name: 'German' },
  { id: 'hi', name: 'Hindi' },
  { id: 'ja', name: 'Japanese' },
];

interface LanguageCardProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

function LanguageCard({ name, isSelected, onPress }: LanguageCardProps) {
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
    >
      <Animated.View
        style={[
          styles.languageCard,
          isSelected ? styles.languageCardSelected : styles.languageCardUnselected,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>{name}</Text>

        <View
          style={[
            styles.radioOuter,
            isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected,
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function LanguageScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

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

  const handleContinue = () => {
    router.push('/(onboarding)/location');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Simulated Background Blur Vectors */}
      <View style={styles.purpleBlur} />
      <View style={styles.tealBlur} />

      {/* Header Container */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#0B1C30" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>HyperLocal</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Headline Section */}
        <View style={styles.headlineSection}>
          <Text style={styles.mainTitle}>Choose your language</Text>
          <Text style={styles.subtitle}>
            Select your preferred language to read stories.
          </Text>
        </View>

        {/* Language Cards Grid */}
        <View style={styles.languageList}>
          {LANGUAGES.map((language) => (
            <LanguageCard
              key={language.id}
              name={language.name}
              isSelected={selectedLanguage === language.id}
              onPress={() => setSelectedLanguage(language.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
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
    fontSize: 32,
    fontWeight: '700',
    color: '#4648D4',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
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
    marginBottom: 40,
    gap: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0B1C30',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464554',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  languageList: {
    gap: 16,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 26,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  languageCardSelected: {
    backgroundColor: '#EAEBFE',
    borderColor: '#4648D4',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  languageCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(199, 196, 215, 0.3)',
  },
  languageName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0B1C30',
    fontFamily: 'Inter_500Medium',
    lineHeight: 28,
  },
  languageNameSelected: {
    color: '#4648D4',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    backgroundColor: '#4648D4',
    borderColor: '#4648D4',
  },
  radioOuterUnselected: {
    borderColor: '#C7C4D7',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: '#F8F9FF',
  },
  continueButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#4648D4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 28,
  },
  continueIcon: {
    marginLeft: 8,
    marginTop: 2,
  },
});