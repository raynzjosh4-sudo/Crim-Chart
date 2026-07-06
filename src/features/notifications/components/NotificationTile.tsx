import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { AppNotification } from '../data/NotificationRepository';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import UserAvatar from '@/components/avatar/UserAvatar';

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

  const getActionText = () => {
    if (notification.action_text) {
      return notification.action_text;
    }

    switch (notification.type) {
      case 'like': return `liked your post.`;
      case 'comment': return `commented on your post.`;
      case 'follow': return `started following you.`;
      case 'channel_invite': return `invited you to a channel.`;
      case 'channel_request': return `requested to join your channel.`;
      case 'mention': return `mentioned you in a comment.`;
      case 'post_tag': return `tagged you in a post.`;
      default: return `interacted with you.`;
    }
  };

  const text = getActionText();

  // Simple relative time formatter (e.g. "2h", "1d", "3w")
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
      activeOpacity={0.8}
      onPress={() => onPress(notification)}
      style={[
        styles.container,
        isUnread && { backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(128, 128, 128, 0.1)' }
      ]}
    >
      <View style={styles.avatarColumn}>
        {actor ? (
          <UserAvatar
            userId={actor.id}
            name={actor.display_name}
            fallbackUrl={actor.profile_image_url}
            size={44}
          />
        ) : (
          <View style={[styles.fallbackAvatar, { backgroundColor: colors.surfaceVariant }]} />
        )}
      </View>
      
      <View style={styles.contentColumn}>
        <Text style={styles.messageText} numberOfLines={3}>
          <Text style={styles.actorName}>{actor?.display_name || 'Someone'}</Text>
          {' '}
          {text}
          {' '}
          <Text style={styles.timeText}>{getRelativeTime(notification.created_at)}</Text>
        </Text>
      </View>

      <View style={styles.rightColumn}>
        {/* We can add a Follow button or Post Thumbnail here in the future! */}
        {isUnread && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    flexDirection: 'row' as const,
    paddingVertical: 12 * scale,
    paddingHorizontal: 16 * scale,
    alignItems: 'center' as const,
  },
  avatarColumn: {
    marginRight: 12 * scale,
  },
  fallbackAvatar: {
    width: 44 * scale,
    height: 44 * scale,
    borderRadius: 22 * scale,
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  messageText: {
    color: colors.text,
    fontSize: 14 * scale,
    lineHeight: 18 * scale,
  },
  actorName: {
    fontWeight: 'bold' as const,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
  },
  rightColumn: {
    marginLeft: 12 * scale,
    justifyContent: 'center' as const,
    alignItems: 'flex-end' as const,
    minWidth: 12 * scale,
  },
  unreadDot: {
    width: 8 * scale,
    height: 8 * scale,
    borderRadius: 4 * scale,
    backgroundColor: colors.primary,
  }
});
