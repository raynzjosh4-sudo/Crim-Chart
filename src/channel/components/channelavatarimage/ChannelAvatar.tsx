import { useChannelData } from '@/channel/hooks/useChannelData';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { UserStatusViewer } from '@/components/status/UserStatusViewer';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { useChannelMomentsStore } from '@/channel/store/useChannelMomentsStore';
import { useViewedStatusStore } from '@/core/store/useViewedStatusStore';
import { ChannelAvatarActionBottomSheet } from './ChannelAvatarActionBottomSheet';
import { ChannelAvatarImage } from './ChannelAvatarImage';

interface ChannelAvatarProps {
  channelId: string;
  fallbackUrl?: string | null;
  name?: string;
  size?: number;
  onTap?: () => void;
  onLongPress?: () => void;
  forceHasStatus?: boolean;
  forceStatusCount?: number;
  forceHasActiveMembers?: boolean;
  isStatusRead?: boolean;
}

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  channelId,
  fallbackUrl,
  name,
  size = 40,
  onTap,
  onLongPress,
  forceHasStatus,
  forceStatusCount,
  forceHasActiveMembers,
  isStatusRead,
}) => {
  const router = useRouter();
  const { startLoading } = useGlobalProgress();
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

  const { momentGroups } = useChannelMomentsStore();
  const viewedStatusIds = useViewedStatusStore(s => s.viewedStatusIds);
  const group = momentGroups.find(g => g.channel_id === channelId);
  const internalIsStatusRead = group && group.moments.length > 0 
    ? group.moments.every(m => viewedStatusIds[m.id])
    : false;

  const finalIsStatusRead = isStatusRead !== undefined ? isStatusRead : internalIsStatusRead;

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
      startLoading();
      setTimeout(() => {
        router.push({ pathname: '/channel/channelpage', params: { id: channelId } } as any);
      }, 100);
    }
  };

  const handleViewMoments = () => {
    setStatusViewerVisible(true);
  };

  const handleViewChannel = () => {
    startLoading();
    setTimeout(() => {
      router.push({ pathname: '/channel/channelpage', params: { id: channelId } } as any);
    }, 100);
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
        onLongPress={onLongPress}
        isStatusRead={finalIsStatusRead}
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
          userAvatarUrl={actualImageUrl || ''}
        />
      )}
    </View>
  );
};
