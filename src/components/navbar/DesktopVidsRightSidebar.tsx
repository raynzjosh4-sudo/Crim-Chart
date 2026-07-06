import { CommentSheet } from '@/components/comments/CommentSheet';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useDesktopVidsStore } from '@/mainFeed/pages/main_page_widgets/useDesktopVidsStore';
import { MessageCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const DesktopVidsRightSidebar = () => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { activeVideoId, activeChannelId, activeChannelName } = useDesktopVidsStore();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MessageCircle size={18} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Comments</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeVideoId ? (
          <CommentSheet
            postId={activeVideoId}
            visible={true}
            isEmbedded={true}
            hideInput={false}
            onClose={() => {}}
          />
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={40} color='rgba(255,255,255,0.15)' />
            <Text style={styles.emptyText}>Scroll to a video to see comments</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#000',
    height: '100%',
    flexDirection: 'column' as const,
    minWidth: 300 * scale,
    maxWidth: 380 * scale,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20 * scale,
    paddingTop: 20 * scale,
    paddingBottom: 12 * scale,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 8 * scale,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16 * scale,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    position: 'relative' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 12 * scale,
    padding: 32 * scale,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14 * scale,
    textAlign: 'center' as const,
    lineHeight: 20 * scale,
  },
});
