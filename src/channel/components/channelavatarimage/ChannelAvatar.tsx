import { useChannelData } from '@/channel/hooks/useChannelData';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { ChannelAvatarActionBottomSheet } from './ChannelAvatarActionBottomSheet';
import { ChannelAvatarImage } from './ChannelAvatarImage';
import { UserStatusViewer } from '@/components/status/UserStatusViewer';

interface ChannelAvatarProps {
  channelId: string;
  fallbackUrl?: string | null;
  name?: string;
  size?: number;
  onTap?: () => void;
  // Let the caller override statuses if needed
  forceHasStatus?: boolean;
  forceStatusCount?: number;
  forceHasActiveMembers?: boolean;
}

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  channelId,
  fallbackUrl,
  name,
  size = 40,
  onTap,
  forceHasStatus,
  forceStatusCount,
  forceHasActiveMembers,
}) => {
  const router = useRouter();
  const { channel } = useChannelData(channelId);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [statusViewerVisible, setStatusViewerVisible] = useState(false);
  const avatarRef = useRef<any>(null);
  const [anchorPos, setAnchorPos] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  // Use real-time channel data or fallback to forced props
  const actualName = channel?.title || name;
  const actualImageUrl = channel?.imageUrl || fallbackUrl;
  const hasStatus = forceHasStatus !== undefined ? forceHasStatus : (channel?.momentsCount && channel.momentsCount > 0);
  const statusCount = forceStatusCount !== undefined ? forceStatusCount : (channel?.momentsCount || 0);
  const hasActiveMembers = forceHasActiveMembers !== undefined ? forceHasActiveMembers : (channel?.hasActiveMembers || false);

  const handleTap = () => {
    if (hasStatus) {
      if (Platform.OS === 'web' && avatarRef.current) {
        avatarRef.current.measure((x, y, w, h, pageX, pageY) => {
          setAnchorPos({ x: pageX, y: pageY, width: w, height: h });
          setSheetVisible(true);
        });
      } else {
        setSheetVisible(true);
      }
    } else if (onTap) {
      onTap();
    } else {
      // Default behavior if tapped and no moments
      router.push({ pathname: '/channel/channelpage', params: { id: channelId } } as any);
    }
  };

  const handleViewMoments = () => {
    setStatusViewerVisible(true);
  };

  const handleViewChannel = () => {
    router.push({ pathname: '/channel/channelpage', params: { id: channelId } } as any);
  };

  return (
    <View ref={avatarRef}>
      <ChannelAvatarImage
        imageUrl={actualImageUrl}
        name={actualName}
        size={size}
        hasStatus={!!hasStatus}
        showStatusRing={!!hasStatus}
        statusCount={statusCount}
        showActiveDot={hasActiveMembers}
        onImageTap={handleTap}
      />

      <ChannelAvatarActionBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onViewMoments={handleViewMoments}
        onViewChannel={handleViewChannel}
        avatarUrl={actualImageUrl}
        name={actualName}
        anchorPosition={anchorPos}
      />

      {statusViewerVisible && (
        <UserStatusViewer
          visible={statusViewerVisible}
          onClose={() => setStatusViewerVisible(false)}
          type="channel"
          channelId={channelId}
          userName={actualName || 'Channel'}
          userAvatarUrl={actualImageUrl || 'https://via.placeholder.com/60'}
        />
      )}
    </View>
  );
};
