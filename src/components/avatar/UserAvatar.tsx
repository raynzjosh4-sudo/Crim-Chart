import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Alert } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { NativeDB } from '@/core/db/NativeDB';
import { AvatarActionBottomSheet } from './AvatarActionBottomSheet';
import { UserStatusViewer } from '@/components/status/UserStatusViewer';
import AppAvatar from './AppAvatar';

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
  const profile = useProfileCacheStore(state => state.profiles[userId]);
  const requestSync = useProfileCacheStore(state => state.requestSync);
  const updateProfile = useProfileCacheStore(state => state.updateProfile);

  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [statusViewerVisible, setStatusViewerVisible] = useState(false);

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

  const isOnline = forceOnline !== undefined ? forceOnline : profile?.isOnline;
  
  // A user is deemed to have statuses if statusCount > 0
  const hasStatus = forceHasStatus !== undefined ? forceHasStatus : (profile?.statusCount ?? 0) > 0;
  const statusSegmentCount = forceStatusCount !== undefined ? forceStatusCount : (profile?.statusCount || 0);

  const handleTap = () => {
    if (hasStatus) {
      setSheetVisible(true);
    } else if (onTap) {
      onTap();
    }
  };

  return (
    <View>
      <AppAvatar
        imageUrl={fallbackUrl}
        size={size}
        isOnline={isOnline}
        hasStatus={hasStatus}
        statusSegmentCount={statusSegmentCount}
        onTap={handleTap}
        onLongPress={onLongPress}
      />

      <AvatarActionBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        avatarUrl={fallbackUrl}
        name={name || '-'}
        onViewStatuses={() => {
          setStatusViewerVisible(true);
        }}
        onViewProfileImage={() => {
          Alert.alert("Profile Image", "Profile image viewer coming soon!");
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
