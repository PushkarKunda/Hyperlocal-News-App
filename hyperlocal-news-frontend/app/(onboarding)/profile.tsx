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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileCompletionScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Animations
  const buttonScale = useRef(new Animated.Value(1)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;
  const inputBorderAnim = useRef(new Animated.Value(0)).current;

  // Staggered screen entry animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const onBackPress = () => {
      // Prevent user from going back during the profile setup process
      return true;
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
  }, []);

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
        Alert.alert(
          'Permission Denied',
          'We need access to your photo library to let you upload a custom profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const customPhotoUri = result.assets[0].uri;
        
        // Pop animation
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

        setSelectedAvatar(customPhotoUri);
      }
    } catch (error) {
      console.error('Image picking error:', error);
      Alert.alert('Upload Error', 'Could not select your photo. Please try again.');
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

  const handleFinishSetup = () => {
    if (name.trim().length >= 2) {
      // Update profile in store
      const finalAvatar = selectedAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400';
      updateProfile(name.trim(), finalAvatar);

      // Trigger navigation loader state
      router.push('/(onboarding)/setup-feed' as any);
    }
  };

  const isButtonDisabled = name.trim().length < 2;

  // Intercepting border colors
  const borderInterpolation = inputBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(199, 196, 215, 0.3)', '#4648D4'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Radial Gradient Backdrops (Simulated) */}
      <View style={styles.topRadial} />
      <View style={styles.bottomRadial} />

      {/* Header - Top Navigation Anchor */}
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>HyperLocal</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Staggered Content Animation Wrapper */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              
              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.activeStepIndicatorShort} />
                <View style={styles.activeStepIndicatorShort} />
                <View style={styles.activeStepIndicatorLong} />
              </View>

              {/* Headline & Subtext */}
              <View style={styles.headlineSection}>
                <Text style={styles.mainTitle}>Complete your profile</Text>
                <Text style={styles.subtitle}>
                  Add a photo and your name so we{'\n'}can personalize your experience.
                </Text>
              </View>

              {/* Profile Picture Uploader */}
              <View style={styles.uploaderSection}>
                <Pressable
                  onPress={handlePickFromGallery}
                  onPressIn={handleAvatarPressIn}
                  onPressOut={handleAvatarPressOut}
                  style={styles.uploaderTouch}
                >
                  <Animated.View
                    style={[
                      styles.avatarCircle,
                      { transform: [{ scale: avatarScale }] }
                    ]}
                  >
                    {selectedAvatar ? (
                       <Image source={{ uri: selectedAvatar }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.cameraIconContainer}>
                        <Feather name="camera" size={32} color="#4648D4" />
                      </View>
                    )}

                    <View style={styles.plusBadge}>
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </View>
                  </Animated.View>
                </Pressable>
                <Text style={styles.uploadPrompt}>TAP TO UPLOAD</Text>
              </View>

              {/* Input Field Container */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { borderColor: borderInterpolation },
                    isFocused && styles.inputWrapperFocused
                  ]}
                >
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(118, 117, 134, 0.5)"
                    value={name}
                    onChangeText={setName}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    autoCapitalize="words"
                    maxLength={30}
                    returnKeyType="done"
                  />
                  <Feather name="user" size={20} color="rgba(118, 117, 134, 0.5)" style={styles.inputIcon} />
                </Animated.View>
              </View>

              {/* Asymmetric Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={28} color="#4648D4" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>Your data is safe</Text>
                  <Text style={styles.infoDesc}>
                    We only use your name to personalize your daily news briefings and community interactions.
                  </Text>
                </View>
              </View>

            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Footer - Fixed Bottom Action Area */}
      <View style={styles.footer}>
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
              isButtonDisabled ? styles.finishButtonDisabled : styles.finishButtonActive,
              { transform: [{ scale: buttonScale }] }
            ]}
          >
            <Text style={[
              styles.finishButtonText,
              isButtonDisabled && { color: 'rgba(118, 117, 134, 0.6)' }
            ]}>Finish Setup</Text>
            <Ionicons name="checkmark-circle" size={20} color={isButtonDisabled ? "rgba(118, 117, 134, 0.4)" : "#FFFFFF"} />
          </Animated.View>
        </Pressable>

        <View style={styles.stepTextContainer}>
          <Text style={styles.stepText}>STEP 3 OF 3</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  topRadial: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(225, 224, 255, 0.65)',
    zIndex: -1,
  },
  bottomRadial: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(229, 238, 255, 0.7)',
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
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
    color: '#4648D4',
    fontFamily: 'Inter_700Bold',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
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
  activeStepIndicatorShort: {
    backgroundColor: '#6063ee',
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  activeStepIndicatorLong: {
    backgroundColor: '#4648d4',
    width: 64,
    height: 6,
    borderRadius: 3,
  },
  headlineSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0B1C30',
    lineHeight: 40,
    letterSpacing: -0.64,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#464554',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  uploaderSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  uploaderTouch: {
    marginBottom: 12,
  },
  avatarCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E1E0FF',
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
      android: {
        elevation: 8,
      },
    }),
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4648D4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  uploadPrompt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4648D4',
    letterSpacing: 0.3,
    fontFamily: 'Inter_600SemiBold',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#464554',
    letterSpacing: 0.6,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputWrapper: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inputWrapperFocused: {
    borderColor: '#4648D4',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#4648D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#0B1C30',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  inputIcon: {
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F8FAFC',
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
      android: {
        elevation: 3,
      },
    }),
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(70, 72, 212, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B1C30',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: '#464554',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    backgroundColor: '#F8F9FF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(199, 196, 215, 0.3)',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
    gap: 12,
  },
  buttonWrapper: {
    width: '100%',
  },
  finishButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  finishButtonDisabled: {
    backgroundColor: 'rgba(199, 196, 215, 0.4)',
  },
  finishButtonActive: {
    backgroundColor: '#4648D4',
    ...Platform.select({
      ios: {
        shadowColor: '#4648D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  stepTextContainer: {
    marginTop: 4,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C7C4D7',
    letterSpacing: 1.1,
    fontFamily: 'Inter_600SemiBold',
  },
});
