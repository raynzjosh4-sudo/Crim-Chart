import { useStyles } from "@/core/hooks/useStyles";
import { colors } from '@/core/theme/colors';
import { MemberImage } from '@/features/profile/components/MemberImage';
import { Star } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
interface Chat {
  id: string;
  senderName: string;
  senderAvatarUrl?: string;
  title: string;
  description: string;
  unreadCount: number;
  timestamp: string;
}
interface ChatListTileProps {
  chat: Chat;
  onTap: () => void;
  showTime?: boolean;
  compact?: boolean;
  showRightCount?: boolean;
  hideStar?: boolean;
}
export const ChatListTile: React.FC<ChatListTileProps> = ({
  chat,
  onTap,
  showTime = true,
  compact = false,
  showRightCount = false,
  hideStar = false
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)'
    },
    containerUnread: {
      backgroundColor: 'rgba(255, 179, 0, 0.05)'
    },
    avatarContainer: {
      marginRight: 16
    },
    avatarWrapper: {
      position: 'relative'
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28
    },
    avatarPlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center'
    },
    avatarInitial: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold'
    },
    content: {
      flex: 1
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 0
    },
    senderName: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: '500'
    },
    senderNameUnread: {
      fontWeight: '900'
    },
    timeContainer: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'center'
    },
    rightContainer: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'center',
      minWidth: 56,
      marginLeft: 8
    },
    timestamp: {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: 12
    },
    timestampUnread: {
      color: colors.primary,
      fontWeight: 'bold'
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary
    },
    activeDot: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
      right: -4,
      bottom: -4,
      borderWidth: 2,
      borderColor: colors.surface
    },
    unreadCountBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 6,
      paddingHorizontal: 6
    },
    unreadCountText: {
      color: colors.surface,
      fontSize: 12,
      fontWeight: '700'
    },
    compactFooter: {
      marginTop: 2
    },
    title: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 0
    },
    titleUnread: {
      fontWeight: '700'
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    snippet: {
      flex: 1,
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
      marginRight: 8
    }
  }));
  const isUnread = chat.unreadCount > 0;
  const initial = chat.senderName ? chat.senderName[0].toUpperCase() : '?';
  const avatarColors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#FFC107', '#FF9800'];
  const avatarColor = avatarColors[initial.charCodeAt(0) % avatarColors.length];
  return <TouchableOpacity activeOpacity={1} style={[styles.container, isUnread && styles.containerUnread]} onPress={onTap}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <MemberImage size={56} imageUrl={chat.senderAvatarUrl} showStatusRing={true} ringColor={isUnread ? colors.primary : undefined} />

          {isUnread ? <View style={styles.activeDot} /> : null}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.senderName, isUnread && styles.senderNameUnread]} numberOfLines={1}>
            {chat.senderName}
          </Text>

          <View style={styles.rightContainer}>
            {showTime ? <Text style={[styles.timestamp, isUnread && styles.timestampUnread]}>
                {chat.timestamp}
              </Text> : null}

            {showRightCount || showTime && isUnread ? <View style={styles.unreadCountBadge}>
                <Text style={styles.unreadCountText}>{chat.unreadCount > 99 ? '99+' : String(chat.unreadCount)}</Text>
              </View> : null}
          </View>
        </View>

        {!compact ? <>
            <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={1}>
              {chat.title}
            </Text>

            <View style={styles.footer}>
              <Text style={styles.snippet} numberOfLines={1}>
                {chat.description}
              </Text>
              {!hideStar && <Star size={18} color="rgba(255, 255, 255, 0.3)" />}
            </View>
          </> : <View style={styles.compactFooter}>
            <Text style={[styles.snippet, isUnread && styles.titleUnread]} numberOfLines={1}>
              {chat.description}
            </Text>
          </View>}
      </View>
    </TouchableOpacity>;
};