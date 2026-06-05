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
  Alert,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';


const OTP_LENGTH = 4;

interface ResendTimerProps {
  onResend: () => Promise<boolean>;
}

const ResendTimer = React.memo(({ onResend }: ResendTimerProps) => {
  const [timer, setTimer] = useState(59);
  const [isResending, setIsResending] = useState(false);
  const timerOpacity = useRef(new Animated.Value(0)).current;
  
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      <Text style={[styles.timerQuestion, { color: colors.textSecondary }]}>Didn't receive the code?</Text>
      <TouchableOpacity
        onPress={handleResendPress}
        disabled={timer > 0 || isResending}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.timerButtonText, 
          { color: colors.primary }, 
          (timer > 0 || isResending) && { color: colors.textSecondary, opacity: 0.6 }
        ]}>
          {isResending ? 'Sending...' : `Resend Code ${timer > 0 ? `(${formatTime(timer)})` : ''}`}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const SecurityBadge = React.memo(() => {
  const badgeSlideY = useRef(new Animated.Value(40)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

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
      <View style={[styles.securityBadge, { backgroundColor: isDark ? colors.surface : 'rgba(220, 233, 255, 0.5)' }]}>
        <View style={[styles.badgeIconContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
        </View>
        <View style={styles.badgeTextContainer}>
          <Text style={[styles.badgeTitle, { color: colors.text }]}>Secure Verification</Text>
          <Text style={[styles.badgeSubtitle, { color: colors.textSecondary }]}>
            Your data is protected with 256-bit encryption
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

export default function VerifyOTPScreen() {
  const router = useRouter();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();
  const rawPhone = params.phone as string || '';
  const { width } = useWindowDimensions();
  // Scale the illustration: 200px on 390px screen, clamp between 140 and 200
  const illustrationSize = Math.min(Math.max(width * 0.51, 140), 200);
  
  // Format phone number for readability in heading
  const formatDisplayPhone = (phone: string) => {
    if (!phone) return 'your number';

    // Indian format: +91 XXXXX XXXXX
    const indianMatch = phone.match(/^\+91(\d{5})(\d{5})$/);
    if (indianMatch) {
      return `+91 ${indianMatch[1]} ${indianMatch[2]}`;
    }

    // US/other format: +X (XXX) XXX-XXXX
    const usMatch = phone.match(/^(\+\d{1,3})(\d{3})(\d{3})(\d{4})$/);
    if (usMatch) {
      return `${usMatch[1]} (${usMatch[2]}) ${usMatch[3]}-${usMatch[4]}`;
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

  // Illustration animations
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const shieldPulse = useRef(new Animated.Value(1)).current;
  const dot1Angle = useRef(new Animated.Value(0)).current;
  const dot2Angle = useRef(new Animated.Value(2.09)).current; // 120deg offset
  const dot3Angle = useRef(new Animated.Value(4.19)).current; // 240deg offset

  useEffect(() => {
    // Wave ring 1
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave1, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(wave1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    // Wave ring 2 (delayed)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave2, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(wave2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }, 533);
    // Wave ring 3 (more delayed)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave3, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(wave3, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }, 1066);
    // Shield pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(shieldPulse, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(shieldPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
    // Orbiting dots
    Animated.loop(
      Animated.timing(dot1Angle, { toValue: Math.PI * 2, duration: 3000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(dot2Angle, { toValue: 2.09 + Math.PI * 2, duration: 3000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(dot3Angle, { toValue: 4.19 + Math.PI * 2, duration: 3000, useNativeDriver: true })
    ).start();
  }, []);

  const makeWaveStyle = (anim: Animated.Value) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.6, 0.2, 0] }),
  });

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
        router.replace('/(onboarding)/language');
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header - Top Navigation Anchor */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Verify Phone</Text>
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
              <View style={[styles.otpIllustrationWrap, { width: illustrationSize, height: illustrationSize }]}>
                {/* Wave rings */}
                <Animated.View style={[styles.waveRing, { borderColor: colors.primary }, makeWaveStyle(wave1)]} />
                <Animated.View style={[styles.waveRing, { borderColor: colors.primary }, makeWaveStyle(wave2)]} />
                <Animated.View style={[styles.waveRing, { borderColor: colors.primary }, makeWaveStyle(wave3)]} />

                {/* Outer orbit ring with 3 dots */}
                <View style={styles.orbitRing}>
                  <Animated.View
                    style={[
                      styles.orbitDot,
                      { backgroundColor: '#6366F1' },
                      {
                        transform: [
                          { rotate: dot1Angle.interpolate({ inputRange: [0, Math.PI * 2], outputRange: ['0deg', '360deg'] }) },
                          { translateX: 68 },
                        ],
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.orbitDot,
                      { backgroundColor: '#10B981' },
                      {
                        transform: [
                          { rotate: dot2Angle.interpolate({ inputRange: [2.09, 2.09 + Math.PI * 2], outputRange: ['120deg', '480deg'] }) },
                          { translateX: 68 },
                        ],
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.orbitDot,
                      { backgroundColor: '#F59E0B' },
                      {
                        transform: [
                          { rotate: dot3Angle.interpolate({ inputRange: [4.19, 4.19 + Math.PI * 2], outputRange: ['240deg', '600deg'] }) },
                          { translateX: 68 },
                        ],
                      },
                    ]}
                  />
                </View>

                {/* Center shield circle */}
                <Animated.View
                  style={[
                    styles.shieldCircle,
                    { backgroundColor: isDark ? '#1A1A3E' : '#EEF2FF', transform: [{ scale: shieldPulse }] },
                  ]}
                >
                  <View style={[styles.shieldIconBg, { backgroundColor: colors.primary }]}>
                    <Ionicons name="shield-checkmark" size={36} color="#FFF" />
                  </View>
                  {/* Digit placeholders */}
                  <View style={styles.digitRow}>
                    {[0,1,2,3].map(i => (
                      <View key={i} style={[styles.digitDot, { backgroundColor: otp[i] ? colors.primary : (isDark ? '#2D2D6B' : '#C7D0FF') }]} />
                    ))}
                  </View>
                </Animated.View>
              </View>
            </View>

            {/* Content Section */}
            <View style={styles.headingSection}>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>Verify Phone</Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={[styles.phoneHighlight, { color: colors.text }]}>{displayPhone}</Text>
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
                      { backgroundColor: isDark ? colors.surface : '#EFF4FF' },
                      focusedIndex === index && { borderColor: colors.primary, backgroundColor: colors.card },
                      digit !== '' && { backgroundColor: isDark ? colors.surface : '#EFF4FF' },
                    ]}
                  >
                    <TextInput
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={[styles.otpInput, { color: colors.text }]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      secureTextEntry={false}
                      placeholder="•"
                      placeholderTextColor={colors.textSecondary}
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
                    { backgroundColor: colors.primary },
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
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                By verifying, you agree to our{' '}
                <Text style={[styles.footerLink, { color: colors.primary }]} onPress={() => Alert.alert('Terms of Service', 'Redirecting to Terms...')}>
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
    fontFamily: 'Poppins_700Bold',
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
  otpIllustrationWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
  },
  orbitRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  shieldCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  shieldIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitRow: {
    flexDirection: 'row',
    gap: 6,
  },
  digitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headingSection: {
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.64,
    lineHeight: 40,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  phoneHighlight: {
    fontWeight: '600',
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
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    fontFamily: 'Poppins_600SemiBold',
  },
  timerContainer: {
    alignItems: 'center',
    gap: 4,
  },
  timerQuestion: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  timerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_600SemiBold',
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
    letterSpacing: 0.6,
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  badgeSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
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
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
  },
  footerLink: {
    textDecorationLine: 'underline',
    fontWeight: '400',
  },
});