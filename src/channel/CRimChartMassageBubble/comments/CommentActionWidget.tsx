import { CommentSheet } from '@/components/comments/CommentSheet';
import { MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CommentActionWidgetProps {
  commentsCount: number;
  postId?: string;
  onCommentTap?: () => void;
}

export const CommentActionWidget: React.FC<CommentActionWidgetProps> = ({
  commentsCount: initialCount,
  postId,
  onCommentTap,
}) => {
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCount);

  const handlePress = () => {
    if (postId) {
      setIsSheetVisible(true);
    }
    if (onCommentTap) {
      onCommentTap();
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
        <MessageCircle size={24} color="#FACD11" />
        <Text style={styles.text}>{commentsCount}</Text>
      </TouchableOpacity>

      {postId && (
        <CommentSheet
          postId={postId}
          visible={isSheetVisible}
          onClose={() => setIsSheetVisible(false)}
          onCommentAdded={() => setCommentsCount(commentsCount + 1)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 24,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
