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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useCategories } from '@/hooks/useCategories';
import { useStore } from '@/store/useStore';
import { Category } from '@/types';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

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
  const router = useRouter();
  const submitArticle = useStore((state) => state.submitArticle);
  const user = useStore((state) => state.user);
  const { data: categories } = useCategories();

  // Form state
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [city, setCity] = useState(user.location.city || '');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          id: user.id,
          name: user.name ?? 'Publisher',
          avatar: user.avatar,
          isVerified: user.isPublisher,
        },
        location: {
          state: user.location.state,
          district: user.location.district,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
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
});
