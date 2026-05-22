import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');

const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, loginAsGuest } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animated values
  const primaryButtonScale = useRef(new Animated.Value(1)).current;
  const emailButtonScale = useRef(new Animated.Value(1)).current;
  const pickerDropdownOpacity = useRef(new Animated.Value(0)).current;

  // Handles phone number input and formats to (555) 000-0000
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length === 0) {
      setPhoneNumber('');
      return;
    }
    
    let formatted = '';
    if (cleaned.length <= 3) {
      formatted = `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    setPhoneNumber(formatted);
  };

  // Button micro-interactions (press scale animations)
  const animateButton = (value: Animated.Value, toValue: number) => {
    Animated.spring(value, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const toggleDropdown = (show: boolean) => {
    if (show) {
      setShowCountryPicker(true);
      Animated.timing(pickerDropdownOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(pickerDropdownOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => setShowCountryPicker(false));
    }
  };

  const handleSendOTP = async () => {
    const rawDigits = phoneNumber.replace(/\D/g, '');
    
    if (rawDigits.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setIsLoading(true);
    const fullPhone = `${selectedCountry.code}${rawDigits}`;
    
    try {
      const success = await sendOtp(fullPhone);
      if (success) {
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { phone: fullPhone },
        });
      } else {
        Alert.alert('Error', 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleLinkPress = (type: 'terms' | 'privacy') => {
    Alert.alert(
      type === 'terms' ? 'Terms of Service' : 'Privacy Policy',
      `Redirecting to HyperLocal's ${type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}...`
    );
  };

  const handleEmailLogin = () => {
    Alert.alert('Continue with Email', 'Email login will be implemented in a future update.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header - Top Navigation Anchor */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#4648D4" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>HyperLocal</Text>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleGuestLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
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
          {/* Main Content Area */}
          <View style={styles.mainContent}>
            
            {/* Hero Section */}
            <View style={styles.heroSection}>
              {/* Background Card */}
              <View style={styles.heroCard}>
                <Image
                  source={require('../../assets/immersive_feed/64186b35bff5b154bbf523e6dae56134a7cd7e14.png')}
                  style={styles.heroImage}
                />
              </View>

              {/* Headings */}
              <View style={styles.headingContainer}>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Log in to your account with your phone number to continue where you left off.
                </Text>
              </View>
            </View>

            {/* Login Form Section */}
            <View style={styles.formSection}>
              {/* Input Label */}
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>

              {/* Input Row */}
              <View style={styles.phoneInputRow}>
                {/* Country Selector */}
                <TouchableOpacity
                  style={styles.countryPicker}
                  onPress={() => toggleDropdown(!showCountryPicker)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.countryPickerText}>
                    {selectedCountry.flag} {selectedCountry.code}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#0B1C30" />
                </TouchableOpacity>

                {/* Number Input Field */}
                <View style={styles.phoneInputContainer}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="(555) 000-0000"
                    placeholderTextColor="#C7C4D7"
                    keyboardType="phone-pad"
                    maxLength={14} // (XXX) XXX-XXXX is 14 characters
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                  />
                </View>
              </View>

              {/* Country Code Picker Dropdown Overlay */}
              {showCountryPicker && (
                <Animated.View 
                  style={[
                    styles.countryDropdown,
                    { opacity: pickerDropdownOpacity }
                  ]}
                >
                  {COUNTRY_CODES.map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      style={[
                        styles.countryOption,
                        selectedCountry.code === country.code && styles.selectedOption
                      ]}
                      onPress={() => {
                        setSelectedCountry(country);
                        toggleDropdown(false);
                      }}
                    >
                      <Text style={styles.countryOptionText}>
                        {country.flag} {country.country} ({country.code})
                      </Text>
                      {selectedCountry.code === country.code && (
                        <Feather name="check" size={16} color="#4648D4" />
                      )}
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </View>

            {/* Form Actions Section */}
            <View style={styles.actionsSection}>
              {/* Primary "Send Code" Button */}
              <Animated.View style={{ transform: [{ scale: primaryButtonScale }] }}>
                <Pressable
                  style={styles.primaryButton}
                  onPressIn={() => animateButton(primaryButtonScale, 0.96)}
                  onPressOut={() => animateButton(primaryButtonScale, 1)}
                  onPress={handleSendOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Sending...' : 'Send Code'}
                  </Text>
                  {!isLoading && (
                    <Feather name="arrow-right" size={16} color="#FFF" style={styles.buttonIcon} />
                  )}
                </Pressable>
              </Animated.View>

              {/* OR Separator */}
              <View style={styles.separatorRow}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>OR</Text>
                <View style={styles.separatorLine} />
              </View>

              {/* "Continue with Email" Button */}
              <Animated.View style={{ transform: [{ scale: emailButtonScale }] }}>
                <Pressable
                  style={styles.secondaryButton}
                  onPressIn={() => animateButton(emailButtonScale, 0.96)}
                  onPressOut={() => animateButton(emailButtonScale, 1)}
                  onPress={handleEmailLogin}
                >
                  <Feather name="mail" size={18} color="#0B1C30" style={styles.mailIcon} />
                  <Text style={styles.secondaryButtonText}>Continue with Email</Text>
                </Pressable>
              </Animated.View>
            </View>

            {/* Footer Legal Terms */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink} onPress={() => handleLinkPress('terms')}>
                  Terms of Service
                </Text>
                {' and '}
                <Text style={styles.footerLink} onPress={() => handleLinkPress('privacy')}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: '#4648D4',
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#4648D4',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    maxWidth: 448,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroSection: {
    marginBottom: 32,
    width: '100%',
  },
  heroCard: {
    backgroundColor: '#E5EEFF',
    height: 192,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  heroImage: {
    position: 'absolute',
    width: '100%',
    height: '180%',
    top: '-40%',
    left: 0,
    resizeMode: 'cover',
  },
  headingContainer: {
    marginTop: 16,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0B1C30',
    letterSpacing: -0.64,
    lineHeight: 40,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464554',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  formSection: {
    marginBottom: 24,
    width: '100%',
    position: 'relative',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#767586',
    letterSpacing: 0.6,
    marginBottom: 12,
    paddingHorizontal: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
    height: 56,
    width: '100%',
  },
  countryPicker: {
    backgroundColor: '#EFF4FF',
    height: 56,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  countryPickerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0B1C30',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  phoneInputContainer: {
    flex: 1,
    backgroundColor: '#EFF4FF',
    height: 56,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  phoneInput: {
    fontSize: 16,
    color: '#0B1C30',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    padding: 0,
  },
  countryDropdown: {
    position: 'absolute',
    top: 84,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 999,
    overflow: 'hidden',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedOption: {
    backgroundColor: '#F8F9FF',
  },
  countryOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0B1C30',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  actionsSection: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#4648D4',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  buttonIcon: {
    marginTop: 1,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#C7C4D7',
  },
  separatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C7C4D7',
    letterSpacing: 1.5,
    marginHorizontal: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#C7C4D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#0B1C30',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  mailIcon: {
    marginTop: 1,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    color: '#464554',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  footerLink: {
    color: '#4648D4',
    fontWeight: '500',
  },
});