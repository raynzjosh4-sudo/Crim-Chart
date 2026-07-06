import { useStyles } from "@/core/hooks/useStyles";
import { ChannelModel } from '@/channel/models/ChannelModel';
import { ChannelAvatar } from '@/channel/components/channelavatarimage/ChannelAvatar';
import { ChannelEngagementWrapper } from '@/components/wrappers/ChannelEngagementWrapper';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  channel: ChannelModel;
  onPress?: () => void;
  onAvatarTap?: (channel: ChannelModel) => void;
  showFollowButton?: boolean;
}

export default function ChannelListTile({
  channel,
  onPress,
  onAvatarTap,
  showFollowButton = true
}: Props) {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    contentTouchable: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flex: 1,
    },
    info: {
      flex: 1,
      marginLeft: 13,
      justifyContent: 'center' as const,
    },
    actionContainer: {
      marginLeft: 12,
      justifyContent: 'center' as const,
    },
    titleRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    title: {
      fontSize: 16,
      fontWeight: '900' as const,
      flex: 1,
      color: colors.text,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      minWidth: 24,
      backgroundColor: colors.error,
    },
    badgeText: {
      color: colors.onPrimary,
      fontSize: 13,
      fontWeight: 'bold' as const,
    },
    subtitleRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginTop: 4,
    },
    meta: {
      fontSize: 14,
      fontWeight: '600' as const,
      flex: 1,
      marginRight: 8,
      color: colors.textSecondary,
    },
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.contentTouchable} onPress={onPress} activeOpacity={0.7}>
        <ChannelAvatar
          channelId={channel.id}
          fallbackUrl={channel.imageUrl}
          name={channel.title}
          size={58}
          forceHasStatus={channel.momentsCount > 0}
          forceStatusCount={channel.momentsCount > 0 ? channel.momentsCount : 0}
          forceHasActiveMembers={channel.hasActiveMembers}
          onTap={onAvatarTap ? () => onAvatarTap(channel) : undefined}
        />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{channel.title}</Text>
            {channel.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{channel.unreadCount > 99 ? '99+' : channel.unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.subtitleRow}>
            <Text style={styles.meta} numberOfLines={1}>
              {channel.description || `${channel.membersCount} members`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {showFollowButton && (
        <View style={styles.actionContainer}>
          <ChannelEngagementWrapper channelId={channel.id} joinMethod={channel.joinMethod} creatorId={channel.creatorId || ''} />
        </View>
      )}
    </View>
  );
}