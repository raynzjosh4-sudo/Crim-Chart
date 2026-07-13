import React from 'react';
import { View, StyleSheet, Platform, Dimensions, ScrollView } from 'react-native';
import { SmartPostWidget } from '@/mainFeed/pages/main_page_widgets/SmartPostWidget';
import { VideoPostFeedCard } from '@/mainFeed/pages/main_page_widgets/VideoPostFeedCard';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';

interface StandalonePostViewProps {
  postId: string;
  entityType?: string;
}

export const StandalonePostView: React.FC<StandalonePostViewProps> = ({ postId, entityType = 'post' }) => {
  const styles = useStyles(themeStyles);

  const renderContent = () => {
    switch (entityType) {
      case 'long_video_post':
        return <VideoPostFeedCard postId={postId} isActive={true} entityType="long_video_post" />;
      case 'short_video_post':
        return <VideoPostFeedCard postId={postId} isActive={true} entityType="short_video_post" />;
      case 'audio_post':
      case 'image_post':
      case 'standard_post':
      case 'channel_post':
      case 'channel_music':
      case 'channel_video':
      case 'post':
      default:
        // Use SmartPostWidget for standard posts
        const isChannel = entityType?.startsWith('channel_');
        return <SmartPostWidget postId={postId} entityType={entityType} sourceType={isChannel ? 'channel_post' : 'post'} isActive={true} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View key={postId} style={styles.contentWrapper}>
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingVertical: 16 * scale,
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
      // On desktop, constrain the max width to look like a clean post viewer modal
      maxWidth: Platform.OS === 'web' && Dimensions.get('window').width >= 768 ? 600 : '100%',
      alignSelf: 'center',
    },
  });
};
