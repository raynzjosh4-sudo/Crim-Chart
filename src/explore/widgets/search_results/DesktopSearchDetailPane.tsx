import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { useDesktopSearchStore } from '@/explore/application/useDesktopSearchStore';

// Importers for various views
import { ProfilePageWrapper } from '@/components/wrappers/ProfilePageWrapper';
import { DesktopChannelNavigator } from '@/channel/widgets/DesktopChannelNavigator';
// Assuming we'll render comments sheet or similar for posts
import { StandalonePostView } from '@/components/post/StandalonePostView';

export const DesktopSearchDetailPane = () => {
  const styles = useStyles(themeStyles);
  const activeResult = useDesktopSearchStore((s) => s.activeResult);

  if (!activeResult) {
    return null;
  }

  const renderContent = () => {
    switch (activeResult.entity_type) {
      case 'profile':
        return <ProfilePageWrapper targetUserId={activeResult.entity_id} />;
      case 'channel':
        return <DesktopChannelNavigator channelId={activeResult.entity_id} />;
      case 'music':
      case 'video':
      case 'post':
      case 'channel_post':
        // The user requested opening the result in the right pane.
        // For posts/media, we show the full StandalonePostView.
        return (
          <View style={styles.postContainer}>
            <StandalonePostView 
              postId={activeResult.entity_id} 
              entityType={activeResult.entity_type} 
            />
          </View>
        );
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Selected: {activeResult.title}
            </Text>
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const themeStyles = (colors: ThemeTokens) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderLeftColor: colors.surfaceVariant,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  placeholderText: {
    color: colors.text,
    fontSize: 16,
  },
  postContainer: {
    flex: 1,
    // Provide a background since CommentSheet might be a bottom sheet internally, 
    // but on desktop it renders inline if designed that way.
  },
});
