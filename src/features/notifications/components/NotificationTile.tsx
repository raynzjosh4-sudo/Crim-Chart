import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { AppNotification } from '../data/NotificationRepository';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import UserAvatar from '@/components/avatar/UserAvatar';
import { Heart, MessageCircle, UserPlus, Mail, AtSign, Hash } from 'lucide-react-native';

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

  const getIconAndText = () => {
    switch (notification.type) {
      case 'like':
        return {
          icon: <Heart size={20} color="#F91880" fill="#F91880" />,
          text: `liked your post.`
        };
      case 'comment':
        return {
          icon: <MessageCircle size={20} color="#1D9BF0" fill="#1D9BF0" />,
          text: `commented on your post.`
        };
      case 'follow':
        return {
          icon: <UserPlus size={20} color="#00BA7C" />,
          text: `followed you.`
        };
      case 'channel_invite':
        return {
          icon: <Mail size={20} color={colors.primary} />,
          text: `invited you to a channel.`
        };
      case 'channel_request':
        return {
          icon: <Mail size={20} color={colors.primary} />,
          text: `requested to join your channel.`
        };
      case 'mention':
        return {
          icon: <AtSign size={20} color={colors.primary} />,
          text: `mentioned you.`
        };
      case 'post_tag':
        return {
          icon: <Hash size={20} color={colors.primary} />,
          text: `tagged you in a post.`
        };
      default:
        return {
          icon: <Heart size={20} color={colors.textSecondary} />,
          text: `interacted with you.`
        };
    }
  };

  const { icon, text } = getIconAndText();

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
    if (diffInDays < 365) return `${diffInDays}d`;
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
      <View style={styles.iconColumn}>
        {icon}
      </View>
      <View style={styles.contentColumn}>
        {actor && (
          <UserAvatar
            userId={actor.id}
            name={actor.display_name}
            fallbackUrl={actor.profile_image_url}
            size={36}
          />
        )}
        <Text style={styles.messageText}>
          <Text style={styles.actorName}>{actor?.display_name || 'Someone'}</Text>
          {' '}
          {text}
        </Text>
        <Text style={styles.timeText}>{getRelativeTime(notification.created_at)}</Text>
      </View>
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    flexDirection: 'row' as const,
    paddingVertical: 16 * scale,
    paddingHorizontal: 20 * scale,
    borderBottomWidth: 0.5 * scale,
    borderBottomColor: colors.surfaceVariant,
    alignItems: 'flex-start' as const,
  },
  iconColumn: {
    width: 40 * scale,
    alignItems: 'center' as const,
    marginRight: 12 * scale,
  },
  contentColumn: {
    flex: 1,
  },
  messageText: {
    color: colors.text,
    fontSize: 15 * scale,
    lineHeight: 20 * scale,
    marginTop: 8 * scale,
  },
  actorName: {
    fontWeight: '700' as const,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    marginTop: 4 * scale,
  },
  unreadDot: {
    width: 8 * scale,
    height: 8 * scale,
    borderRadius: 4 * scale,
    backgroundColor: colors.primary,
    marginLeft: 12 * scale,
    alignSelf: 'center' as const,
  }
});
