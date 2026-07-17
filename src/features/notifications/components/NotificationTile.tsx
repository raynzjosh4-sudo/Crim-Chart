import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { AppNotification } from '../data/NotificationRepository';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import UserAvatar from '@/components/avatar/UserAvatar';
import { Heart, MessageCircle, UserPlus, Users, AtSign, Tag, Bell, Image as ImageIcon } from 'lucide-react-native';

interface NotificationTileProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

export const NotificationTile = ({ notification, onPress }: NotificationTileProps) => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const colors = theme.colors;

  const actor = notification.actor;
  const isUnread = !notification.is_read;

  const getActionDetails = () => {
    switch (notification.type) {
      case 'like':
        return { text: `liked your post`, icon: <Heart size={12} color="#FFF" fill="#FFF" />, bgColor: '#FF3B30' };
      case 'comment':
        return { text: `commented on your post`, icon: <MessageCircle size={12} color="#FFF" fill="#FFF" />, bgColor: '#0A7AFF' };
      case 'follow':
        return { text: `started following you`, icon: <UserPlus size={12} color="#FFF" />, bgColor: '#34C759' };
      case 'channel_invite':
        return { text: `invited you to a channel`, icon: <Users size={12} color="#FFF" />, bgColor: '#AF52DE' };
      case 'channel_request':
        return { text: `requested to join your channel`, icon: <Users size={12} color="#FFF" />, bgColor: '#FF9500' };
      case 'mention':
        return { text: `mentioned you in a comment`, icon: <AtSign size={12} color="#FFF" />, bgColor: '#FF2D55' };
      case 'post_tag':
        return { text: `tagged you in a post`, icon: <Tag size={12} color="#FFF" />, bgColor: '#5856D6' };
      case 'post':
        return { text: `published a new post`, icon: <ImageIcon size={12} color="#FFF" />, bgColor: '#FF2D55' };
      default:
        return { text: `interacted with you`, icon: <Bell size={12} color="#FFF" />, bgColor: colors.primary };
    }
  };

  const actionDetails = getActionDetails();
  const actionText = notification.action_text || actionDetails.text;

  // Simple relative time formatter
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 7)}w`;
    return `${Math.floor(diffInDays / 365)}y`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(notification)}
      style={[
        styles.container,
        isUnread && styles.unreadContainer
      ]}
    >
      {/* Unread Indicator Bar */}
      {isUnread && <View style={styles.unreadIndicatorBar} />}

      <View style={styles.avatarColumn}>
        {actor ? (
          <UserAvatar
            userId={actor.id}
            name={actor.display_name}
            fallbackUrl={actor.profile_image_url}
            size={48}
          />
        ) : (
          <View style={[styles.fallbackAvatar, { backgroundColor: colors.surfaceVariant }]} />
        )}
        
        {/* Action Icon Badge */}
        <View style={[styles.iconBadge, { backgroundColor: actionDetails.bgColor, borderColor: isUnread ? colors.surfaceDark : colors.background }]}>
          {actionDetails.icon}
        </View>
      </View>
      
      <View style={styles.contentColumn}>
        <View style={styles.headerRow}>
          <Text style={styles.actorName} numberOfLines={1}>
            {actor?.display_name || 'Someone'}
          </Text>
          <Text style={styles.timeText}>{getRelativeTime(notification.created_at)}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {actionText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 14 * scale,
    paddingHorizontal: 16 * scale,
    alignItems: 'flex-start',
    backgroundColor: colors.background,
  },
  unreadContainer: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(150, 150, 150, 0.05)' : colors.surfaceDark,
  },
  unreadIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4 * scale,
    backgroundColor: colors.primary,
  },
  avatarColumn: {
    position: 'relative',
    marginRight: 14 * scale,
  },
  fallbackAvatar: {
    width: 48 * scale,
    height: 48 * scale,
    borderRadius: 24 * scale,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2 * scale,
    right: -2 * scale,
    width: 20 * scale,
    height: 20 * scale,
    borderRadius: 10 * scale,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2 * scale,
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 2 * scale, // Align text slightly better with avatar top
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4 * scale,
  },
  actorName: {
    color: colors.text,
    fontSize: 15 * scale,
    fontWeight: '700',
    flex: 1,
    marginRight: 8 * scale,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    fontWeight: '500',
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    lineHeight: 18 * scale,
  },
});
