import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PostContentProps {
  content: string;
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
  },
});
