import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Pressable,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useAuthStore } from '@/store/authStore';

const OTP_LENGTH = 4;

export default function VerifyOTPScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phone as string || '+91 98765 43210';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(28);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const { verifyOtp } = useAuthStore();

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

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

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) return;

    setIsLoading(true);
    
    const success = await verifyOtp(phoneNumber, otpValue);
    setIsLoading(false);

    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(28);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          style={[styles.backButton, { backgroundColor: colors.background }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            Verify Your Number
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We've sent a code to{' '}
            <Text style={[styles.phoneHighlight, { color: colors.text }]}>
              {phoneNumber}
            </Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <View
              key={index}
              style={[
                styles.otpBox,
                {
                  backgroundColor: colors.background,
                  borderColor: focusedIndex === index || digit 
                    ? colors.primary 
                    : colors.border,
                },
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
              />
            </View>
          ))}
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <MaterialIcons name="schedule" size={16} color={colors.textTertiary} />
          <Text style={[styles.timerText, { color: colors.textTertiary }]}>
            Resend OTP in{' '}
            <Text style={[styles.timerValue, { color: colors.textSecondary }]}>
              {formatTime(timer)}
            </Text>
          </Text>
        </View>

        {/* Verify Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={[
              styles.verifyButton,
              { backgroundColor: colors.primary },
              Shadows.primaryGlow,
            ]}
            onPress={handleVerify}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading || otp.join('').length !== OTP_LENGTH}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Didn't receive code?
          </Text>
          <View style={styles.helpActions}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={handleResend}
              disabled={timer > 0}
            >
              <MaterialIcons
                name="refresh"
                size={18}
                color={timer > 0 ? colors.textTertiary : colors.primary}
              />
              <Text
                style={[
                  styles.helpButtonText,
                  { color: timer > 0 ? colors.textTertiary : colors.primary },
                ]}
              >
                Resend
              </Text>
            </TouchableOpacity>

            <View style={[styles.helpDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.helpButton}>
              <MaterialIcons name="call" size={18} color={colors.primary} />
              <Text style={[styles.helpButtonText, { color: colors.primary }]}>
                Call
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicatorContainer}>
        <View
          style={[
            styles.homeIndicator,
            { backgroundColor: colorScheme === 'dark' ? colors.border : '#1A1A1A' },
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
    height: 44,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
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
    lineHeight: 24,
  },
  phoneHighlight: {
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  otpBox: {
    flex: 1,
    height: 64,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  timerValue: {
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  verifyButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  helpSection: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: Spacing.md,
  },
  helpActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  helpDivider: {
    width: 1,
    height: 16,
  },
  homeIndicatorContainer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 128,
    height: 4,
    borderRadius: 100,
  },
});