import UserAvatar from '@/components/avatar/UserAvatar';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { MoreHorizontal } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export interface PostHeaderProps {
  author: CrimChartUserModel;
  source_type?: string | null;
  timeAgo?: string;
  onAvatarTap: () => void;
  onMoreTap?: (event?: any) => void;
  channelId?: string | null;
  channelAvatarUrl?: string | null;
  channelName?: string | null;
  channelDescription?: string | null;
  onChannelAvatarTap?: () => void;
}

import { ChannelAvatar } from '@/channel/components/channelavatarimage/ChannelAvatar';

export const PostHeader: React.FC<PostHeaderProps> = ({ author, source_type, timeAgo, onAvatarTap, onMoreTap, channelId, channelAvatarUrl, channelName, channelDescription, onChannelAvatarTap }) => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  const isChannelPost = source_type === 'channel_post';

  return (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        {isChannelPost && channelId ? (
          <ChannelAvatar
            channelId={channelId}
            fallbackUrl={channelAvatarUrl}
            name={channelName || 'Channel'}
            size={48}
            onTap={() => {
              if (onChannelAvatarTap) onChannelAvatarTap();
            }}
            onLongPress={() => {
              console.log(source_type);
            }}
          />
        ) : (
          <UserAvatar
            userId={author.id}
            fallbackUrl={author.profileImageUrl}
            name={author.displayName}
            size={48}
            forceOnline={author.isActive}
            forceHasStatus={author.hasStatus}
            forceStatusCount={author.statusCount}
            disableSegments={true}
            onTap={() => {
              if (onAvatarTap) onAvatarTap();
            }}
            onLongPress={() => {
              console.log(source_type);
            }}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.textContainer}
        activeOpacity={1}
        onPress={() => {
          if (isChannelPost && onChannelAvatarTap) {
            onChannelAvatarTap();
          } else if (!isChannelPost && onAvatarTap) {
            onAvatarTap();
          }
        }}
        onLongPress={() => {
          console.log(source_type);
        }}
      >
        <View style={styles.nameRow}>
          <Text style={styles.displayName} numberOfLines={1}>
            {isChannelPost ? (channelName || 'Channel') : (author.displayName || 'Unknown User')}
          </Text>
          {!isChannelPost && author.username ? (
            <Text style={styles.handle} numberOfLines={1}>
              @{author.username}
            </Text>
          ) : null}
          {timeAgo ? (
            <Text style={styles.timeAgo} numberOfLines={1}>
              · {timeAgo}
            </Text>
          ) : null}
        </View>
        {isChannelPost && channelDescription ? (
          <Text style={styles.channelDescription} numberOfLines={1}>
            {channelDescription}
          </Text>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={1} style={styles.moreButton} onPress={onMoreTap}>
        <MoreHorizontal color={theme.colors.textSecondary} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,

    paddingHorizontal: 16 * scale,
    marginBottom: 8 * scale,
  },
  avatarContainer: {
    marginRight: 12 * scale,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  displayName: {
    color: colors.text,
    fontSize: 15 * scale,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
    marginRight: 4 * scale,
  },
  handle: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    marginRight: 4 * scale,
    flexShrink: 1,
  },
  timeAgo: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
  },
  channelDescription: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    marginTop: 2 * scale,
  },
  moreButton: {
    padding: 4 * scale,
    marginLeft: 8 * scale,
  },
  channelAvatarContainer: {
    marginLeft: 8 * scale,
  },
  channelAvatar: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    backgroundColor: colors.surfaceVariant,
  },
});
