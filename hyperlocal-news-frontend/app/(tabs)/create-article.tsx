import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Modal,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useCreateArticle } from '@/hooks/useNews';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { useAuthStore } from '@/store/authStore';

const COVER_PRESETS = [
  { id: 'business', label: 'Business', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600' },
  { id: 'environment', label: 'Nature & Parks', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600' },
  { id: 'lifestyle', label: 'Food & Dining', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600' },
  { id: 'tech', label: 'Tech & Science', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600' },
  { id: 'sports', label: 'Sports & Event', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600' },
  { id: 'politics', label: 'News & Media', url: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800' },
];

const CATEGORIES = [
  'Business',
  'Environment',
  'Lifestyle',
  'Politics',
  'Sports',
  'Technology',
  'Health',
  'Local',
];

const LANGUAGES = [
  'English',
  'Telugu',
  'Hindi',
  'Spanish',
];

const CITIES = [
  'Kukatpally',
  'Madhapur',
  'Gachibowli',
  'Secunderabad',
  'Hyderabad',
  'Aura City',
];

export default function CreateArticleScreen() {
  const colorScheme = useAppColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();

  // API Mutation
  const { mutate: createArticle } = useCreateArticle();
  const { user } = useAuthStore();
  const isPublisher = user?.isPublisher || false;

  const handleGatedBack = () => {
    try {
      router.push('/(tabs)/articles');
    } catch (e) {
      router.push('/(tabs)/articles');
    }
  };

  if (!isPublisher) {
    return (
      <View style={[styles.gatedContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        {/* Decorative Blurs */}
        <View style={styles.topRightBlur} />
        <View style={styles.bottomLeftBlur} />
        
        {/* Header */}
        <View style={[styles.gatedHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(12, insets.top) }]}>
          <TouchableOpacity
            style={styles.closeButton}
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

  // Form State
  const [coverImage, setCoverImage] = useState('');
  const [showCoverPresets, setShowCoverPresets] = useState(false);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');

  // Dropdown Modal Pickers
  const [pickerType, setPickerType] = useState<'category' | 'language' | 'location' | null>(null);
  const [validationError, setValidationError] = useState('');

  // Count Calculators
  const headlineCharCount = headline.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Insert markdown tags in simulated editor
  const handleEditorToolbar = (type: 'bold' | 'italic' | 'list' | 'link' | 'quote') => {
    let tag = '';
    switch (type) {
      case 'bold':
        tag = '**text**';
        break;
      case 'italic':
        tag = '*text*';
        break;
      case 'list':
        tag = '\n- item';
        break;
      case 'link':
        tag = '[title](url)';
        break;
      case 'quote':
        tag = '\n> quote';
        break;
    }
    setContent((prev) => prev + tag);
  };

  const handleSelectCover = (url: string) => {
    setCoverImage(url);
    setShowCoverPresets(false);
  };

  const validateAndSubmit = (isDraft = false) => {
    if (!coverImage) {
      setValidationError('Please select a cover image.');
      return;
    }
    if (!headline.trim()) {
      setValidationError('Please enter a headline.');
      return;
    }
    if (headline.length > 100) {
      setValidationError('Headline must be less than 100 characters.');
      return;
    }
    if (!summary.trim()) {
      setValidationError('Please enter a summary overview.');
      return;
    }
    if (!content.trim()) {
      setValidationError('Please enter story content.');
      return;
    }
    if (wordCount > 500) {
      setValidationError('Content exceeds the 500 words limit.');
      return;
    }
    if (!category) {
      setValidationError('Please select a category.');
      return;
    }

    setValidationError('');

    createArticle({
      category: category.toUpperCase(),
      headline: headline.trim(),
      summary: summary.trim(),
      sourceName: 'Aura Reporter',
      imageUrl: coverImage,
      content: content.trim(),
      language: language || 'English',
      location: location || 'Kukatpally',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    }, {
      onSuccess: () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/articles');
        }
      },
      onError: (err: any) => {
        setValidationError(err?.message || 'Failed to submit article for review.');
      }
    });
  };

  const activeOptions = 
    pickerType === 'category' ? CATEGORIES :
    pickerType === 'language' ? LANGUAGES :
    pickerType === 'location' ? CITIES : [];

  const handlePickerSelect = (val: string) => {
    if (pickerType === 'category') {
      setCategory(val);
    } else if (pickerType === 'language') {
      setLanguage(val);
    } else if (pickerType === 'location') {
      setLocation(val);
    }
    setPickerType(null);
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} translucent backgroundColor="transparent" />
      {/* Decorative Blurs */}
      <View style={styles.topRightBlur} />
      <View style={styles.bottomLeftBlur} />

      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(12, insets.top) }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/articles');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Article</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 160 }]}
        >
          {validationError ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color="#BA1A1A" />
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          ) : null}

          {/* Section - Cover Image */}
          <View style={styles.sectionGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Cover Image</Text>
            
            {coverImage ? (
              <View style={styles.coverPreviewContainer}>
                <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
                <TouchableOpacity
                  style={styles.changeCoverButton}
                  onPress={() => setShowCoverPresets(!showCoverPresets)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                  <Text style={styles.changeCoverText}>Change Cover</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowCoverPresets(true)}
                activeOpacity={0.7}
              >
                <View style={styles.uploadIconCircle}>
                  <Ionicons name="camera" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.uploadTitle, { color: colors.text }]}>Add Cover Image</Text>
                <Text style={styles.uploadDesc}>16:9 ratio recommended</Text>
              </TouchableOpacity>
            )}

            {/* Presets collapse list */}
            {showCoverPresets && (
              <View style={[styles.presetsWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.presetTitle, { color: colors.primary }]}>Select a Preset Theme:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
                  {COVER_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetItem,
                        coverImage === preset.url && styles.presetItemActive,
                      ]}
                      onPress={() => handleSelectCover(preset.url)}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetImg} />
                      <View style={styles.presetLabelBg}>
                        <Text style={styles.presetLabel}>{preset.label}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Headline Input */}
          <View style={styles.sectionGroup}>
            <View style={styles.fieldHeader}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Headline</Text>
              <Text style={styles.charCounter}>{headlineCharCount}/100</Text>
            </View>
            <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.headlineInput, { color: colors.text }]}
                placeholder="Enter a catchy title..."
                placeholderTextColor={colors.textTertiary}
                value={headline}
                onChangeText={(text: string) => {
                  if (text.length <= 100) setHeadline(text);
                  if (validationError) setValidationError('');
                }}
                multiline
                maxLength={100}
              />
            </View>
          </View>

          {/* Summary Input */}
          <View style={styles.sectionGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Summary</Text>
            <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.summaryInput, { color: colors.text }]}
                placeholder="Brief overview of the story for the feed"
                placeholderTextColor={colors.textTertiary}
                value={summary}
                onChangeText={(text: string) => {
                  setSummary(text);
                  if (validationError) setValidationError('');
                }}
                multiline
              />
            </View>
          </View>

          {/* Rich Content Editor */}
          <View style={styles.sectionGroup}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Content</Text>
            <View style={[styles.editorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Toolbar */}
              <View style={[styles.editorToolbar, { borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleEditorToolbar('bold')}>
                  <MaterialCommunityIcons name="format-bold" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleEditorToolbar('italic')}>
                  <MaterialCommunityIcons name="format-italic" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleEditorToolbar('list')}>
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <View style={[styles.toolbarDivider, { backgroundColor: colors.border }]} />
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleEditorToolbar('link')}>
                  <MaterialCommunityIcons name="link-variant" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn} onPress={() => handleEditorToolbar('quote')}>
                  <MaterialCommunityIcons name="format-quote-close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Editor Textarea */}
              <TextInput
                style={[styles.editorInput, { color: colors.text }]}
                placeholder="Write your story here..."
                placeholderTextColor={colors.textTertiary}
                multiline
                textAlignVertical="top"
                value={content}
                onChangeText={(text: string) => {
                  setContent(text);
                  if (validationError) setValidationError('');
                }}
              />

              {/* Editor Footer */}
              <View style={[styles.editorFooter, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(248,250,252,0.5)' }]}>
                <Text style={styles.wordCounter}>{wordCount}/500 WORDS</Text>
              </View>
            </View>
          </View>

          {/* Metadata Dropdowns Grid */}
          <View style={styles.metadataGrid}>
            
            {/* Category selection */}
            <View style={styles.gridItemFull}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
              <TouchableOpacity
                style={[styles.dropdownSelect, { backgroundColor: colors.surface }]}
                activeOpacity={0.7}
                onPress={() => {
                  Keyboard.dismiss();
                  setPickerType('category');
                }}
              >
                <Text style={[styles.dropdownValue, { color: category ? colors.text : colors.textTertiary }]}>
                  {category || 'Select Category'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Language & Location Columns */}
            <View style={styles.rowLayout}>
              <View style={styles.halfColumn}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Language</Text>
                <TouchableOpacity
                  style={[styles.dropdownSelect, { backgroundColor: colors.surface }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    Keyboard.dismiss();
                    setPickerType('language');
                  }}
                >
                  <Text style={[styles.dropdownValue, { color: language ? colors.text : colors.textTertiary }]}>
                    {language || 'Select Language'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.halfColumn}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Location</Text>
                <TouchableOpacity
                  style={[styles.dropdownSelect, { backgroundColor: colors.surface }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    Keyboard.dismiss();
                    setPickerType('location');
                  }}
                >
                  <Text style={[styles.dropdownValue, { color: location ? colors.text : colors.textTertiary }]}>
                    {location || 'Select City'}
                  </Text>
                  <Ionicons name="pin" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tags Input */}
            <View style={styles.gridItemFull}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tags</Text>
              <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.tagInput, { color: colors.text }]}
                  placeholder="Comma-separated keywords..."
                  placeholderTextColor={colors.textTertiary}
                  value={tags}
                  onChangeText={setTags}
                />
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Sticky Footer Actions */}
      <View style={[styles.stickyFooter, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(20, insets.bottom + 8) }]}>
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => validateAndSubmit(false)}
            activeOpacity={0.8}
          >
            <View style={styles.submitBtnInner}>
              <Text style={styles.primaryButtonText}>Submit for Review</Text>
              <Ionicons name="send" size={16} color="#FFFFFF" style={styles.sendIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => validateAndSubmit(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Save as Draft</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Single Bottom Sheet Picker Modal */}
      {pickerType !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 10000, elevation: 99 }]}>
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setPickerType(null)}
          >
            <View style={[styles.pickerSheet, { backgroundColor: colors.surface, maxHeight: screenHeight * 0.5 }]}>
              <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>
                  Select {pickerType.charAt(0).toUpperCase() + pickerType.slice(1)}
                </Text>
                <TouchableOpacity onPress={() => setPickerType(null)}>
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.pickerOptionsList}>
                {activeOptions.map((item) => {
                  const isSelected = 
                    pickerType === 'category' ? category === item :
                    pickerType === 'language' ? language === item :
                    pickerType === 'location' ? location === item : false;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.pickerOptionRow,
                        isSelected && [styles.pickerOptionRowActive, { backgroundColor: colors.primaryLight }],
                      ]}
                      onPress={() => handlePickerSelect(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerOptionLabel,
                          { color: colors.text },
                          isSelected && [styles.pickerOptionLabelActive, { color: colors.primary }],
                        ]}
                      >
                        {item}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  topRightBlur: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(70, 72, 212, 0.04)',
    zIndex: 1,
  },
  bottomLeftBlur: {
    position: 'absolute',
    bottom: -96,
    left: -96,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(70, 72, 212, 0.04)',
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    zIndex: 5,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  errorText: {
    color: '#BA1A1A',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionGroup: {
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    paddingLeft: 4,
  },
  charCounter: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Poppins_500Medium',
  },
  uploadCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(70, 72, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  uploadDesc: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  coverPreviewContainer: {
    aspectRatio: 16 / 9,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
  },
  changeCoverButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  changeCoverText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  presetsWrapper: {
    marginTop: 8,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  presetTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  presetsList: {
    gap: 12,
    paddingVertical: 2,
  },
  presetItem: {
    width: 110,
    height: 75,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: 'transparent',
    borderWidth: 2,
    position: 'relative',
  },
  presetItemActive: {
    borderColor: '#4648D4',
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  presetLabelBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  presetLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Poppins_600SemiBold',
  },
  inputCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headlineInput: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
    minHeight: 60,
  },
  summaryInput: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    lineHeight: 22,
    minHeight: 50,
  },
  editorCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  editorToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  toolbarBtn: {
    padding: 8,
    borderRadius: 8,
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 8,
  },
  editorInput: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 24,
    minHeight: 200,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  editorFooter: {
    padding: 12,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.02)',
  },
  wordCounter: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.5,
  },
  metadataGrid: {
    gap: 16,
  },
  gridItemFull: {
    gap: 8,
  },
  rowLayout: {
    flexDirection: 'row',
    gap: 16,
  },
  halfColumn: {
    flex: 1,
    gap: 8,
  },
  dropdownSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    height: 52,
  },
  dropdownValue: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  tagInput: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 10,
  },
  footerContainer: {
    maxWidth: 512,
    alignSelf: 'center',
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendIcon: {
    marginTop: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  pickerOptionsList: {
    padding: 8,
  },
  pickerOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pickerOptionRowActive: {},
  pickerOptionLabel: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  pickerOptionLabelActive: {
    fontWeight: '600',
  },
  
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
