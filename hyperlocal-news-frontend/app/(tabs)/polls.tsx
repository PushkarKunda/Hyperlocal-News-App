// app/(tabs)/polls.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useActivePolls, useVotePoll } from '@/hooks/usePolls';
import { Poll } from '@/services/api/polls';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BecomePublisherView } from '@/components/common/BecomePublisherView';

export default function PollsScreen() {
    const colorScheme = useAppColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const { user } = useAuthStore();

    // ✅ Role check from API (role >= 2 = publisher)
    const isPublisher = (user?.role ?? 0) >= 2;
    const isAuthenticated = !!user;

    const [showGatedView, setShowGatedView] = useState(false);

    // ─── API Hooks ──────────────────────────────────────────────────────────────
    const {
        data: pollsData,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useActivePolls({ limit: 20 });

    const { mutate: votePoll, isPending: isVoting } = useVotePoll();

    const polls = pollsData?.items ?? [];

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const handleVote = (pollUid: string, optionIndex: number) => {
        if (!isAuthenticated) {
            Alert.alert(
                'Login Required',
                'Please login to vote on polls.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => router.push('/(auth)/login') },
                ]
            );
            return;
        }

        votePoll(
            { pollUid, optionIndex },
            {
                onSuccess: () => {
                    Alert.alert('✅ Vote Recorded', 'Your vote has been submitted!');
                },
                onError: (error: any) => {
                    Alert.alert('Error', error.message || 'Failed to submit vote');
                },
            }
        );
    };

    const handleCreatePoll = () => {
        if (isPublisher) {
            router.push('/(publisher)/create-poll' as any);
        } else {
            setShowGatedView(true);
        }
    };

    // ─── Gated View ─────────────────────────────────────────────────────────────
    if (showGatedView) {
        return (
            <BecomePublisherView
                onBack={() => setShowGatedView(false)}
                title="Publisher Access"
            />
        );
    }

    // ─── Loading ─────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <LoadingSpinner
                fullScreen
                text="Loading polls..."
                colorScheme={colorScheme ?? 'light'}
            />
        );
    }

    // ─── Error ───────────────────────────────────────────────────────────────────
    if (isError) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={56} color={colors.textSecondary} />
                <Text style={[styles.errorTitle, { color: colors.text }]}>
                    Failed to load polls
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary }]}
                    onPress={() => refetch()}
                >
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ─── Render Poll Card ─────────────────────────────────────────────────────────
    const renderPollCard = ({ item }: { item: Poll }) => {
        const totalVotes = item.votes.reduce((sum, v) => sum + v, 0);
        const hasExpired = item.expires_at
            ? new Date(item.expires_at) < new Date()
            : false;

        return (
            <View style={[styles.pollCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                {/* Header */}
                <View style={styles.pollHeader}>
                    <View style={[styles.pollBadge, { backgroundColor: colors.primaryLight }]}>
                        <Ionicons name="bar-chart" size={14} color={colors.primary} />
                        <Text style={[styles.pollBadgeText, { color: colors.primary }]}>POLL</Text>
                    </View>
                    {hasExpired && (
                        <View style={styles.expiredBadge}>
                            <Text style={styles.expiredText}>ENDED</Text>
                        </View>
                    )}
                    {item.expires_at && !hasExpired && (
                        <Text style={[styles.expiresText, { color: colors.textSecondary }]}>
                            Ends {new Date(item.expires_at).toLocaleDateString()}
                        </Text>
                    )}
                </View>

                {/* Question */}
                <Text style={[styles.question, { color: colors.text }]}>
                    {item.question}
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {item.options.map((option, index) => {
                        const voteCount = item.votes[index] ?? 0;
                        const percentage = totalVotes > 0
                            ? Math.round((voteCount / totalVotes) * 100)
                            : 0;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    { borderColor: colors.border },
                                    hasExpired && styles.optionDisabled,
                                ]}
                                onPress={() => !hasExpired && handleVote(item.poll_uid, index)}
                                disabled={hasExpired || isVoting}
                                activeOpacity={0.7}
                            >
                                {/* Progress bar background */}
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${percentage}%`,
                                            backgroundColor: colors.primaryLight,
                                        },
                                    ]}
                                />

                                {/* Option content */}
                                <View style={styles.optionContent}>
                                    <Text style={[styles.optionText, { color: colors.text }]}>
                                        {option}
                                    </Text>
                                    <Text style={[styles.optionPercent, { color: colors.primary }]}>
                                        {percentage}%
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Footer */}
                <View style={styles.pollFooter}>
                    <Text style={[styles.totalVotes, { color: colors.textSecondary }]}>
                        {totalVotes.toLocaleString()} {totalVotes === 1 ? 'vote' : 'votes'}
                    </Text>
                    <Text style={[styles.createdAt, { color: colors.textSecondary }]}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        );
    };

    // ─── Empty State ──────────────────────────────────────────────────────────────
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Active Polls
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {isPublisher
                    ? 'Create the first poll for your community!'
                    : 'Check back later for community polls.'}
            </Text>
            {isPublisher && (
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.primary }]}
                    onPress={handleCreatePoll}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.createButtonText}>Create Poll</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // ─── Main Render ──────────────────────────────────────────────────────────────
    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={{ width: 40 }} />

                <Text style={[styles.headerTitle, { color: colors.text }]}>Polls</Text>

                {/* FAB-style create button */}
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primaryLight }]}
                    onPress={handleCreatePoll}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Polls List */}
            <FlatList
                data={polls}
                keyExtractor={(item) => item.poll_uid}
                renderItem={renderPollCard}
                contentContainerStyle={[
                    styles.listContent,
                    polls.length === 0 && styles.listContentEmpty,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={renderEmpty}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    menuButton: {
        width: 40, height: 40,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    addButton: {
        width: 40, height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        gap: 16,
        paddingBottom: 100,
    },
    listContentEmpty: {
        flex: 1,
    },

    // Poll Card
    pollCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    pollHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pollBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    pollBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 0.5,
    },
    expiredBadge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    expiredText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#DC2626',
        fontFamily: 'Poppins_700Bold',
    },
    expiresText: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    question: {
        fontSize: 17,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
        lineHeight: 24,
    },
    optionsContainer: { gap: 10 },
    optionButton: {
        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden',
        height: 48,
        position: 'relative',
        justifyContent: 'center',
    },
    optionDisabled: { opacity: 0.7 },
    progressBar: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        borderRadius: 10,
    },
    optionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        zIndex: 1,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins_600SemiBold',
        flex: 1,
    },
    optionPercent: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    pollFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
    totalVotes: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
    },
    createdAt: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },

    // Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
        textAlign: 'center',
    },
    emptyDesc: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
        lineHeight: 22,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Poppins_600SemiBold',
    },
});