import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { usePostComments, useAddPostComment } from '@/hooks/usePosts';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { formatTimeAgo } from '@/utils/formatters';

interface PostCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postUid: string | null;
}

export const PostCommentsModal = ({ visible, onClose, postUid }: PostCommentsModalProps) => {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();

  const [commentText, setCommentText] = useState('');

  const { data: rawComments, isLoading } = usePostComments(postUid);
  const { mutate: addComment, isPending: isAdding } = useAddPostComment();

  const comments = Array.isArray(rawComments)
    ? rawComments
    : (rawComments as any)?.comments || (rawComments as any)?.items || (rawComments as any)?.data || [];

  const handlePostComment = () => {
    if (!postUid || !commentText.trim()) return;
    addComment(
      { postUid, commentText: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText('');
        },
        onError: (error: any) => {
          Alert.alert('Error', 'Failed to post comment. ' + (error?.message || 'Please try again.'));
        },
      }
    );
  };

  const renderComment = ({ item }: { item: any }) => {
    const isOwner = user?.user_uid === item.user_uid;
    const avatarUri = item.user_avatar || item.user_profile_picture || item.avatar || 'https://placehold.co/100x100/E2E8F0/1E293B?text=User';
    const authorName = item.user_display_name || item.user_name || item.username || item.author_name || 'Community Member';
    const timeText = item.time_ago || (item.created_at ? formatTimeAgo(item.created_at) : '');
    const contentText = item.comment_text || item.content || item.text || '';

    return (
      <View style={[styles.commentContainer, { borderBottomColor: colors.border }]}>
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {authorName}
            </Text>
            {Boolean(timeText) && (
              <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                {timeText}
              </Text>
            )}
          </View>
          <Text style={[styles.commentText, { color: colors.textSecondary }]}>
            {contentText}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Comments ({comments.length})
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No comments yet. Be the first to comment!
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              renderItem={renderComment}
              contentContainerStyle={styles.listContainer}
            />
          )}

          {/* Comment Input */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.background, borderTopColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              onPress={handlePostComment}
              disabled={!commentText.trim() || isAdding}
              style={[
                styles.sendBtn,
                { backgroundColor: colors.primary },
                (!commentText.trim() || isAdding) && styles.disabledBtn,
              ]}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
