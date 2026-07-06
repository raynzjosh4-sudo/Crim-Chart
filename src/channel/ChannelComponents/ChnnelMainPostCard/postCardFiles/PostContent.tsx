import React from 'react';
import { View, Text } from 'react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';

interface PostContentProps {
  content: string;
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
  const styles = useStyles(themeStyles);

  if (!content) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{content}</Text>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    paddingHorizontal: 16 * scale,
    marginBottom: 12 * scale,
  },
  text: {
    color: colors.text,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
  },
});
