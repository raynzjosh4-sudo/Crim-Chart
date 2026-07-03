import { UserStatusViewer } from '@/components/status/UserStatusViewer';
import { NativeDB } from '@/core/db/NativeDB';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import AppAvatar from './AppAvatar';
import { AvatarActionBottomSheet } from './AvatarActionBottomSheet';

interface UserAvatarProps {
  userId: string;
  fallbackUrl?: string | null;
  name?: string;
  size?: number;
  onTap?: () => void;
  onLongPress?: () => void;
  // Let the caller override online status if needed (e.g. for active chats)
  forceOnline?: boolean;
  forceHasStatus?: boolean;
  forceStatusCount?: number;
}

export default function UserAvatar({
  userId,
  fallbackUrl,
  name,
  size = 40,
  onTap,
  onLongPress,
  forceOnline,
  forceHasStatus,
  forceStatusCount,
}: UserAvatarProps) {
  const router = useRouter();
  const profile = useProfileCacheStore(state => state.profiles[userId]);
  const requestSync = useProfileCacheStore(state => state.requestSync);
  const updateProfile = useProfileCacheStore(state => state.updateProfile);

  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [statusViewerVisible, setStatusViewerVisible] = useState(false);
  const avatarRef = useRef<any>(null);
  const [anchorPos, setAnchorPos] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  // 1. Initial Local Load (Fast)
  React.useEffect(() => {
    if (!profile && !initialLoadDone) {
      const loadLocal = async () => {
        try {
          const localUser: any = await NativeDB.getUser(userId);
          if (localUser) {
            updateProfile(userId, {
              isOnline: !!localUser.is_online,
              lastSeen: localUser.last_seen,
              hasStatus: !!localUser.has_status,
              statusCount: localUser.status_count || 0,
            });
          }
        } catch (e) {
          console.log("Failed to load local user presence:", e);
        } finally {
          setInitialLoadDone(true);
        }
      };
      loadLocal();
    }
  }, [userId, profile, initialLoadDone, updateProfile]);

  // 2. Request Sync (Triggers worker)
  React.useEffect(() => {
    requestSync(userId);
  }, [userId, requestSync]);

  const isOnline = profile?.isOnline !== undefined ? profile.isOnline : forceOnline;
  
  // A user is deemed to have statuses if statusCount > 0
  const hasStatus = profile?.statusCount !== undefined ? profile.statusCount > 0 : forceHasStatus;
  const statusSegmentCount = profile?.statusCount !== undefined ? profile.statusCount : forceStatusCount;

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
    }
  };

  return (
    <View ref={avatarRef}>
      <AppAvatar
        imageUrl={fallbackUrl}
        size={size}
        isOnline={isOnline}
        hasStatus={hasStatus}
        isStatusRead={profile?.isStatusRead ?? false}
        statusSegmentCount={statusSegmentCount}
        onTap={handleTap}
        onLongPress={onLongPress}
      />

      <AvatarActionBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        avatarUrl={fallbackUrl}
        name={name || '-'}
        anchorPosition={anchorPos}
        onViewStatuses={() => {
          setStatusViewerVisible(true);
        }}
        onViewProfilePage={() => {
          router.push(`/profile/${userId}`);
        }}
      />

      <UserStatusViewer
        userId={userId}
        userName={name || '-'}
        userAvatarUrl={fallbackUrl || 'https://via.placeholder.com/60'}
        visible={statusViewerVisible}
        onClose={() => setStatusViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
