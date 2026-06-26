import { ChannelModel } from '@/channel/models/ChannelModel';
import { ChannelAvatar } from '@/channel/components/channelavatarimage/ChannelAvatar';
import { ChannelEngagementWrapper } from '@/components/wrappers/ChannelEngagementWrapper';
import { useTheme } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors as themeColors } from '@/core/theme/colors';

interface Props { channel: ChannelModel; onPress?: () => void; onAvatarTap?: (channel: ChannelModel) => void; showFollowButton?: boolean; }

export default function ChannelListTile({ channel, onPress, onAvatarTap, showFollowButton = true }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {/* Metro rebuild trigger */}
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
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{channel.title}</Text>
            {channel.unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: themeColors.error }]}>
                <Text style={styles.badgeText}>{channel.unreadCount > 99 ? '99+' : channel.unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.subtitleRow}>
            <Text style={[styles.meta, { color: colors.text + '80' }]} numberOfLines={1}>
              {channel.description || `${channel.membersCount} members`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {showFollowButton && (
        <View style={styles.actionContainer}>
          <ChannelEngagementWrapper
            channelId={channel.id}
            joinMethod={channel.joinMethod}
            creatorId={channel.creatorId || ''}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  contentTouchable: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  info: { flex: 1, marginLeft: 13, justifyContent: 'center' },
  actionContainer: { marginLeft: 12, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '900', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8, justifyContent: 'center', alignItems: 'center', minWidth: 24 },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meta: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
});
