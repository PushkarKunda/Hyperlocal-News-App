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
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

interface DropdownOption {
  label: string;
  value: string;
}

const STATES: DropdownOption[] = [
  { label: 'Telangana', value: 'telangana' },
  { label: 'Andhra Pradesh', value: 'andhra' },
  { label: 'Karnataka', value: 'karnataka' },
  { label: 'Tamil Nadu', value: 'tamil_nadu' },
];

const DISTRICTS: DropdownOption[] = [
  { label: 'Hyderabad', value: 'hyderabad' },
  { label: 'Warangal', value: 'warangal' },
  { label: 'Nizamabad', value: 'nizamabad' },
  { label: 'Karimnagar', value: 'karimnagar' },
];

const CITIES: DropdownOption[] = [
  { label: 'Kukatpally', value: 'kukatpally' },
  { label: 'Banjara Hills', value: 'banjara_hills' },
  { label: 'Gachibowli', value: 'gachibowli' },
  { label: 'Hitech City', value: 'hitech_city' },
];

interface SelectFieldProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  colors: typeof Colors.light;
}

function SelectField({ label, value, options, onSelect, colors }: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.selectContainer}>
      <Text style={[styles.selectLabel, { color: colors.textTertiary }]}>
        {label}
      </Text>
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectValue, { color: colors.text }]}>
          {selectedOption?.label || 'Select'}
        </Text>
        <MaterialIcons
          name={isOpen ? 'expand-less' : 'expand-more'}
          size={24}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            Shadows.md,
          ]}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownOption,
                value === option.value && { backgroundColor: colors.primaryLight },
              ]}
              onPress={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  { color: colors.text },
                  value === option.value && { color: colors.primary, fontWeight: '600' },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function LocationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [state, setState] = useState('telangana');
  const [district, setDistrict] = useState('hyderabad');
  const [city, setCity] = useState('kukatpally');

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
    // Navigate to interests instead of tabs
    router.push('/(onboarding)/interests');
  };

  const handleUseCurrentLocation = () => {
    // Will implement location permission later
    console.log('Use current location');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.background }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.stepIndicatorRight}>
          <Text style={[styles.stepText, { color: colors.textTertiary }]}>
            STEP 2 OF 4
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarInner,
                { backgroundColor: colors.background },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.primary, width: '50%' },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            Select Your Location
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Get news from your area delivered straight to your feed.
          </Text>
        </View>

        {/* Selection Form */}
        <View style={styles.formSection}>
          <SelectField
            label="STATE"
            value={state}
            options={STATES}
            onSelect={setState}
            colors={colors}
          />

          <SelectField
            label="DISTRICT"
            value={district}
            options={DISTRICTS}
            onSelect={setDistrict}
            colors={colors}
          />

          <SelectField
            label="CITY / AREA"
            value={city}
            options={CITIES}
            onSelect={setCity}
            colors={colors}
          />
        </View>

        {/* GPS Button */}
        <TouchableOpacity
          style={[styles.gpsButton, { backgroundColor: colors.primaryLight }]}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.7}
        >
          <MaterialIcons name="my-location" size={20} color={colors.primary} />
          <Text style={[styles.gpsButtonText, { color: colors.primary }]}>
            Use Current Location
          </Text>
        </TouchableOpacity>

        {/* Map Illustration */}
        <View style={styles.mapContainer}>
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.background }]}>
            <MaterialIcons name="map" size={48} color={colors.textTertiary} />
          </View>
          <LinearGradient
            colors={[
              'transparent',
              colorScheme === 'dark' ? colors.surface : colors.surface,
            ]}
            style={styles.mapGradient}
          />
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
          You can change your location preferences anytime in settings.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorRight: {
    alignItems: 'flex-end',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    width: 96,
  },
  progressBarInner: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
  formSection: {
    gap: Spacing.md,
  },
  selectContainer: {
    zIndex: 1,
  },
  selectLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  selectButton: {
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  selectValue: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  gpsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  mapContainer: {
    height: 128,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  mapGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  continueButton: {
    height: 64,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  footerNote: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  homeIndicatorContainer: {
    paddingBottom: Spacing.xs,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 128,
    height: 4,
    borderRadius: 100,
  },
});