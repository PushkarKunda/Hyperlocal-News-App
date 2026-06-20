// app/(publisher)/create-poll.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useCreatePoll } from '@/hooks/usePolls';
import { BecomePublisherView } from '@/components/common/BecomePublisherView';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export default function CreatePollScreen() {
    const colorScheme = useAppColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { height: screenHeight } = useWindowDimensions();

    const { user } = useAuthStore();

    // Role check from API
    const isPublisher = (user?.role ?? 0) >= 2;

    // ─── Form State ──────────────────────────────────────────────────────────────
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); // min 2 options
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ─── API Hook ────────────────────────────────────────────────────────────────
    const { mutate: createPoll, isPending } = useCreatePoll();

    // ─── Guard: Non-publisher ─────────────────────────────────────────────────────
    if (!isPublisher) {
        return (
            <BecomePublisherView
                onBack={() => router.back()}
                title="Publisher Access"
            />
        );
    }

    // ─── Option Handlers ──────────────────────────────────────────────────────────
    const handleOptionChange = (text: string, index: number) => {
        const updated = [...options];
        updated[index] = text;
        setOptions(updated);

        // Clear error for this option
        if (errors[`option_${index}`]) {
            const newErrors = { ...errors };
            delete newErrors[`option_${index}`];
            setErrors(newErrors);
        }
    };

    const addOption = () => {
        if (options.length < MAX_OPTIONS) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length <= MIN_OPTIONS) {
            Alert.alert('Minimum Options', `A poll must have at least ${MIN_OPTIONS} options.`);
            return;
        }
        setOptions(options.filter((_, i) => i !== index));
    };

    // ─── Validation ───────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!question.trim() || question.trim().length < 10) {
            newErrors.question = 'Question must be at least 10 characters.';
        }

        const filledOptions = options.filter((o) => o.trim());
        if (filledOptions.length < MIN_OPTIONS) {
            newErrors.options = `Please fill in at least ${MIN_OPTIONS} options.`;
        }

        options.forEach((opt, index) => {
            if (!opt.trim()) {
                newErrors[`option_${index}`] = 'Option cannot be empty.';
            }
        });

        if (expiresAt && expiresAt <= new Date()) {
            newErrors.expires = 'Expiry date must be in the future.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ─── Submit ───────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!validate()) {
            Alert.alert('Validation Error', 'Please fix the highlighted fields.');
            return;
        }

        createPoll(
            {
                question: question.trim(),
                options: options.map((o) => o.trim()),
                expires_at: expiresAt ? expiresAt.toISOString() : null,
            },
            {
                onSuccess: () => {
                    Alert.alert(
                        '✅ Poll Created!',
                        'Your poll is now live for the community.',
                        [{ text: 'Done', onPress: () => router.back() }]
                    );
                },
                onError: (error: any) => {
                    Alert.alert('Error', error.message || 'Failed to create poll.');
                },
            }
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────────
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Decorative blurs */}
            <View style={styles.topRightBlur} />

            {/* Header */}
            <View style={[
                styles.header,
                {
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                    paddingTop: Math.max(12, insets.top),
                },
            ]}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Create Poll</Text>
                <View style={styles.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 120 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Question Input */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            QUESTION
                        </Text>
                        <View style={[
                            styles.inputCard,
                            { backgroundColor: colors.surface },
                            errors.question && styles.inputError,
                        ]}>
                            <TextInput
                                style={[styles.questionInput, { color: colors.text }]}
                                placeholder="Ask your community something..."
                                placeholderTextColor={isDark ? '#464554' : '#C7C4D7'}
                                value={question}
                                onChangeText={(text) => {
                                    setQuestion(text);
                                    if (errors.question) {
                                        setErrors((prev) => { const e = { ...prev }; delete e.question; return e; });
                                    }
                                }}
                                multiline
                                maxLength={200}
                            />
                            <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                                {question.length}/200
                            </Text>
                        </View>
                        {errors.question && (
                            <Text style={styles.errorText}>{errors.question}</Text>
                        )}
                    </View>

                    {/* Options */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                                OPTIONS
                            </Text>
                            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
                                {options.length}/{MAX_OPTIONS}
                            </Text>
                        </View>

                        {errors.options && (
                            <Text style={styles.errorText}>{errors.options}</Text>
                        )}

                        <View style={styles.optionsList}>
                            {options.map((option, index) => (
                                <View key={index} style={styles.optionRow}>
                                    {/* Index badge */}
                                    <View style={[styles.optionIndex, { backgroundColor: colors.primaryLight }]}>
                                        <Text style={[styles.optionIndexText, { color: colors.primary }]}>
                                            {index + 1}
                                        </Text>
                                    </View>

                                    {/* Input */}
                                    <View style={[
                                        styles.optionInputWrapper,
                                        { backgroundColor: colors.surface },
                                        errors[`option_${index}`] && styles.inputError,
                                    ]}>
                                        <TextInput
                                            style={[styles.optionInput, { color: colors.text }]}
                                            placeholder={`Option ${index + 1}`}
                                            placeholderTextColor={isDark ? '#464554' : '#C7C4D7'}
                                            value={option}
                                            onChangeText={(text) => handleOptionChange(text, index)}
                                            maxLength={100}
                                        />
                                    </View>

                                    {/* Remove button */}
                                    {options.length > MIN_OPTIONS && (
                                        <TouchableOpacity
                                            style={[styles.removeButton, { backgroundColor: '#FEE2E2' }]}
                                            onPress={() => removeOption(index)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="close" size={16} color="#DC2626" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Add option button */}
                        {options.length < MAX_OPTIONS && (
                            <TouchableOpacity
                                style={[styles.addOptionButton, { borderColor: colors.border }]}
                                onPress={addOption}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                                <Text style={[styles.addOptionText, { color: colors.primary }]}>
                                    Add Option
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Expiry Date (Optional) */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            EXPIRY DATE (OPTIONAL)
                        </Text>

                        <TouchableOpacity
                            style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            <Text style={[styles.dateButtonText, { color: expiresAt ? colors.text : colors.textSecondary }]}>
                                {expiresAt
                                    ? expiresAt.toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })
                                    : 'No expiry date (runs indefinitely)'}
                            </Text>
                            {expiresAt && (
                                <TouchableOpacity
                                    onPress={() => setExpiresAt(null)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>

                        {errors.expires && (
                            <Text style={styles.errorText}>{errors.expires}</Text>
                        )}

                        {/* Date Picker */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={expiresAt ?? new Date()}
                                mode="date"
                                minimumDate={new Date()}
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (event.type === 'set' && date) {
                                        setExpiresAt(date);
                                    }
                                }}
                            />
                        )}
                    </View>

                    {/* Info Banner */}
                    <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
                        <Ionicons name="information-circle" size={18} color={colors.primary} />
                        <Text style={[styles.infoBannerText, { color: colors.primary }]}>
                            Your poll will be visible to the community immediately after creation.
                            Users must be logged in to vote.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Sticky Footer */}
            <View style={[
                styles.footer,
                {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: Math.max(20, insets.bottom + 8),
                },
            ]}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: colors.primary },
                        isPending && { opacity: 0.7 },
                    ]}
                    onPress={handleSubmit}
                    disabled={isPending}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isPending ? 'hourglass' : 'bar-chart'}
                        size={20}
                        color="#fff"
                    />
                    <Text style={styles.submitText}>
                        {isPending ? 'Creating Poll...' : 'Create Poll'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topRightBlur: {
        position: 'absolute',
        top: -64, right: -64,
        width: 200, height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(70,72,212,0.06)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        zIndex: 10,
    },
    closeButton: {
        width: 40, height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    headerSpacer: { width: 40 },
    scrollContent: {
        padding: 20,
        gap: 24,
    },
    section: { gap: 10 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.6,
        fontFamily: 'Poppins_600SemiBold',
    },
    sectionHint: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    inputCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        gap: 8,
    },
    inputError: {
        borderWidth: 1.5,
        borderColor: '#EF4444',
    },
    questionInput: {
        fontSize: 16,
        fontFamily: 'Poppins_500Medium',
        lineHeight: 24,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
        alignSelf: 'flex-end',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        fontFamily: 'Poppins_500Medium',
        marginTop: 2,
    },
    optionsList: { gap: 10 },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    optionIndex: {
        width: 32, height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionIndexText: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    optionInputWrapper: {
        flex: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    optionInput: {
        fontSize: 15,
        fontFamily: 'Poppins_500Medium',
    },
    removeButton: {
        width: 32, height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        marginTop: 4,
    },
    addOptionText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins_600SemiBold',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
    },
    dateButtonText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins_500Medium',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 14,
        borderRadius: 12,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        lineHeight: 19,
    },
    footer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        borderTopWidth: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        zIndex: 10,
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#4648D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
});