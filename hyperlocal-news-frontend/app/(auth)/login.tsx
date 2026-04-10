import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN' },
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'AU' },
];

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
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

  const handleSendOTP = () => {
    if (phoneNumber.length < 10) {
      // Show error - we'll add proper validation later
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: `${selectedCountry.code}${phoneNumber}` },
      });
    }, 1000);
  };

  const handleGuestLogin = () => {
    router.replace('/(tabs)');
    // Guest skips OTP but still needs to select preferences
    //router.replace('/(onboarding)/language');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Status Bar Simulation */}
      <View style={styles.statusBar}>
        <Text style={[styles.statusTime, { color: colors.text }]}>9:41</Text>
        <View style={styles.statusIcons}>
          <MaterialIcons name="signal-cellular-alt" size={16} color={colors.text} />
          <MaterialIcons name="wifi" size={16} color={colors.text} />
          <MaterialIcons name="battery-full" size={16} color={colors.text} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight }]}>
              <MaterialIcons name="newspaper" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Welcome to HyperLocal News
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your neighborhood, your news.
            </Text>
          </View>

          {/* Phone Input Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Phone Number
            </Text>

            <View style={styles.phoneInputRow}>
              {/* Country Code Picker */}
              <TouchableOpacity
                style={[
                  styles.countryPicker,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowCountryPicker(!showCountryPicker)}
                activeOpacity={0.7}
              >
                <Text style={[styles.countryCode, { color: colors.text }]}>
                  {selectedCountry.code}
                </Text>
                <MaterialIcons
                  name="expand-more"
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>

              {/* Phone Number Input */}
              <View
                style={[
                  styles.phoneInputContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.phoneInput, { color: colors.text }]}
                  placeholder="Enter mobile number"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            <Text style={[styles.helperText, { color: colors.textTertiary }]}>
              We'll send a 6-digit OTP via SMS for verification.
            </Text>
          </View>

          {/* Country Picker Dropdown */}
          {showCountryPicker && (
            <View
              style={[
                styles.countryDropdown,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  ...Shadows.md,
                },
              ]}
            >
              {COUNTRY_CODES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryOption,
                    selectedCountry.code === country.code && {
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.countryOptionText,
                      { color: colors.text },
                      selectedCountry.code === country.code && {
                        color: colors.primary,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {country.code} ({country.country})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Send OTP Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleSendOTP}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Text>
              {!isLoading && (
                <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
              )}
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Guest Button */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor: colors.border,
              },
            ]}
            onPress={handleGuestLogin}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Social Login Icons */}
          <View style={styles.socialSection}>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={styles.socialIcon}>
                <MaterialIcons name="apple" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <MaterialIcons name="mail" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <MaterialIcons name="facebook" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Terms Text */}
            <Text style={[styles.termsText, { color: colors.textTertiary }]}>
              By continuing, you agree to our{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Home Indicator */}
      <View style={styles.homeIndicatorContainer}>
        <View
          style={[
            styles.homeIndicator,
            {
              backgroundColor: colorScheme === 'dark' ? colors.border : '#1A1A1A',
            },
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
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    height: 56,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: 4,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  phoneInputContainer: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  phoneInput: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  helperText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: Spacing.sm,
    marginLeft: 4,
  },
  countryDropdown: {
    position: 'absolute',
    top: 220,
    left: Spacing.xl,
    right: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    zIndex: 100,
    overflow: 'hidden',
  },
  countryOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  countryOptionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  primaryButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  secondaryButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xl,
  },
  socialSection: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  socialIcon: {
    opacity: 0.3,
  },
  termsText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  termsLink: {
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  homeIndicatorContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 128,
    height: 5,
    borderRadius: 100,
  },
});