import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';

interface CompetitionCommentButtonProps {
  comments: number;
  onTap?: () => void;
}

export const CompetitionCommentButton: React.FC<CompetitionCommentButtonProps> = ({
  comments,
  onTap,
}) => {
  return (
    <TouchableOpacity onPress={onTap} activeOpacity={0.8}>
      <View style={styles.container}>
        <MessageSquare color="white" size={28} />
        <View style={{ height: 4 }} />
        <Text style={styles.text}>
          {comments}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.54)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
