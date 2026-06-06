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
  DimensionValue,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useLanguagesList } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

interface LanguageCardProps {
  name: string;
  glyph: string;
  isSelected: boolean;
  onPress: () => void;
  width?: DimensionValue;
  marginRight?: DimensionValue;
  marginBottom?: DimensionValue;
}

function LanguageCard({ name, glyph, isSelected, onPress, width, marginRight, marginBottom }: LanguageCardProps) {
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
      style={[styles.cardContainer, { width, marginRight, marginBottom }]}
    >
      <Animated.View
        style={[
          styles.languageCard,
          isSelected ? styles.languageCardSelected : styles.languageCardUnselected,
          {
            backgroundColor: isSelected
              ? isDark ? '#2A2A4D' : '#E6E7FB'
              : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          { transform: [{ scale }] },
        ]}
      >
        {/* Selection Indicator */}
        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          </View>
        )}

        {/* Script Preview Circle */}
        <View
          style={[
            styles.glyphCircle,
            {
              backgroundColor: isSelected ? colors.primary : isDark ? '#2A2A3C' : '#F1F5F9',
              borderColor: isSelected ? colors.primary : colors.border,
            },
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
            isSelected && styles.languageNameSelected,
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function SettingsLanguageScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: languagesList = [], isLoading } = useLanguagesList();
  const { user, updateLanguage } = useAuthStore();

  // Find the current language id from the user's stored language name
  const currentLangId = languagesList.find(l => l.name === user?.language)?.id ?? 'en';
  const [selectedLanguage, setSelectedLanguage] = useState(currentLangId);

  const saveScale = useRef(new Animated.Value(1)).current;

  const handleSavePressIn = () => {
    Animated.spring(saveScale, { toValue: 0.95, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handleSavePressOut = () => {
    Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 12 }).start();
  };

  const handleSave = () => {
    const matched = languagesList.find(l => l.id === selectedLanguage);
    if (matched) {
      updateLanguage(matched.name);
    }
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner fullScreen text="Loading languages..." colorScheme={colorScheme ?? 'light'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Background Blurs */}
      <View style={[styles.purpleBlur, { backgroundColor: colorScheme === 'dark' ? 'rgba(70, 72, 212, 0.12)' : 'rgba(70, 72, 212, 0.04)' }]} />
      <View style={[styles.tealBlur, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 106, 97, 0.12)' : 'rgba(0, 106, 97, 0.04)' }]} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.headerLeftButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Language</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleSection}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select your preferred language to read stories
        </Text>
      </View>

      {/* Language Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.gridContainer}>
          {(() => {
            let singleCount = 0;
            return languagesList.map((language) => {
              const marginRight = singleCount++ % 2 === 0 ? '6%' : '0%';
              return (
                <LanguageCard
                  key={language.id}
                  name={language.name}
                  glyph={language.glyph ?? ''}
                  isSelected={selectedLanguage === language.id}
                  onPress={() => setSelectedLanguage(language.id)}
                  width="47%"
                  marginRight={marginRight}
                  marginBottom={16}
                />
              );
            });
          })()}
        </View>
      </ScrollView>

      {/* Save Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        <Animated.View style={{ transform: [{ scale: saveScale }] }}>
          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
            onPressIn={handleSavePressIn}
            onPressOut={handleSavePressOut}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
    backgroundColor: 'rgba(70, 72, 212, 0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  subtitleSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  languageCardSelected: {
    borderColor: '#4648D4',
    shadowOpacity: 0.15,
    elevation: 3,
  },
  languageCardUnselected: {
    borderColor: 'rgba(199, 196, 215, 0.3)',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    zIndex: 1,
  },
  glyphCircle: {
    width: 52,
    height: 52,
    borderRadius: 40,
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
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});
