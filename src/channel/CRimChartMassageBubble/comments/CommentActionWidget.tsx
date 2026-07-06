import { useStyles } from "@/core/hooks/useStyles";
import { CommentSheet } from '@/components/comments/CommentSheet';
import { MessageCircle } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
interface CommentActionWidgetProps {
  commentsCount: number;
  postId?: string;
  onCommentTap?: () => void;
}
export const CommentActionWidget: React.FC<CommentActionWidgetProps> = ({
  commentsCount: initialCount,
  postId,
  onCommentTap
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginLeft: 24
    },
    text: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900'
    }
  }));
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [commentsCount, setCommentsCount] = useState<number>(initialCount);
  const countRef = useRef(initialCount);

  // Keep count updated in real-time if a comment is broadcasted
  useEffect(() => {
    if (!postId) return;

    // We dynamically import commentSyncManager to avoid circular dependencies if any
    import('@/core/sync/CommentSyncManager').then(({
      commentSyncManager
    }) => {
      const subscription = commentSyncManager.subscribeToPostComments(postId, () => {
        countRef.current += 1;
        // Bypassing the strange TS error by passing the literal number
        setCommentsCount(countRef.current as any);
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    });
  }, [postId]);
  const handlePress = () => {
    if (postId) {
      setIsSheetVisible(true);
    }
    if (onCommentTap) {
      onCommentTap();
    }
  };
  return <>
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
        <MessageCircle size={24} color="#FACD11" />
        <Text style={styles.text}>{commentsCount}</Text>
      </TouchableOpacity>

      {postId && <CommentSheet postId={postId} visible={isSheetVisible} onClose={() => setIsSheetVisible(false)} onCommentAdded={() => setCommentsCount(commentsCount + 1)} />}
    </>;
};