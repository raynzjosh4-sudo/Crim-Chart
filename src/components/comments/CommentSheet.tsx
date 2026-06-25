import { ChatInputField } from '@/channel/pages/messages_tab/widgets/ChatInputField';
import { NativeDB } from '@/core/db/NativeDB';
import { supabase } from '@/core/supabase/supabaseConfig';
import { commentSyncManager } from '@/core/sync/CommentSyncManager';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { X } from 'lucide-react-native';
import { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions
} from 'react-native';
import 'react-native-get-random-values';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { CommentItem, CommentModel } from './CommentItem';
import { CreateReplyModal } from './CreateReplyModal/CreateReplyModal';

interface CommentSheetProps {
  postId: string;
  visible: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentSheet: React.FC<CommentSheetProps> = ({ postId, visible, onClose, onCommentAdded }) => {
  const currentUser = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [comments, _setComments] = useState<CommentModel[]>([]);
  const commentsRef = useRef<CommentModel[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setComments = (newComments: CommentModel[]) => {
    commentsRef.current = newComments;
    _setComments(newComments);
  };

  useEffect(() => {
    if (visible && postId) {
      loadComments();
      const subscription = commentSyncManager.subscribeToPostComments(postId, (newComment) => {
        // Prevent duplicate rendering by checking if we already have it optimistically
        if (!commentsRef.current.find(c => c.id === newComment.id)) {
          setComments([newComment as CommentModel, ...commentsRef.current]);
        }
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [visible, postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch locally first for instant UI
      let localComments = await NativeDB.getComments(postId);
      setComments(localComments);

      // 2. Query Supabase for latest comments
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Fetch liked status for these comments
        let likedCommentIds = new Set<string>();
        if (currentUser && data.length > 0) {
          const { data: likedData } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .in('comment_id', data.map(c => c.id))
            .eq('user_id', currentUser.id);
            
          likedCommentIds = new Set(likedData?.map(d => d.comment_id) || []);
        }

        // Seed interaction store
        const seedCommentInteraction = useInteractionStore.getState().seedCommentInteraction;
        data.forEach(comment => {
          seedCommentInteraction(comment.id, comment.likes_count, likedCommentIds.has(comment.id));
        });

        // 3. Upsert remote comments to local DB to update cache
        const remoteComments = data.map(c => ({ ...c, is_pending: false }));
        
        if (Platform.OS === 'web') {
          setComments(remoteComments);
        } else {
          await NativeDB.upsertComments(remoteComments);
          // 4. Reload local to include any pending offline ones + new remote ones
          localComments = await NativeDB.getComments(postId);
          setComments(localComments);
        }
      }
    } catch (e) {
      console.error('Failed to load comments', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (submittedText: string, media: any[]) => {
    if (!submittedText.trim() && media.length === 0) return;
    if (!currentUser) return;

    setIsSubmitting(true);

    let mediaUrl = null;
    let mediaType = undefined;
    if (media.length > 0) {
      mediaUrl = media[0].uri;
      mediaType = media[0].type;
    }

    const newComment: CommentModel = {
      id: uuidv4(),
      post_id: postId,
      author_id: currentUser.id,
      author_username: currentUser.displayName || 'User',
      author_avatar_url: currentUser.profileImageUrl || null,
      text: submittedText.trim(),
      media_url: mediaUrl,
      media_type: mediaType,
      created_at: new Date().toISOString(),
      likes_count: 0,
      is_pending: true,
    };

    try {
      // Optimistic UI update
      setComments([newComment, ...comments]);
      setInputText('');
      Keyboard.dismiss();

      // Save to NativeDB locally
      await NativeDB.upsertComments([newComment]);

      // Trigger background sync for this (and any other) pending comment
      if (Platform.OS === 'web') {
        commentSyncManager.syncPendingComments([newComment]);
      } else {
        commentSyncManager.syncPendingComments();
      }

      if (onCommentAdded) onCommentAdded();
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (commentId: string) => {
    // Optimistic like
    const updatedComments = comments.map(c =>
      c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c
    );
    setComments(updatedComments);
    // TODO: Save like to DB
  };

  const handleReply = (commentId: string, username: string) => {
    setInputText(`@${username} `);
  };

  const isDesktop = Platform.OS === 'web' && width >= 768;

  if (isDesktop) {
    return (
      <CreateReplyModal
        postId={postId}
        visible={visible}
        onClose={onClose}
        onCommentAdded={onCommentAdded}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.container}>
            <View style={styles.header}>
              <View style={{ width: 24 }} />
              <Text style={styles.title}>Comments</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <CommentItem
                    comment={item}
                    onLike={handleLike}
                    onReply={handleReply}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}

            <View style={{ paddingBottom: Math.max(insets.bottom, 12), backgroundColor: '#000' }}>
              <ChatInputField
                onSubmitted={handleSubmit}
                onChangeText={setInputText}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    height: '75%',
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#FFF',
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
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  listContent: {
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0A0A0A',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#FFF',
    fontSize: 14,
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 0,
  }
});
