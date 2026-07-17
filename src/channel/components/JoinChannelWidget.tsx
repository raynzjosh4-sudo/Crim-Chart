import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserAvatar from '@/components/avatar/UserAvatar';
import { useStyles } from '@/core/hooks/useStyles';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useNotificationWrapper } from '@/core/notifications/useNotificationWrapper';
import { useChannelMember } from '@/channel/hooks/useChannelMember';
import { JoinButton } from './JoinButton';

interface JoinChannelWidgetProps {
  channelId: string;
  channelName: string;
  avatarUrl: string;
  ownerId?: string;
  onJoined?: () => void;
}

export const JoinChannelWidget: React.FC<JoinChannelWidgetProps> = ({
  channelId,
  channelName,
  avatarUrl,
  ownerId,
  onJoined,
}) => {
  const { user } = useAuthStore();
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surfaceVariant,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 16,
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
      marginLeft: 12,
    },
    titleText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 2,
    },
    subtitleText: {
      color: colors.text,
      opacity: 0.6,
      fontSize: 12,
      fontWeight: '500',
    },
  }));

  const { joinChannel } = useChannelMember(channelId);
  const { sendNotification } = useNotificationWrapper();
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = async () => {
    if (loading || hasJoined) return;
    setLoading(true);
    try {
      await joinChannel();
      setHasJoined(true);
      if (onJoined) {
        onJoined();
      }

      if (ownerId && ownerId !== user?.id) {
        // We will try 'mention' as type
        await sendNotification({
          type: 'mention', // 'mention' is generally safe
          recipientId: ownerId,
          actionText: `${user?.displayName || 'Someone'} joined your channel: ${channelName}`,
        });
      }
    } catch (error) {
      console.error("Error joining channel", error);
    } finally {
      setLoading(false);
    }
  };

  if (hasJoined) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <UserAvatar
          userId={channelId}
          fallbackUrl={avatarUrl}
          name={channelName}
          size={40}
        />
        <View style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={1}>{channelName}</Text>
          <Text style={styles.subtitleText}>Join to view and post</Text>
        </View>
      </View>
      <JoinButton
        title={loading ? "Joining..." : "Join"}
        onPress={handleJoin}
        disabled={loading}
      />
    </View>
  );
};
