import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const { verifyPhoneOTP, sendPhoneOTP, isLoading } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30); // resend cooldown
  const [canResend, setCanResend] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // ─── Auto focus input on mount ─────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // ─── Countdown timer for resend ────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ─── Button animation ──────────────────────────────────────────────────────
  const animateButton = (toValue: number) => {
    Animated.spring(buttonScale, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // ─── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }

    try {
      const response = await verifyPhoneOTP(otp);

      // Navigate based on new or existing user
      if (response.is_new_user) {
        router.replace('/(onboarding)/language');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP. Please try again.');
      setOtp(''); // Clear OTP on failure
    }
  };

  // ─── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!phone || !canResend) return;

    setResending(true);
    setCanResend(false);
    setCountdown(30); // reset countdown

    try {
      await sendPhoneOTP(phone);
      setOtp(''); // Clear existing OTP
      Alert.alert('OTP Sent', 'A new code has been sent to ' + phone);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  // ─── Back ──────────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Feather name="shield" size={32} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          Verify Your Number
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={[styles.phoneText, { color: colors.text }]}>
            {phone}
          </Text>
        </Text>

        {/* OTP Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.otpInput,
            {
              color: colors.text,
              borderColor: otp.length === 6 ? colors.primary : colors.border,
              backgroundColor: isDark ? colors.surface : '#EFF4FF',
            },
          ]}
          value={otp}
          onChangeText={(text) => {
            setOtp(text.replace(/\D/g, '')); // numbers only
          }}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="• • • • • •"
          placeholderTextColor={isDark ? '#464554' : '#C7C4D7'}
          textAlign="center"
          autoComplete="sms-otp"  // Android auto-fill OTP
          textContentType="oneTimeCode" // iOS auto-fill OTP
        />

        {/* Verify Button */}
        <Animated.View
          style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}
        >
          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              (isLoading || otp.length !== 6) && { opacity: 0.7 },
            ]}
            onPressIn={() => animateButton(0.96)}
            onPressOut={() => animateButton(1)}
            onPress={handleVerify}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Verify Code</Text>
                <Feather name="check" size={18} color="#fff" />
              </>
            )}
          </Pressable>
        </Animated.View>

        {/* Resend */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResend}
              disabled={resending}
              style={styles.resendBtn}
            >
              <Text style={[styles.resendText, { color: colors.primary }]}>
                {resending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
              Resend code in{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {countdown}s
              </Text>
            </Text>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 32,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneText: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
  },
  otpInput: {
    width: '85%',
    height: 64,
    borderWidth: 1.5,
    borderRadius: 16,
    fontSize: 30,
    letterSpacing: 14,
    marginBottom: 28,
    fontFamily: 'Poppins_600SemiBold',
  },
  buttonWrapper: {
    width: '85%',
    marginBottom: 20,
  },
  button: {
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  resendContainer: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
  },
  resendBtn: {
    padding: 8,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  countdownText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
});