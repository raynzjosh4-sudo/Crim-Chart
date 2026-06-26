import UserAvatar from '@/components/avatar/UserAvatar';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { MoreHorizontal } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

export interface PostHeaderProps {
  author: CrimChartUserModel;
  isPersonalPost?: boolean;
  timeAgo?: string;
  onAvatarTap: () => void;
  onMoreTap?: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ author, isPersonalPost, timeAgo, onAvatarTap, onMoreTap }) => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  return (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        <UserAvatar
          userId={author.id}
          fallbackUrl={author.profileImageUrl}
          name={author.displayName}
          size={44}
          forceOnline={author.isActive}
          forceHasStatus={author.hasStatus}
          forceStatusCount={author.statusCount}
          onTap={onAvatarTap}
        />
      </View>
      
      <View style={styles.textContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName} numberOfLines={1}>
            {author.displayName || 'Unknown User'}
          </Text>
          {author.username ? (
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
      </View>

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
  moreButton: {
    padding: 4 * scale,
    marginLeft: 8 * scale,
  },
});
