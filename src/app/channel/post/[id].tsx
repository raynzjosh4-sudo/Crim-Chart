import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StandalonePostView } from '@/components/post/StandalonePostView';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { useTranslation } from 'react-i18next';

export default function ChannelPostPage() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const styles = useStyles(themeStyles);
  const { t } = useTranslation();

  if (!id) return null;

  return (
    <View style={styles.container}>
      <ChartAppBar 
        title={t('channel_post', 'Channel Post')}
      />
      <StandalonePostView 
        postId={id} 
        entityType={type || 'channel_post'} 
      />
    </View>
  );
}

const themeStyles = (colors: ThemeTokens, scale: number) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
};
