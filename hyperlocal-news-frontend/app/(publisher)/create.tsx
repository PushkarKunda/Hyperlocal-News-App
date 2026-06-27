import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store/useStore';
import { Category } from '@/types';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';

// ── Validation helpers ─────────────────────────────────────────────────────────

interface FormErrors {
  headline?: string;
  summary?: string;
  content?: string;
  category?: string;
  imageUrl?: string;
  city?: string;
}

const validate = (
  headline: string,
  summary: string,
  content: string,
  category: Category | null,
  imageUrl: string,
  city: string
): FormErrors => {
  const errors: FormErrors = {};
  if (!headline.trim() || headline.trim().length < 10) {
    errors.headline = 'Headline must be at least 10 characters.';
  }
  if (!summary.trim() || summary.trim().length < 20) {
    errors.summary = 'Summary must be at least 20 characters.';
  }
  if (!content.trim() || content.trim().length < 50) {
    errors.content = 'Content must be at least 50 characters.';
  }
  if (!category) {
    errors.category = 'Please select a category.';
  }
  if (!imageUrl.trim()) {
    errors.imageUrl = 'Please provide a cover image URL.';
  }
  if (!city.trim()) {
    errors.city = 'Please provide a city/locality.';
  }
  return errors;
};

export default function CreateArticleScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const submitArticle = useStore((state) => state.submitArticle);
  const { user } = useAuthStore();
  const isPublisher = user?.isPublisher || false;
  const legacyUser = useStore((state) => state.user);
  const { data: categories } = useCategories();

  // Form state
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [city, setCity] = useState(legacyUser?.location?.city || '');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGatedBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/(tabs)/articles');
      }
    } catch (e) {
      router.push('/(tabs)/articles');
    }
  };

  if (!isPublisher) {
    return (
      <View style={[styles.gatedContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        {/* Header */}
        <View style={[styles.gatedHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(12, insets.top) }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGatedBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.gatedHeaderTitleText, { color: colors.text }]}>Publisher Access</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={[styles.gatedScroll, { paddingBottom: Math.max(24, insets.bottom + 24) }]}>
          <View style={styles.gatedContent}>
            <View style={[styles.gatedIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
            </View>

            <Text style={[styles.gatedTitle, { color: colors.text }]}>Verify your Gmail</Text>
            <Text style={[styles.gatedSubtitle, { color: colors.textSecondary }]}>
              To write articles and host events in your local community, you must verify your Gmail address to establish your publisher identity.
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitleText, { color: colors.text }]}>Write Local Stories</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Share news, updates, and stories impacting your neighborhood.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitleText, { color: colors.text }]}>Host Local Events</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Organize and promote nearby community meetups & activities.</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.gatedButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(onboarding)/profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.gatedButtonText}>Verify Gmail Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gatedSecondaryButton}
              onPress={handleGatedBack}
              hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}
              activeOpacity={0.7}
            >
              <Text style={[styles.gatedSecondaryButtonText, { color: colors.textSecondary }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const handleSubmit = () => {
    const formErrors = validate(headline, summary, content, selectedCategory, imageUrl, city);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      // Scroll to top or show alert
      Alert.alert('Validation Error', 'Please fix the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Simulate a short delay like a real API
    setTimeout(() => {
      submitArticle({
        headline: headline.trim(),
        summary: summary.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        category: selectedCategory!,
        author: {
          id: user?.user_uid || '',
          name: user?.name ?? 'Publisher',
          avatar: user?.avatar ?? undefined,
          isVerified: user?.isPublisher || false,
        },
        location: {
          state: user?.state || '',
          district: user?.district || '',
          city: city.trim(),
        },
        readTime: `${Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))} min read`,
        tags: tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      });

      setIsSubmitting(false);
      Alert.alert(
        '✅ Article Submitted!',
        'Your article has been submitted for admin review. It will appear in the public feed once approved.',
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/(publisher)/dashboard' as any),
          },
        ]
      );
    }, 600);
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    error?: string,
    options?: {
      multiline?: boolean;
      lines?: number;
      keyboardType?: 'default' | 'url';
      hint?: string;
    }
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      {options?.hint && (
        <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>{options.hint}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          options?.multiline && { height: (options.lines ?? 3) * 22 + 24, textAlignVertical: 'top' },
          {
            borderColor: error ? '#EF4444' : colors.border,
            color: colors.text,
            backgroundColor: colors.background,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChange}
        multiline={options?.multiline}
        numberOfLines={options?.lines}
        keyboardType={options?.keyboardType}
        autoCapitalize={options?.keyboardType === 'url' ? 'none' : 'sentences'}
      />
      {error && (
        <View style={styles.errorRow}>
          <MaterialIcons name="error-outline" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Pressable onPress={handleGatedBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Write Article</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Image Preview ── */}
          {imageUrl.trim() ? (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: imageUrl.trim() }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={[styles.previewOverlay]}>
                <MaterialIcons name="image" size={16} color="#fff" />
                <Text style={styles.previewText}>Cover Image</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="add-photo-alternate" size={40} color={colors.textTertiary} />
              <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                Add a cover image URL below
              </Text>
            </View>
          )}

          {/* ── Form Fields ── */}
          {renderInput('Headline', headline, setHeadline, 'Enter a compelling headline...', errors.headline, {
            hint: 'Min 10 characters',
          })}

          {renderInput('Summary', summary, setSummary, 'Write a brief summary...', errors.summary, {
            multiline: true,
            lines: 3,
            hint: 'Min 20 characters. This appears on the news card.',
          })}

          {renderInput('Content', content, setContent, 'Write your full article...', errors.content, {
            multiline: true,
            lines: 8,
            hint: 'Min 50 characters. The full article body.',
          })}

          {renderInput(
            'Cover Image URL',
            imageUrl,
            setImageUrl,
            'https://images.unsplash.com/...',
            errors.imageUrl,
            { keyboardType: 'url' }
          )}

          {renderInput('City / Locality', city, setCity, 'e.g. Kukatpally', errors.city)}

          {renderInput('Tags', tags, setTags, 'technology, local, breaking', undefined, {
            hint: 'Comma-separated tags (optional)',
          })}

          {/* ── Category Selection ── */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Category</Text>
            {errors.category && (
              <View style={styles.errorRow}>
                <MaterialIcons name="error-outline" size={14} color="#EF4444" />
                <Text style={styles.errorText}>{errors.category}</Text>
              </View>
            )}
            <View style={styles.categoryGrid}>
              {categories
                ?.filter((c) => c.slug !== 'for-you')
                .map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected
                            ? (cat.color ?? colors.primary) + '18'
                            : colors.background,
                          borderColor: isSelected
                            ? cat.color ?? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      {cat.icon && (
                        <MaterialIcons
                          name={cat.icon as any}
                          size={16}
                          color={isSelected ? cat.color ?? colors.primary : colors.textSecondary}
                        />
                      )}
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color: isSelected ? cat.color ?? colors.primary : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </View>

          {/* ── Info Banner ── */}
          <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
            <MaterialIcons name="info-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoBannerText, { color: colors.primary }]}>
              Your article will be reviewed by an admin before being published to the community feed.
            </Text>
          </View>

          {/* ── Submit Button ── */}
          <Pressable
            style={[
              styles.submitButton,
              { backgroundColor: isSubmitting ? colors.border : colors.primary },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <MaterialIcons
              name={isSubmitting ? 'hourglass-top' : 'send'}
              size={20}
              color="#fff"
            />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' },

  scrollContent: { padding: 16, paddingBottom: 40 },

  // Image preview
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewImage: { width: '100%', height: '100%' },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  placeholderText: { fontSize: 14 },

  // Form fields
  fieldContainer: { marginBottom: 18 },
  fieldLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  fieldHint: { fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    lineHeight: 22,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: '500' },

  // Category grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryChipText: { fontSize: 13 },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 4,
  },
  infoBannerText: { flex: 1, fontSize: 13, lineHeight: 19 },

  // Submit
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // Gated UI Styles
  gatedContainer: {
    flex: 1,
  },
  gatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  gatedHeaderTitleText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  headerSpacer: {
    width: 40,
  },
  gatedScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  gatedContent: {
    alignItems: 'center',
    gap: 16,
  },
  gatedIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gatedTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  gatedSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    width: '100%',
    gap: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
    gap: 4,
  },
  featureTitleText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
  },
  gatedButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  gatedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  gatedSecondaryButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gatedSecondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
});
