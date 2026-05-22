import React, { useState, useRef, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;

interface ResendTimerProps {
  onResend: () => Promise<boolean>;
}

const ResendTimer = React.memo(({ onResend }: ResendTimerProps) => {
  const [timer, setTimer] = useState(59);
  const [isResending, setIsResending] = useState(false);
  const timerOpacity = useRef(new Animated.Value(0)).current;

  // Soft fade-in for resend timer on mount
  useEffect(() => {
    Animated.timing(timerOpacity, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResendPress = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    const success = await onResend();
    setIsResending(false);
    if (success) {
      setTimer(59);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View style={[styles.timerContainer, { opacity: timerOpacity }]}>
      <Text style={styles.timerQuestion}>Didn't receive the code?</Text>
      <TouchableOpacity
        onPress={handleResendPress}
        disabled={timer > 0 || isResending}
        activeOpacity={0.7}
      >
        <Text style={[styles.timerButtonText, (timer > 0 || isResending) && styles.timerDisabled]}>
          {isResending ? 'Sending...' : `Resend Code ${timer > 0 ? `(${formatTime(timer)})` : ''}`}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const SecurityBadge = React.memo(() => {
  const badgeSlideY = useRef(new Animated.Value(40)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(badgeSlideY, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.badgeContainer,
        {
          opacity: badgeOpacity,
          transform: [{ translateY: badgeSlideY }]
        }
      ]}
    >
      <View style={styles.securityBadge}>
        <View style={styles.badgeIconContainer}>
          <Ionicons name="shield-checkmark" size={20} color="#0B1C30" />
        </View>
        <View style={styles.badgeTextContainer}>
          <Text style={styles.badgeTitle}>Secure Verification</Text>
          <Text style={styles.badgeSubtitle}>
            Your data is protected with 256-bit encryption
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawPhone = params.phone as string || '';
  
  // Format phone number for readability in heading (e.g., +1 (555) 000-0000)
  const formatDisplayPhone = (phone: string) => {
    if (!phone) return 'your number';
    
    // Check if it has +1 or +91 and separate
    const match = phone.match(/^(\+\d+)(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return phone;
  };
  
  const displayPhone = formatDisplayPhone(rawPhone);
  const { verifyOtp, sendOtp } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  // Animated values
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleOtpChange = (value: string, index: number) => {
    const cleaned = value.replace(/\D/g, '');
    
    // Handle paste event (length > 1)
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      for (let i = 0; i < OTP_LENGTH; i++) {
        if (digits[i]) {
          newOtp[i] = digits[i];
        }
      }
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      setFocusedIndex(nextFocus);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace delete mapping
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  const animateButton = (toValue: number) => {
    Animated.spring(buttonScale, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) {
      Alert.alert('Incomplete Code', 'Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyOtp(rawPhone, otpValue);
      if (success) {
        router.replace('/(onboarding)/complete');
      } else {
        Alert.alert('Verification Failed', 'The code you entered is incorrect.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await sendOtp(rawPhone);
      if (success) {
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        setFocusedIndex(0);
        Alert.alert('Code Resent', 'A new 6-digit verification code has been sent.');
        return true;
      } else {
        Alert.alert('Error', 'Failed to resend code. Please try again.');
        return false;
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header - Top Navigation Anchor */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#4648D4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Phone</Text>
        <View style={styles.headerPlaceholder} />
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
          <View style={styles.mainContent}>

            {/* Illustration Section */}
            <View style={styles.illustrationSection}>
              <View style={styles.circleBg}>
                <View style={styles.blurGlow} />
                <Image
                  source={require('../../assets/immersive_feed/7a2bfa72521322198e3f6feb94eb5c2786c2de01.png')}
                  style={styles.lockImage}
                />
              </View>
            </View>

            {/* Content Section */}
            <View style={styles.headingSection}>
              <Text style={styles.welcomeTitle}>Verify Phone</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={styles.phoneHighlight}>{displayPhone}</Text>
              </Text>
            </View>

            {/* OTP Input Grid */}
            <View style={styles.otpGridSection}>
              <View style={styles.otpInputGrid}>
                {otp.map((digit, index) => (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      focusedIndex === index && styles.otpBoxFocused,
                      digit !== '' && styles.otpBoxFilled,
                    ]}
                  >
                    <TextInput
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      secureTextEntry={false}
                      placeholder="•"
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                ))}
              </View>

              {/* Resend & Timer */}
              <ResendTimer onResend={handleResend} />
            </View>

            {/* Verify Button Action */}
            <View style={styles.actionsSection}>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    otp.join('').length !== OTP_LENGTH && styles.primaryButtonDisabled
                  ]}
                  onPressIn={() => animateButton(0.96)}
                  onPressOut={() => animateButton(1)}
                  onPress={handleVerify}
                  disabled={isLoading || otp.join('').length !== OTP_LENGTH}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Text>
                  {!isLoading && (
                    <Feather name="check" size={18} color="#FFF" style={styles.buttonIcon} />
                  )}
                </Pressable>
              </Animated.View>
            </View>

            {/* Slide-in Security Badge */}
            <SecurityBadge />

            {/* Footer Terms */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By verifying, you agree to our{' '}
                <Text style={styles.footerLink} onPress={() => Alert.alert('Terms of Service', 'Redirecting to Terms...')}>
                  Terms of Service
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
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4648D4',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  headerPlaceholder: {
    width: 32,
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
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  illustrationSection: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBg: {
    backgroundColor: '#E5EEFF',
    width: 192,
    height: 192,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blurGlow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(70,72,212,0.05)',
    borderRadius: 96,
  },
  lockImage: {
    width: 128,
    height: 128,
    resizeMode: 'contain',
  },
  headingSection: {
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0B1C30',
    letterSpacing: -0.64,
    lineHeight: 40,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464554',
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  phoneHighlight: {
    fontWeight: '600',
    color: '#0B1C30',
  },
  otpGridSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  otpInputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 6,
    marginBottom: 24,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  otpBoxFocused: {
    borderColor: '#4648D4',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: 'transparent',
    backgroundColor: '#EFF4FF',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0B1C30',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  timerContainer: {
    alignItems: 'center',
    gap: 4,
  },
  timerQuestion: {
    fontSize: 14,
    color: '#464554',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  timerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4648D4',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  timerDisabled: {
    color: '#464554',
    opacity: 0.6,
  },
  actionsSection: {
    width: '100%',
    marginBottom: 24,
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
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  buttonIcon: {
    marginTop: 1,
  },
  badgeContainer: {
    width: '100%',
    marginBottom: 16,
  },
  securityBadge: {
    backgroundColor: 'rgba(220, 233, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  badgeIconContainer: {
    backgroundColor: '#86F2E4',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1C30',
    letterSpacing: 0.6,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  badgeSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#464554',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#767586',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  footerLink: {
    textDecorationLine: 'underline',
    fontWeight: '400',
  },
});