import { CommentSheet } from '@/components/comments/CommentSheet';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useDesktopVidsStore } from '@/mainFeed/pages/main_page_widgets/useDesktopVidsStore';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const DesktopVidsRightSidebar = () => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { activeVideoId, activeChannelId, activeChannelName } = useDesktopVidsStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeVideoId ? (
          <CommentSheet
            postId={activeVideoId}
            visible={true}
            isEmbedded={true}
            hideInput={true}
            onClose={() => {}}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textSecondary }}>Scroll to view comments</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    width: 350 * scale,
    borderLeftWidth: 1,
    borderLeftColor: colors.surfaceVariant,
    backgroundColor: '#000000', // Deep black theme
    height: '100%',
    flexDirection: 'column' as const,
  },
  content: {
    flex: 1,
    position: 'relative' as const,
    paddingTop: 16 * scale, // Add some top padding since header is removed
  }
});
