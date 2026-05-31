import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock Event Cover Presets
const COVER_PRESETS = [
  { id: 'music', label: 'Music', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600' },
  { id: 'sports', label: 'Sports', url: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=600' },
  { id: 'market', label: 'Market', url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600' },
  { id: 'tech', label: 'Conference', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' },
];

const CATEGORIES = [
  'Music Festival',
  'Sports & Charity',
  'Community Meetup',
  'Food & Drink',
  'Art & Culture',
  'Technology & Innovation',
  'Health & Wellness',
  'Other',
];

const NEIGHBORHOODS = [
  'Kukatpally',
  'Forum Mall Ground',
  'Downtown Amphitheater',
  'Jubilee Hills',
  'Gachibowli',
  'Madhapur',
  'Banjara Hills',
  'Begumpet',
  'Secunderabad',
];

interface CreateEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (eventData: {
    title: string;
    description: string;
    category: string;
    locationName: string;
    imageUrl: string;
    date: string;
    time: string;
    neighborhood: string;
  }) => void;
}

export function CreateEventModal({ isVisible, onClose, onSubmit }: CreateEventModalProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  // Dropdown Picker Overlay States
  const [pickerType, setPickerType] = useState<'category' | 'neighborhood' | null>(null);

  const [validationError, setValidationError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCoverImage('');
    setShowImagePicker(false);
    setDate('');
    setTime('');
    setLocationName('');
    setCategory('');
    setNeighborhood('');
    setValidationError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectCover = (url: string) => {
    setCoverImage(url);
    setShowImagePicker(false);
  };

  const handleSubmit = () => {
    if (!coverImage) {
      setValidationError('Please select a cover photo.');
      return;
    }
    if (!title.trim()) {
      setValidationError('Please enter an event title.');
      return;
    }
    if (!description.trim()) {
      setValidationError('Please enter an event description.');
      return;
    }
    if (!date.trim()) {
      setValidationError('Please specify a date.');
      return;
    }
    if (!time.trim()) {
      setValidationError('Please specify a start time.');
      return;
    }
    if (!locationName.trim()) {
      setValidationError('Please enter a location/venue.');
      return;
    }
    if (!category) {
      setValidationError('Please select a category.');
      return;
    }
    if (!neighborhood) {
      setValidationError('Please choose a neighborhood/area.');
      return;
    }

    setValidationError('');
    
    onSubmit({
      title,
      description,
      category,
      locationName,
      imageUrl: coverImage,
      date,
      time,
      neighborhood,
    });
    
    handleClose();
    router.push('/event-success' as any);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Main Container */}
          <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(12, insets.top) }]}>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colorScheme === 'dark' ? '#2E2E48' : '#F3F4F6' }]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Create Event</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Scrollable Form Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.formScroll, { paddingBottom: 120 }]}
            >
              {/* Validation Alert */}
              {validationError ? (
                <View style={styles.errorAlert}>
                  <Ionicons name="alert-circle" size={18} color="#BA1A1A" />
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              ) : null}

              {/* Cover Photo */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Event Cover Photo</Text>
                {coverImage ? (
                  <View style={styles.coverPreviewContainer}>
                    <Image source={{ uri: coverImage }} style={styles.coverImagePreview} />
                    <TouchableOpacity
                      style={styles.changeCoverButton}
                      onPress={() => setShowImagePicker(!showImagePicker)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="camera" size={18} color="#FFFFFF" />
                      <Text style={styles.changeCoverText}>Change Cover</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.dashedUploadCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(70, 72, 212, 0.05)' : 'rgba(103,100,242,0.03)', borderColor: colorScheme === 'dark' ? '#374151' : 'rgba(103,100,242,0.3)' }]}
                    onPress={() => setShowImagePicker(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.uploadIconWrapper}>
                      <Ionicons name="image-outline" size={24} color={colors.primary} />
                    </View>
                    <Text style={[styles.uploadCardMainText, { color: colors.primary }]}>Tap to upload image</Text>
                    <Text style={[styles.uploadCardSubText, { color: colors.textSecondary }]}>Recommended size: 1200x675px</Text>
                  </TouchableOpacity>
                )}

                {/* Horizontal Cover Picker presets */}
                {showImagePicker && (
                  <View style={[styles.coverPresetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.presetHeading, { color: colors.primary }]}>Select a Preset Theme Cover:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
                      {COVER_PRESETS.map((preset) => (
                        <TouchableOpacity
                          key={preset.id}
                          style={[
                            styles.presetCard,
                            coverImage === preset.url && styles.presetCardActive,
                          ]}
                          onPress={() => handleSelectCover(preset.url)}
                          activeOpacity={0.7}
                        >
                          <Image source={{ uri: preset.url }} style={styles.presetImage} />
                          <View style={styles.presetLabelWrapper}>
                            <Text style={styles.presetLabel}>{preset.label}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Event Title */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Event Title</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="What's the name of the event?"
                  placeholderTextColor={colors.textTertiary}
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (validationError) setValidationError('');
                  }}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="Tell the community about your event, what to expect, and any special requirements..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (validationError) setValidationError('');
                  }}
                />
              </View>

              {/* Date & Time Row */}
              <View style={styles.rowLayout}>
                <View style={[styles.formGroup, styles.halfColumn]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Date</Text>
                  <TextInput
                    style={[styles.textInputWithIcon, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g. Sat, May 25"
                    placeholderTextColor={colors.textTertiary}
                    value={date}
                    onChangeText={setDate}
                  />
                  <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={styles.fieldIcon} />
                </View>

                <View style={[styles.formGroup, styles.halfColumn]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Time</Text>
                  <TextInput
                    style={[styles.textInputWithIcon, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g. 6:00 PM"
                    placeholderTextColor={colors.textTertiary}
                    value={time}
                    onChangeText={setTime}
                  />
                  <Ionicons name="time-outline" size={18} color={colors.textSecondary} style={styles.fieldIcon} />
                </View>
              </View>

              {/* Location/Venue */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Location / Venue</Text>
                <View style={styles.inputContainerWithLeftIcon}>
                  <TextInput
                    style={[styles.textInputLeftIcon, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="Search for a location or address"
                    placeholderTextColor={colors.textTertiary}
                    value={locationName}
                    onChangeText={setLocationName}
                  />
                  <Ionicons name="location-outline" size={18} color={colors.textSecondary} style={styles.leftFieldIcon} />
                </View>
              </View>

              {/* Category Dropdown Selector */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
                <TouchableOpacity
                  style={[styles.dropdownSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setPickerType('category')}
                >
                  <Text style={[styles.dropdownText, { color: category ? colors.text : colors.textTertiary }]}>
                    {category || 'Select a category'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* City / Area Dropdown Selector */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>City / Area</Text>
                <TouchableOpacity
                  style={[styles.dropdownSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setPickerType('neighborhood')}
                >
                  <Text style={[styles.dropdownText, { color: neighborhood ? colors.text : colors.textTertiary }]}>
                    {neighborhood || 'Choose neighborhood'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Sticky Action Footer */}
            <View style={[styles.stickyFooter, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(20, insets.bottom + 8) }]}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Submit for Review</Text>
              </TouchableOpacity>
              <Text style={[styles.footerWarningText, { color: colors.textSecondary }]}>
                Events are reviewed before publishing to ensure community safety and guideline adherence. This usually takes 1-2 hours.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Dropdown Options Bottom-Sheet Selector */}
        {pickerType !== null && (
          <Modal
            transparent
            visible={pickerType !== null}
            animationType="fade"
            onRequestClose={() => setPickerType(null)}
          >
            <TouchableOpacity
              style={styles.pickerOverlay}
              activeOpacity={1}
              onPress={() => setPickerType(null)}
            >
              <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
                <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.pickerTitle, { color: colors.text }]}>
                    {pickerType === 'category' ? 'Select Category' : 'Select Neighborhood'}
                  </Text>
                  <TouchableOpacity onPress={() => setPickerType(null)}>
                    <Ionicons name="close" size={22} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.pickerOptionsList}>
                  {(pickerType === 'category' ? CATEGORIES : NEIGHBORHOODS).map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.pickerOptionRow,
                        (pickerType === 'category' ? category : neighborhood) === item && [styles.pickerOptionRowActive, { backgroundColor: colors.primaryLight }],
                      ]}
                      onPress={() => {
                        if (pickerType === 'category') {
                          setCategory(item);
                        } else {
                          setNeighborhood(item);
                        }
                        setPickerType(null);
                        if (validationError) setValidationError('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerOptionLabel,
                          { color: colors.text },
                          (pickerType === 'category' ? category : neighborhood) === item && [styles.pickerOptionLabelActive, { color: colors.primary }],
                        ]}
                      >
                        {item}
                      </Text>
                      {(pickerType === 'category' ? category : neighborhood) === item ? (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  mainContainer: {
    height: screenHeight * 0.92,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  formScroll: {
    padding: 20,
    gap: 20,
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
  formGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Poppins_600SemiBold',
    paddingLeft: 4,
  },
  dashedUploadCard: {
    aspectRatio: 16 / 9,
    width: '100%',
    backgroundColor: 'rgba(103,100,242,0.03)',
    borderColor: 'rgba(103,100,242,0.3)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(70, 72, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadCardMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4648D4',
    fontFamily: 'Poppins_600SemiBold',
  },
  uploadCardSubText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins_500Medium',
    marginTop: 2,
  },
  coverPreviewContainer: {
    aspectRatio: 16 / 9,
    width: '100%',
    borderRadius: 16,
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
  coverPresetContainer: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    gap: 8,
  },
  presetHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4648D4',
    fontFamily: 'Poppins_600SemiBold',
  },
  presetsScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  presetCard: {
    width: 100,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: 'transparent',
    borderWidth: 2,
    position: 'relative',
  },
  presetCardActive: {
    borderColor: '#4648D4',
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetLabelWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  presetLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Poppins_600SemiBold',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins_500Medium',
    borderColor: '#F3F4F6',
    borderWidth: 1,
  },
  textInputWithIcon: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 40,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins_500Medium',
    borderColor: '#F3F4F6',
    borderWidth: 1,
  },
  inputContainerWithLeftIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  textInputLeftIcon: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingLeft: 44,
    paddingRight: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins_500Medium',
    borderColor: '#F3F4F6',
    borderWidth: 1,
  },
  textArea: {
    height: 100,
  },
  rowLayout: {
    flexDirection: 'row',
    gap: 16,
  },
  halfColumn: {
    flex: 1,
    position: 'relative',
  },
  fieldIcon: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  leftFieldIcon: {
    position: 'absolute',
    left: 16,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderColor: '#F3F4F6',
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins_500Medium',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F3F4F6',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#4648D4',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  footerWarningText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Poppins_500Medium',
    paddingHorizontal: 16,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.5,
    paddingBottom: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
  pickerOptionRowActive: {
    backgroundColor: 'rgba(70, 72, 212, 0.05)',
  },
  pickerOptionLabel: {
    fontSize: 15,
    color: '#334155',
    fontFamily: 'Poppins_500Medium',
  },
  pickerOptionLabelActive: {
    color: '#4648D4',
    fontWeight: '600',
  },
});
