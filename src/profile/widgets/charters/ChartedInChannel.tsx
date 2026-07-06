import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChannelModel } from '@/channel/models/ChannelModel';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'; // Assuming translation is used

interface ChartedInChannelProps {
  channel: ChannelModel;
  isSubChannel?: boolean;
  index?: number;
}
export const ChartedInChannel: React.FC<ChartedInChannelProps> = ({
  channel,
  isSubChannel,
  index
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center'
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 16
    },
    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29
    },
    placeholderAvatar: {
      backgroundColor: '#333'
    },
    activeDot: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#4CAF50',
      borderWidth: 2,
      borderColor: colors.background
    },
    content: {
      flex: 1
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: '900',
      color: colors.text,
      marginRight: 8
    },
    onlineText: {
      fontSize: 12,
      fontWeight: '900',
      color: '#FFD700' // Primary color
    },
    subRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4
    },
    memberText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.5)',
      fontWeight: '600'
    },
    unreadBadge: {
      padding: 6,
      backgroundColor: '#FFD700',
      // Primary color
      borderRadius: 20,
      minWidth: 20,
      minHeight: 20,
      justifyContent: 'center',
      alignItems: 'center'
    },
    unreadText: {
      color: colors.background,
      fontSize: 10,
      fontWeight: 'bold'
    }
  }));
  const navigation = useNavigation() as any;
  const {
    t
  } = useTranslation();
  const onlineCount = Math.floor(channel.membersCount / 5);
  const onlineText = `${onlineCount} ${t('online', 'online')}`;
  const memberText = `${channel.membersCount} ${t('members', 'members')}`;
  const isUnread = channel.unreadCount > 0;
  const imageUrl = channel.imageUrl || channel.creatorUser?.profileImageUrl || '';
  return <TouchableOpacity activeOpacity={1} style={styles.container} onPress={() => navigation.navigate('ChannelPage', {
    channelId: channel.id
  })}>
      <View style={styles.avatarContainer}>
        {imageUrl ? <Image source={{
        uri: imageUrl
      }} style={styles.avatar} /> : <View style={[styles.avatar, styles.placeholderAvatar]} />}
        <View style={styles.activeDot} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {channel.title}
          </Text>
          <Text style={styles.onlineText}>
            {onlineText}
          </Text>
        </View>

        <View style={styles.subRow}>
          <Text style={styles.memberText}>
            {memberText}
          </Text>
          <View style={{
          flex: 1
        }} />
          {isUnread && <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{channel.unreadCount}</Text>
            </View>}
        </View>
      </View>
    </TouchableOpacity>;
};