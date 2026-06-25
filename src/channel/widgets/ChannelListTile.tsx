import { ChannelModel } from '@/channel/models/ChannelModel';
import { UserAvatarImage } from '@/channel/pages/widgets2/memberimage/UserAvatarImage';
import { ChannelEngagementWrapper } from '@/components/wrappers/ChannelEngagementWrapper';
import { useTheme } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props { channel: ChannelModel; onPress?: () => void; onAvatarTap?: (channel: ChannelModel) => void; showFollowButton?: boolean; }

export default function ChannelListTile({ channel, onPress, onAvatarTap, showFollowButton = true }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.contentTouchable} onPress={onPress} activeOpacity={0.7}>
        <UserAvatarImage
          imageUrl={channel.imageUrl}
          size={58}
          hasStatus={channel.momentsCount > 0}
          showStatusRing={channel.momentsCount > 0}
          ringColor={colors.primary}
          statusCount={channel.momentsCount > 0 ? channel.momentsCount : 0}
          showActiveDot={channel.hasActiveMembers}
          onImageTap={onAvatarTap ? () => onAvatarTap(channel) : undefined}
        />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{channel.title}</Text>
            {channel.unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
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
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 8, justifyContent: 'center', alignItems: 'center', minWidth: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meta: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
});
