import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  BackHandler,
  KeyboardAvoidingView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useGoogleFirebaseAuth } from '@/hooks/useGoogleFirebaseAuth';
import { statusCodes } from '@react-native-google-signin/google-signin';
import { usersApi } from '@/services/api';
import { compressImage } from '@/services/image';
import { uploadImageToSupabase } from '@/services/supabase';

export default function ProfileCompletionScreen() {
  const router = useRouter();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();

  const {
    user,
    updateProfile,
    isOnboarded,
    sendPhoneOTP,
    linkPhone,
    isLoading,
  } = useAuthStore();

  // ─── State ────────────────────────────────────────────────────────────────

  const [name, setName] = useState(user?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [dob, setDob] = useState(user?.date_of_birth ?? '');
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(
    user?.profile_picture ?? user?.avatar ?? undefined
  );

  const [isFocused, setIsFocused] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

  // ✅ FIX #2: Track the formatted phone number sent to Firebase
  const [formattedPhone, setFormattedPhone] = useState('');

  // ─── Dialog State ─────────────────────────────────────────────────────────

  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'info' | 'error' | 'warning';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'error' | 'warning' = 'info'
  ) => {
    setDialogConfig({ visible: true, title, message, type });
  };

  const closeCustomAlert = () => {
    setDialogConfig((prev) => ({ ...prev, visible: false }));
  };

  // ─── Load Saved Data on Mount (Edit Mode Only) ────────────────────────────

  useEffect(() => {
    if (!isOnboarded) return;

    const loadSavedData = async () => {
      setIsLoadingPreferences(true);
      try {
        const userProfile = await usersApi.me();

        setName(userProfile.name ?? '');
        setPhoneNumber(userProfile.phone ?? userProfile.phoneNumber ?? '');
        setEmail(userProfile.email ?? '');
        setGender(userProfile.gender ?? '');
        setDob(userProfile.date_of_birth ?? '');
        setSelectedAvatar(userProfile.profile_picture ?? userProfile.avatar ?? undefined);
      } catch (error: any) {
        console.error('[edit-profile] Failed to load preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    loadSavedData();
  }, [isOnboarded]);

  // ─── Google Sign-In ───────────────────────────────────────────────────────

  const { signInWithGoogle, isGoogleLoading, isGoogleReady } = useGoogleFirebaseAuth({
    onSuccess: (response) => {
      const updatedUser = response.user;

      // ✅ Trust backend's email_verified, don't infer from email existence
      updateProfile({
        email: updatedUser.email ?? undefined,
        email_verified: updatedUser.email_verified,
      });
      setEmail(updatedUser.email ?? '');
      showCustomAlert('Success', 'Google account linked successfully!', 'success');
    },
    onError: (error: any) => {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      showCustomAlert(
        'Error',
        error?.message ?? 'Failed to link Google account. Please try again.',
        'error'
      );
    },
  });

  // ─── Animations ───────────────────────────────────────────────────────────

  const buttonScale = useRef(new Animated.Value(1)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;
  const inputBorderAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const onBackPress = () => {
      if (!isOnboarded) return true;
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [isOnboarded]);

  // ─── Phone Verification ───────────────────────────────────────────────────

  const handleSendPhoneVerification = async () => {
    if (!phoneNumber.trim()) {
      showCustomAlert('Phone Required', 'Please enter your phone number first.', 'warning');
      return;
    }

    let phone = phoneNumber.trim();
    if (!phone.startsWith('+')) {
      const clean = phone.replace(/\D/g, '');
      if (clean.length < 10) {
        showCustomAlert('Invalid Phone', 'Please enter a valid 10-digit phone number.', 'error');
        return;
      }
      phone = `+91${clean.slice(-10)}`;
    }

    try {
      setIsVerifyingPhone(true);

      // ✅ FIX #2: Save formatted phone and update display
      setFormattedPhone(phone);
      setPhoneNumber(phone);

      await sendPhoneOTP(phone);
      setShowPhoneVerification(true);
      showCustomAlert(
        'Code Sent',
        `A verification code has been sent to ${phone}.`,
        'success'
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to send verification code.';
      showCustomAlert('Error', message, 'error');
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleConfirmPhoneOtp = async () => {
    if (otpCode.trim().length !== 6) {
      showCustomAlert('Invalid Code', 'Please enter the 6-digit code.', 'error');
      return;
    }

    try {
      setIsVerifyingPhone(true);

      // ✅ FIX #3: linkPhone already updates the store from backend response
      // The _phoneNumber param is ignored by the store — it uses pendingPhone internally
      await linkPhone(formattedPhone || phoneNumber, otpCode);

      setOtpCode('');
      setShowPhoneVerification(false);

      // ✅ FIX #4: Refresh user from backend to ensure mobile_verified is correct
      // The store was already updated by linkPhone, but we double-check
      try {
        const freshUser = await usersApi.me();
        updateProfile({
          phone: freshUser.phone ?? formattedPhone,
          phoneNumber: freshUser.phone ?? formattedPhone,
          mobile_verified: freshUser.mobile_verified,
        });
        setPhoneNumber(freshUser.phone ?? formattedPhone);
      } catch {
        // If refresh fails, use formattedPhone as fallback — store was already updated
        setPhoneNumber(formattedPhone);
      }

      showCustomAlert(
        'Verified',
        'Your phone number has been successfully verified!',
        'success'
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'OTP verification failed. Please try again.';
      showCustomAlert('Error', message, 'error');
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  // ─── Input Handlers ───────────────────────────────────────────────────────

  const handleInputFocus = () => {
    setIsFocused(true);
    Animated.timing(inputBorderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    Animated.timing(inputBorderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showCustomAlert(
          'Permission Denied',
          'Please allow access to your photos to upload a profile picture.',
          'warning'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;

        Animated.sequence([
          Animated.timing(avatarScale, {
            toValue: 0.88,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.spring(avatarScale, {
            toValue: 1,
            friction: 6,
            tension: 180,
            useNativeDriver: true,
          }),
        ]).start();

        setSelectedAvatar(uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showCustomAlert('Error', 'Could not select photo. Please try again.', 'error');
    }
  };

  const handleAvatarPressIn = () => {
    Animated.spring(avatarScale, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleAvatarPressOut = () => {
    Animated.spring(avatarScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  // ─── Save Profile ─────────────────────────────────────────────────────────

  const handleFinishSetup = async () => {
    if (name.trim().length < 2) {
      showCustomAlert('Name Required', 'Please enter your full name.', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      let uploadedAvatarUrl: string | undefined = selectedAvatar;

      const isLocalFile =
        selectedAvatar &&
        (selectedAvatar.startsWith('file://') ||
          selectedAvatar.startsWith('content://') ||
          (!selectedAvatar.startsWith('http://') &&
            !selectedAvatar.startsWith('https://')));

      if (isLocalFile && selectedAvatar) {
        try {
          const compressed = await compressImage(selectedAvatar, {
            width: 512,
            height: 512,
            compress: 0.8,
          });

          uploadedAvatarUrl = await uploadImageToSupabase(compressed.uri, 'avatars');
        } catch (uploadErr) {
          console.error('[profile] Avatar upload failed:', uploadErr);
          showCustomAlert(
            'Upload Failed',
            'Could not upload photo, but saving other details.',
            'warning'
          );
          uploadedAvatarUrl = undefined;
        }
      }

      if (isOnboarded) {
        // ─── Edit Profile Flow ─────────────────────────────────────────────
        await usersApi.updateMe({
          name: name.trim(),
          profile_picture: uploadedAvatarUrl ?? null,
          gender: gender || null,
          date_of_birth: dob || null,
        });

        updateProfile({
          name: name.trim(),
          avatar: uploadedAvatarUrl,
          profile_picture: uploadedAvatarUrl,
          gender: gender || undefined,
          date_of_birth: dob || undefined,
        });

        showCustomAlert('Saved', 'Your profile has been updated successfully!', 'success');

        setTimeout(() => {
          router.replace('/(tabs)/profile');
        }, 1200);
      } else {
        // ─── Onboarding Flow ───────────────────────────────────────────────
        updateProfile({
          name: name.trim(),
          avatar: uploadedAvatarUrl ?? selectedAvatar,
          profile_picture: uploadedAvatarUrl ?? selectedAvatar,
          gender: gender || undefined,
          date_of_birth: dob || undefined,
        });

        router.push('/(onboarding)/setup-feed' as any);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      console.error('[profile] Save error:', err);
      showCustomAlert('Error', message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Derived State ────────────────────────────────────────────────────────

  const isNameValid = name.trim().length >= 2 && name.trim().length <= 50;
  const isButtonDisabled = !isNameValid || isSaving || isLoading || isLoadingPreferences;

  const borderInterpolation = inputBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  // ✅ FIX #1: Having an email ≠ verified. Only backend verification counts.
  const phoneVerified = user?.mobile_verified === true;
  const emailVerified = user?.email_verified === true;

  const avatarSize = Math.min(Math.max(width * 0.28, 88), 130);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View
        style={[
          styles.topRadial,
          {
            backgroundColor: isDark
              ? 'rgba(70, 72, 212, 0.1)'
              : 'rgba(225, 224, 255, 0.65)',
          },
        ]}
      />
      <View
        style={[
          styles.bottomRadial,
          {
            backgroundColor: isDark
              ? 'rgba(0, 106, 97, 0.1)'
              : 'rgba(229, 238, 255, 0.7)',
          },
        ]}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {isOnboarded ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          <Text style={{ fontFamily: 'Poppins_700Bold' }}>Hyper</Text>
          <Text
            style={{
              fontFamily: 'Poppins_500Medium',
              color: isDark ? '#818CF8' : colors.primary,
            }}
          >
            Local
          </Text>
          <Text
            style={{
              color: isDark ? '#818CF8' : colors.primary,
              fontFamily: 'Poppins_700Bold',
            }}
          >
            .
          </Text>
        </Text>

        <View style={styles.headerPlaceholder} />
      </View>

      {/* Loading Preferences Overlay */}
      {isOnboarded && isLoadingPreferences && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your profile...
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={[styles.scrollView, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!isLoadingPreferences}
          >
            <Animated.View
              style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
              {/* Progress Indicator */}
              {!isOnboarded && (
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.stepIndicatorShort,
                      { backgroundColor: colors.primaryLight },
                    ]}
                  />
                  <View
                    style={[
                      styles.stepIndicatorShort,
                      { backgroundColor: colors.primaryLight },
                    ]}
                  />
                  <View
                    style={[
                      styles.stepIndicatorLong,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                </View>
              )}

              {/* Headline */}
              <View style={styles.headlineSection}>
                <Text style={[styles.mainTitle, { color: colors.text }]}>
                  {isOnboarded ? 'Edit Your Profile' : 'Complete your profile'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {isOnboarded
                    ? 'Update your information anytime'
                    : 'Add a photo and your name so we\ncan personalize your experience.'}
                </Text>
              </View>

              {/* Avatar Uploader */}
              <View style={styles.uploaderSection}>
                <Pressable
                  onPress={handlePickFromGallery}
                  onPressIn={handleAvatarPressIn}
                  onPressOut={handleAvatarPressOut}
                  style={styles.uploaderTouch}
                  disabled={isLoadingPreferences}
                >
                  <Animated.View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: isDark ? '#2A2A3C' : '#E1E0FF',
                        borderColor: colors.border,
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                      },
                      { transform: [{ scale: avatarScale }] },
                    ]}
                  >
                    {selectedAvatar ? (
                      <Image
                        source={{ uri: selectedAvatar }}
                        style={[
                          styles.avatarImage,
                          { borderRadius: avatarSize / 2 - 4 },
                        ]}
                      />
                    ) : (
                      <View style={styles.cameraIconContainer}>
                        <Feather name="camera" size={32} color={colors.primary} />
                      </View>
                    )}
                    <View
                      style={[
                        styles.plusBadge,
                        {
                          backgroundColor: colors.primary,
                          borderColor: colors.background,
                        },
                      ]}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </View>
                  </Animated.View>
                </Pressable>
                <Text style={[styles.uploadPrompt, { color: colors.primary }]}>
                  TAP TO UPLOAD
                </Text>
              </View>

              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  FULL NAME
                </Text>
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.card, borderColor: borderInterpolation },
                    isFocused && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Enter your name"
                    placeholderTextColor={
                      isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(118, 117, 134, 0.5)'
                    }
                    value={name}
                    onChangeText={setName}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    autoCapitalize="words"
                    maxLength={50}
                    editable={!isLoadingPreferences}
                  />
                  {name.length > 30 && (
                    <Text style={[styles.charCountText, { color: colors.textSecondary }]}>
                      {name.length}/50
                    </Text>
                  )}
                  <Feather
                    name="user"
                    size={20}
                    color={
                      isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(118, 117, 134, 0.5)'
                    }
                    style={styles.inputIcon}
                  />
                </Animated.View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  PHONE NUMBER
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: phoneVerified
                        ? isDark
                          ? '#1C1C2E'
                          : '#F1F3F9'
                        : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        color: phoneVerified
                          ? isDark
                            ? 'rgba(255,255,255,0.4)'
                            : 'rgba(0,0,0,0.4)'
                          : colors.text,
                      },
                    ]}
                    placeholder="Enter phone number"
                    placeholderTextColor={
                      isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(118, 117, 134, 0.5)'
                    }
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={15}
                    editable={!phoneVerified && !isVerifyingPhone && !isLoadingPreferences}
                  />
                  <Feather
                    name="phone"
                    size={20}
                    color={
                      isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(118, 117, 134, 0.5)'
                    }
                    style={styles.inputIcon}
                  />
                </View>

                {phoneVerified ? (
                  <View
                    style={[
                      styles.verifiedBadge,
                      { backgroundColor: '#10B981', marginTop: 10 },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={[styles.verifiedBadgeText, { color: '#FFFFFF' }]}>
                      Phone Verified
                    </Text>
                  </View>
                ) : !showPhoneVerification ? (
                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      { backgroundColor: colors.primaryLight, marginTop: 10 },
                    ]}
                    onPress={handleSendPhoneVerification}
                    disabled={isVerifyingPhone || isLoadingPreferences}
                    activeOpacity={0.7}
                  >
                    {isVerifyingPhone ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="send" size={16} color={colors.primary} />
                        <Text style={[styles.verifyButtonText, { color: colors.primary }]}>
                          Send Verification Code
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.otpSection}>
                    <Text style={[styles.otpLabel, { color: colors.textSecondary }]}>
                      ENTER OTP CODE
                    </Text>
                    <View
                      style={[
                        styles.otpInputWrapper,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                    >
                      <TextInput
                        style={[styles.otpInput, { color: colors.text }]}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor={
                          isDark
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(118, 117, 134, 0.5)'
                        }
                        value={otpCode}
                        onChangeText={setOtpCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isLoadingPreferences}
                      />
                      <Feather
                        name="lock"
                        size={20}
                        color={
                          isDark
                            ? 'rgba(255, 255, 255, 0.4)'
                            : 'rgba(118, 117, 134, 0.5)'
                        }
                        style={styles.inputIcon}
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.otpConfirmButton,
                        { backgroundColor: colors.primary },
                        (isVerifyingPhone || otpCode.length !== 6 || isLoadingPreferences) && {
                          opacity: 0.6,
                        },
                      ]}
                      onPress={handleConfirmPhoneOtp}
                      disabled={
                        isVerifyingPhone || otpCode.length !== 6 || isLoadingPreferences
                      }
                      activeOpacity={0.8}
                    >
                      {isVerifyingPhone ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.otpConfirmButtonText}>
                          Confirm Code & Verify Phone
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Email Verification */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  EMAIL VERIFICATION
                </Text>
                {emailVerified ? (
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: isDark ? '#1C1C2E' : '#F1F3F9',
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: isDark
                            ? 'rgba(255,255,255,0.4)'
                            : 'rgba(0,0,0,0.4)',
                        },
                      ]}
                      value={email || user?.email || ''}
                      editable={false}
                    />
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                      style={styles.inputIcon}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.googleLinkBtn, { backgroundColor: colors.primary }]}
                    onPress={signInWithGoogle}
                    disabled={!isGoogleReady || isGoogleLoading || isLoadingPreferences}
                    activeOpacity={0.8}
                  >
                    {isGoogleLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="logo-google" size={18} color="#FFFFFF" />
                        <Text style={styles.googleLinkBtnText}>Link Google Account</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {/* Gender */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  GENDER
                </Text>
                <View style={styles.genderRow}>
                  {(['Male', 'Female', 'Other'] as const).map((g) => {
                    const isActive = gender.toLowerCase() === g.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.genderButton,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                          },
                          isActive && {
                            borderColor: colors.primary,
                            backgroundColor: colors.primaryLight,
                          },
                        ]}
                        onPress={() => setGender(g.toLowerCase())}
                        activeOpacity={0.7}
                        disabled={isLoadingPreferences}
                      >
                        <Text
                          style={[
                            styles.genderButtonText,
                            { color: colors.textSecondary },
                            isActive && { color: colors.primary, fontWeight: '600' },
                          ]}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Date of Birth */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  DATE OF BIRTH
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={
                      isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(118, 117, 134, 0.5)'
                    }
                    value={dob}
                    onChangeText={(text) => {
                      let cleaned = text.replace(/\D/g, '');
                      if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);
                      let formatted = cleaned;
                      if (cleaned.length > 4) {
                        formatted = `${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
                      }
                      if (cleaned.length > 6) {
                        formatted = `${formatted.substring(0, 7)}-${formatted.substring(7)}`;
                      }
                      setDob(formatted);
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                    editable={!isLoadingPreferences}
                  />
                  <Feather
                    name="calendar"
                    size={20}
                    color={
                      isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(118, 117, 134, 0.5)'
                    }
                    style={styles.inputIcon}
                  />
                </View>
              </View>

              {/* Info Card */}
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.infoIconContainer,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: colors.text }]}>
                    Your data is safe
                  </Text>
                  <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
                    We only use your information to personalize your news and improve
                    your experience.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          style={styles.buttonWrapper}
          disabled={isButtonDisabled}
          onPress={handleFinishSetup}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Animated.View
            style={[
              styles.finishButton,
              isButtonDisabled
                ? [
                  styles.finishButtonDisabled,
                  {
                    backgroundColor: isDark
                      ? '#2A2A3C'
                      : 'rgba(199, 196, 215, 0.4)',
                  },
                ]
                : [styles.finishButtonActive, { backgroundColor: colors.primary }],
              { transform: [{ scale: buttonScale }] },
            ]}
          >
            {isSaving || isLoadingPreferences ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text
                  style={[
                    styles.finishButtonText,
                    isButtonDisabled && {
                      color: isDark
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(118, 117, 134, 0.6)',
                    },
                  ]}
                >
                  {isOnboarded ? 'Save Changes' : 'Finish Setup'}
                </Text>
                <Ionicons
                  name={isOnboarded ? 'save' : 'checkmark-circle'}
                  size={20}
                  color={
                    isButtonDisabled
                      ? isDark
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(118, 117, 134, 0.4)'
                      : '#FFFFFF'
                  }
                />
              </>
            )}
          </Animated.View>
        </Pressable>

        {!isOnboarded && (
          <View style={styles.stepTextContainer}>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              STEP 3 OF 3
            </Text>
          </View>
        )}
      </View>

      {/* Custom Alert Modal */}
      {dialogConfig.visible && (
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={closeCustomAlert}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.modalIconContainer,
                dialogConfig.type === 'success' && {
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                },
                dialogConfig.type === 'error' && {
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                },
                dialogConfig.type === 'warning' && {
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                },
                dialogConfig.type === 'info' && {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              {dialogConfig.type === 'success' && (
                <Ionicons name="checkmark-circle-outline" size={32} color="#10B981" />
              )}
              {dialogConfig.type === 'error' && (
                <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
              )}
              {dialogConfig.type === 'warning' && (
                <Ionicons name="warning-outline" size={32} color="#F59E0B" />
              )}
              {dialogConfig.type === 'info' && (
                <Ionicons
                  name="information-circle-outline"
                  size={32}
                  color={colors.primary}
                />
              )}
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {dialogConfig.title}
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {dialogConfig.message}
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={closeCustomAlert}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRadial: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    zIndex: -1,
  },
  bottomRadial: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(70, 72, 212, 0.05)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  headerPlaceholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepIndicatorShort: { width: 32, height: 6, borderRadius: 3 },
  stepIndicatorLong: { width: 64, height: 6, borderRadius: 3 },
  headlineSection: { alignItems: 'center', marginBottom: 36 },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.64,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  uploaderSection: { alignItems: 'center', marginBottom: 32 },
  uploaderTouch: { marginBottom: 12 },
  avatarCircle: {
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#4648D4',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
    }),
  },
  avatarImage: { width: '100%', height: '100%' },
  cameraIconContainer: { alignItems: 'center', justifyContent: 'center' },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  uploadPrompt: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: 'Poppins_600SemiBold',
  },
  inputContainer: { marginBottom: 24 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputWrapper: {
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    ...Platform.select({
      ios: {
        shadowColor: '#4648D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  inputIcon: { marginLeft: 12 },
  charCountText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginRight: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(70, 72, 212, 0.2)',
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  verifiedBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  otpSection: {
    marginTop: 12,
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(70, 72, 212, 0.15)',
    backgroundColor: 'rgba(70, 72, 212, 0.02)',
  },
  otpLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1.0,
  },
  otpInputWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  otpInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    letterSpacing: 2,
  },
  otpConfirmButton: {
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  otpConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  googleLinkBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
    gap: 8,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  googleLinkBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  genderRow: { flexDirection: 'row', gap: 12, width: '100%' },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonText: { fontSize: 14, fontFamily: 'Poppins_500Medium' },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: 'rgb(63, 63, 70)',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoTextContainer: { flex: 1 },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
    gap: 12,
  },
  buttonWrapper: { width: '100%' },
  finishButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  finishButtonDisabled: {},
  finishButtonActive: {
    ...Platform.select({
      ios: {
        shadowColor: '#4648D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  stepTextContainer: { marginTop: 4 },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.1,
    fontFamily: 'Poppins_600SemiBold',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalOverlay: { ...StyleSheet.absoluteFillObject },
  modalCard: {
    maxWidth: 340,
    width: '90%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});