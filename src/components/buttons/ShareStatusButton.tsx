import { useStyles } from "@/core/hooks/useStyles";
import { MediaSource, MediaType, PostType, usePostingStore } from '@/core/store/usePostingStore';
import { colors } from '@/core/theme/colors';
import { Check, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Toast from 'react-native-toast-message';
interface ShareStatusButtonProps {
  mediaUrl: string;
  mediaType?: 'image' | 'video' | 'audio' | string;
  caption?: string;
  targetType: 'status' | 'moment';
  channelId?: string; // Required if targetType is 'moment'
  style?: ViewStyle;
}
export const ShareStatusButton: React.FC<ShareStatusButtonProps> = ({
  mediaUrl,
  mediaType = 'image',
  caption = '',
  targetType,
  channelId,
  style
}) => {
  const styles = useStyles(colors => ({
    container: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    text: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '800'
    }
  }));
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const handleShare = async () => {
    if (isSharing || hasShared) return;
    console.log(`[ShareStatusButton] Tapped share button. targetType: ${targetType}, mediaUrl: ${mediaUrl}`);
    setIsSharing(true);
    let mappedMediaType = MediaType.photo;
    if (mediaType === 'video') mappedMediaType = MediaType.video;
    if (mediaType === 'audio') mappedMediaType = MediaType.audio;
    console.log(`[ShareStatusButton] Calling createPost with mappedMediaType: ${mappedMediaType}`);
    const success = await usePostingStore.getState().createPost({
      caption,
      media: [{
        path: mediaUrl,
        type: mappedMediaType,
        source: MediaSource.gallery
      }],
      postType: targetType === 'moment' ? PostType.moment : PostType.status,
      shareToStatus: targetType === 'status',
      shareToMoment: targetType === 'moment',
      channelId: channelId,
      allowComments: true,
      isPublicFeed: true
    });
    setIsSharing(false);
    if (success) {
      setHasShared(true);
      console.log(`[ShareStatusButton] Shared successfully.`);
      // Reset after a few seconds
      setTimeout(() => setHasShared(false), 3000);
    } else {
      const errorMsg = usePostingStore.getState().errorMessage;
      console.error(`[ShareStatusButton] createPost failed! Error message:`, errorMsg);
      Toast.show({
        type: 'error',
        text1: 'Failed to share'
      });
    }
  };
  const actionText = targetType === 'moment' ? 'Share to Moment' : 'Share to Status';
  return <TouchableOpacity activeOpacity={0.8} onPress={handleShare} disabled={isSharing || hasShared} style={[styles.container, style]}>
      {isSharing ? <ActivityIndicator size="small" color={colors.primary} style={{
      width: 14,
      height: 14
    }} /> : hasShared ? <Check size={14} color="#4CAF50" /> : <Sparkles size={14} color={colors.primary} />}
      <Text style={styles.text}>
        {hasShared ? 'Shared!' : actionText}
      </Text>
    </TouchableOpacity>;
};