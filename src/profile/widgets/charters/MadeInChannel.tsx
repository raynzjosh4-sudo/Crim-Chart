import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChannelModel } from '@/channel/models/ChannelModel';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

interface MadeInChannelProps {
  channel: ChannelModel;
  isSubChannel?: boolean;
  index?: number;
}

const getAvatarColor = (initial: string) => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
    '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#CDDC39', '#6E7BFF', '#FF5722',
  ];
  return colors[initial.charCodeAt(0) % colors.length] || colors[0];
};

export const MadeInChannel: React.FC<MadeInChannelProps> = ({ channel, isSubChannel, index }) => {
  const navigation = useNavigation() as any;
  const { t } = useTranslation();

  const onlineCount = Math.floor(channel.membersCount / 5);
  const onlineText = `${onlineCount} ${t('online', 'online')}`;
  const memberText = `${channel.membersCount} ${t('members', 'members')}`;
  const isUnread = channel.unreadCount > 0;

  const imageUrl = channel.imageUrl;
  const initial = channel.title ? channel.title[0].toUpperCase() : '?';

  return (
    <TouchableOpacity activeOpacity={1}
      style={styles.container}
      onPress={() => navigation.navigate('ChannelPage', { channelId: channel.id })}
    >
      <View style={styles.avatarContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(initial) }]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { fontWeight: isUnread ? '900' : '600' }]} numberOfLines={1}>
            {channel.title}
          </Text>
          <View style={styles.statusRow}>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{channel.unreadCount}+ new</Text>
              </View>
            )}
            <Text style={[styles.onlineText, { 
              color: isUnread ? '#FFD700' : 'rgba(255,255,255,0.5)',
              fontWeight: isUnread ? '700' : '400'
            }]}>
              {onlineText}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { fontWeight: isUnread ? '700' : '500' }]} numberOfLines={1}>
          {channel.description || 'No description provided'}
        </Text>

        <Text style={styles.memberText}>
          {memberText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 12,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
  },
  memberText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
    marginTop: 4,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.2)', // Primary color opacity
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  unreadText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '900',
  },
});
