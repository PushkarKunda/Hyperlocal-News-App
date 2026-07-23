import React, { useState, useEffect } from 'react';
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
import { useNewsComments, useAddComment, useDeleteComment } from '@/hooks/useNews';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { useAppColorScheme } from '@/hooks/useAppColorScheme';
import { formatTimeAgo } from '@/utils/formatters';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  newsUid: string;
}

export const CommentsModal = ({ visible, onClose, newsUid }: CommentsModalProps) => {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();

  const [commentText, setCommentText] = useState('');

  const { data: comments, isLoading } = useNewsComments(newsUid);
  const { mutate: addComment, isPending: isAdding } = useAddComment();
  const { mutate: deleteComment } = useDeleteComment();

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    addComment(
      { uid: newsUid, comment_text: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText('');
        },
        onError: (error: any) => {
          Alert.alert('Error', 'Failed to post comment. Please try again.' + error.message);
        },
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteComment({ uid: newsUid, commentId });
        },
      },
    ]);
  };

  const renderComment = ({ item }: { item: any }) => {
    const isOwner = user?.user_uid === item.user_uid;
    return (
      <View style={[styles.commentContainer, { borderBottomColor: colors.border }]}>
        <Image
          source={{ uri: item.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user_name || 'User')}&background=6063EE&color=fff` }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.user_name || 'User'}</Text>
            <Text style={[styles.timeText, { color: colors.textTertiary }]}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text style={[styles.commentText, { color: colors.textSecondary }]}>{item.comment_text}</Text>
        </View>
        {isOwner && (
          <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
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
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Comment List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderComment}
              contentContainerStyle={styles.listContent}
              initialNumToRender={8}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No comments yet. Be the first to comment!
                </Text>
              }
            />
          )}

          {/* Input Area */}
          <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <Image
              source={{ uri: user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_name || user?.name || 'User')}&background=6063EE&color=fff` }}
              style={styles.inputAvatar}
              contentFit="cover"
            />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: isDark ? '#2A2A3C' : '#F1F5F9' }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.postBtn,
                { backgroundColor: commentText.trim() ? colors.primary : colors.border },
              ]}
              disabled={!commentText.trim() || isAdding}
              onPress={handlePostComment}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" />
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  postBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
