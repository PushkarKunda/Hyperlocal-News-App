import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Poll } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';

interface PollCardProps {
  poll: Poll;
  onVote?: (optionId: string) => void;
  onUndo?: () => void;
}

export function PollCard({ poll, onVote, onUndo }: PollCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const hasVoted = poll.hasVoted;
  const selectedOptionId = poll.selectedOptionId;

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    if (onVote) onVote(optionId);
  };

  const formattedDate = formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <MaterialIcons name="poll" size={20} color={colors.primary} />
          <Text style={[styles.authorName, { color: colors.textSecondary }]}>
            {poll.author.name}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.textTertiary }]}>{formattedDate}</Text>
      </View>

      <Text style={[styles.question, { color: colors.text }]}>{poll.question}</Text>

      <View style={styles.options}>
        {poll.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          // Calculate percentage based on total votes
          const votePercentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;

          return (
            <Pressable
              key={option.id}
              style={[
                styles.optionContainer,
                { borderColor: isSelected ? colors.primary : colors.border },
                isSelected && { backgroundColor: colors.primaryLight }
              ]}
              onPress={() => handleVote(option.id)}
              disabled={hasVoted}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLabelRow}>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  )}
                  <Text style={[
                    styles.optionText, 
                    { color: isSelected ? colors.primary : colors.text },
                    hasVoted && styles.optionTextVoted
                  ]}>
                    {option.text}
                  </Text>
                </View>
                {hasVoted && (
                  <Text style={[styles.percentage, { color: colors.textSecondary }]}>
                    {votePercentage}%
                  </Text>
                )}
              </View>
              {hasVoted && (
                <View 
                  style={[
                    styles.progressFill, 
                    { backgroundColor: isSelected ? colors.primary : colors.indicator, width: `${votePercentage}%` }
                  ]} 
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.voteCount, { color: colors.textTertiary }]}>
          {poll.totalVotes} votes
        </Text>
        
        {hasVoted && onUndo && (
          <Pressable 
            style={[styles.undoButton, { backgroundColor: colors.background }]} 
            onPress={onUndo}
          >
            <MaterialIcons name="undo" size={16} color={colors.primary} />
            <Text style={[styles.undoText, { color: colors.primary }]}>Undo Vote</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  question: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 20,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  options: {
    gap: 12,
  },
  optionContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 52,
    justifyContent: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextVoted: {
    fontWeight: '700',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 12,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 0,
    opacity: 0.12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  voteCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  undoText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
