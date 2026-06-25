import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  X,
  Image as ImageIcon,
  Smile,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme, useThemeStore } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { EmojiPickerWidget } from '@/components/EmojiPicker/EmojiPickerWidget';
import * as ImagePicker from 'expo-image-picker';
import { CommentItem, CommentModel } from '../CommentItem';
import { CommentListSkeleton } from '@/components/skeletons/Skeletons';
import { NativeDB } from '@/core/db/NativeDB';
import { supabase } from '@/core/supabase/supabaseConfig';
import { commentSyncManager } from '@/core/sync/CommentSyncManager';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
export interface PostDetails {
  authorName: string;
  authorHandle: string;
  authorAvatarUrl: string;
  isVerified?: boolean;
  timeAgo: string;
  content: string;
}

export interface CreateReplyModalProps {
  postId: string;
  visible: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CreateReplyModal: React.FC<CreateReplyModalProps> = ({
  postId,
  visible,
  onClose,
  onCommentAdded,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const [comments, _setComments] = React.useState([] as CommentModel[]);
  const commentsRef = React.useRef([] as CommentModel[]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const setComments = (newComments: CommentModel[]) => {
    commentsRef.current = newComments;
    _setComments(newComments);
  };

  React.useEffect(() => {
    if (visible && postId) {
      loadComments();
      const subscription = commentSyncManager.subscribeToPostComments(postId, (newComment) => {
        if (!commentsRef.current.find(c => c.id === newComment.id)) {
          setComments([newComment as CommentModel, ...commentsRef.current]);
        }
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [visible, postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      let localComments = await NativeDB.getComments(postId);
      setComments(localComments);

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) {
        if (Platform.OS === 'web') window.alert('Supabase load error: ' + error.message);
      }

      if (!error && data) {
        let likedCommentIds = new Set<string>();
        if (currentUser && data.length > 0) {
          const { data: likedData } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .in('comment_id', data.map(c => c.id))
            .eq('user_id', currentUser.id);
          likedCommentIds = new Set(likedData?.map(d => d.comment_id) || []);
        }

        const seedCommentInteraction = useInteractionStore.getState().seedCommentInteraction;
        data.forEach(comment => {
          seedCommentInteraction(comment.id, comment.likes_count, likedCommentIds.has(comment.id));
        });

        const remoteComments = data.map(c => ({ ...c, is_pending: false }));
        
        if (Platform.OS === 'web') {
          setComments(remoteComments);
        } else {
          await NativeDB.upsertComments(remoteComments);
          localComments = await NativeDB.getComments(postId);
          setComments(localComments);
        }
      }
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert('loadComments exception: ' + e?.message);
      console.error('Failed to load comments', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (commentId: string) => {
    const updatedComments = comments.map(c =>
      c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c
    );
    setComments(updatedComments);
  };

  const handleReplyToComment = (commentId: string, username: string) => {
    setText(`@${username} `);
  };
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [text, setText] = React.useState('');
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [inputHeight, setInputHeight] = React.useState(0);
  const [selectedMediaUrl, setSelectedMediaUrl] = React.useState(null as string | null);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const scale = useThemeStore((s) => s.scale);

  const isDesktop = Platform.OS === 'web' && width >= 768;

  console.log(`[CreateReplyModal] Rendered. visible=${visible}, commentsCount=${comments?.length}`);

  const handleReply = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && !selectedMediaUrl) return;
    if (!currentUser) return;

    setIsSubmitting(true);
    let mediaUrl: string | null = null;
    let mediaType: 'image' | 'video' | 'audio' | undefined = undefined;

    if (selectedMediaUrl) {
      mediaUrl = selectedMediaUrl;
      mediaType = 'image';
    }

    const newComment: CommentModel = {
      id: crypto.randomUUID ? crypto.randomUUID() : uuidv4(),
      post_id: postId,
      author_id: currentUser.id,
      author_username: currentUser.displayName || 'User',
      author_avatar_url: currentUser.profileImageUrl || null,
      text: trimmedText,
      media_url: mediaUrl,
      media_type: mediaType,
      created_at: new Date().toISOString(),
      likes_count: 0,
      is_pending: true,
    };

    try {
      setComments([newComment, ...comments]);
      setText('');
      setSelectedMediaUrl(null);

      await NativeDB.upsertComments([newComment]);
      
      if (Platform.OS === 'web') {
        commentSyncManager.syncPendingComments([newComment]);
      } else {
        commentSyncManager.syncPendingComments();
      }
      
      if (onCommentAdded) onCommentAdded();
      
      if (Platform.OS === 'web') window.alert('Comment passed to NativeDB and SyncManager successfully!');
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert('Failed to post comment: ' + e?.message);
      console.error('Failed to post comment', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMediaUrl(result.assets[0].uri);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.container, !isDesktop && { width: '100%', height: '100%', borderRadius: 0 }]}>
          {/* Header */}
          <View style={[styles.header, !isDesktop && { paddingTop: Math.max(insets.top, 16) }]}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <X size={20 * scale} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, paddingHorizontal: 16 * scale }}>
            {isLoading ? (
              <CommentListSkeleton count={1} />
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
              </View>
            ) : (
              <FlashList
                {...({
                  data: comments,
                  keyExtractor: (item: CommentModel) => item.id,
                  estimatedItemSize: 80,
                  renderItem: ({ item }: { item: CommentModel }) => (
                    <CommentItem
                      comment={item}
                      onLike={handleLike}
                      onReply={handleReplyToComment}
                    />
                  ),
                  contentContainerStyle: styles.listContent,
                  showsVerticalScrollIndicator: false,
                } as any)}
              />
            )}
          </View>

          {/* Current User Input Section */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputSection}>
              <View style={styles.leftCol}>
                {currentUser?.profileImageUrl ? (
                  <Image source={{ uri: currentUser.profileImageUrl }} style={styles.avatar} />
                ) : (
                  <Image
                    source={{ uri: 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=Me' }}
                    style={styles.avatar}
                  />
                )}
              </View>
              <View style={styles.rightCol}>
                <TextInput
                  style={[styles.textInput, { height: Math.max(120 * scale, inputHeight) }]}
                  placeholder="Post your reply"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  autoFocus
                  value={text}
                  onChangeText={setText}
                  onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                />
                {selectedMediaUrl && (
                  <View style={styles.mediaPreviewContainer}>
                    <Image source={{ uri: selectedMediaUrl }} style={styles.mediaPreview} />
                    <TouchableOpacity 
                      style={styles.removeMediaBtn} 
                      onPress={() => setSelectedMediaUrl(null)}
                    >
                      <X size={16 * scale} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Emoji Picker Dropdown */}
            {showEmojiPicker && (
              <View style={{ paddingBottom: 16 * scale, paddingHorizontal: 16 * scale }}>
                <EmojiPickerWidget
                  onEmojiSelect={(emoji) => {
                    setText(text + emoji);
                    setShowEmojiPicker(false);
                  }}
                  onLottieSelect={(url) => {
                    setShowEmojiPicker(false);
                  }}
                />
              </View>
            )}
          </View>

          {/* Footer Toolbar */}
          <View style={styles.footer}>
            <View style={styles.toolbar}>
              <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
                <ImageIcon size={20 * scale} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile size={20 * scale} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.replyBtn, (text.trim().length === 0 && !selectedMediaUrl) && styles.replyBtnDisabled]}
              onPress={handleReply}
            >
              <Text style={[styles.replyBtnText, (text.trim().length === 0 && !selectedMediaUrl) && styles.replyBtnTextDisabled]}>
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  container: {
    width: 600 * scale,
    minHeight: 400 * scale,
    maxWidth: '100%',
    maxHeight: '85%',
    backgroundColor: colors.background,
    borderRadius: 16 * scale,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16 * scale,
    paddingVertical: 12 * scale,
  },
  iconBtn: {
    width: 36 * scale,
    height: 36 * scale,
    borderRadius: 18 * scale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentScroll: {
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 16 * scale,
    paddingTop: 8 * scale,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40 * scale,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
  },
  listContent: {
    paddingVertical: 16 * scale,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: 8 * scale,
  },
  inputSection: {
    flexDirection: 'row',
    marginTop: 4 * scale,
    paddingHorizontal: 16 * scale,
  },
  leftCol: {
    width: 48 * scale,
    alignItems: 'center',
  },
  rightCol: {
    flex: 1,
    paddingLeft: 8 * scale,
  },
  avatar: {
    width: 40 * scale,
    height: 40 * scale,
    borderRadius: 20 * scale,
    backgroundColor: colors.surfaceVariant,
  },
  textInput: {
    color: colors.text,
    fontSize: 20 * scale,
    paddingTop: 8 * scale,
    paddingBottom: 24 * scale,
    minHeight: 120 * scale,
    outlineStyle: 'none',
  } as any,
  mediaPreviewContainer: {
    marginTop: 8 * scale,
    marginBottom: 16 * scale,
    position: 'relative',
    borderRadius: 12 * scale,
    overflow: 'hidden',
    width: 200 * scale,
    height: 200 * scale,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12 * scale,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 8 * scale,
    right: 8 * scale,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16 * scale,
    paddingVertical: 12 * scale,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8 * scale,
  },
  replyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16 * scale,
    paddingVertical: 8 * scale,
    borderRadius: 999,
  },
  replyBtnDisabled: {
    backgroundColor: colors.surfaceVariant,
  },
  replyBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15 * scale,
  },
  replyBtnTextDisabled: {
    color: colors.textSecondary,
  },
});
