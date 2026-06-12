import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';

interface CommentActionWidgetProps {
  commentsCount: number;
  onCommentTap?: () => void;
}

export const CommentActionWidget: React.FC<CommentActionWidgetProps> = ({
  commentsCount,
  onCommentTap,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onCommentTap} activeOpacity={0.7}>
      <MessageSquare size={24} color="#FACD11" />
      <Text style={styles.text}>{commentsCount}</Text>
    </TouchableOpacity>
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
