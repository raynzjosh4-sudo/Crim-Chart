import UserAvatar from '@/components/avatar/UserAvatar';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { MoreHorizontal } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

export interface PostHeaderProps {
  author: CrimChartUserModel;
  isPersonalPost: boolean;
  onAvatarTap: () => void;
  onMoreTap?: () => void;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ author, isPersonalPost, onAvatarTap, onMoreTap }) => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  return (
    <View style={[styles.header, isPersonalPost && { flexDirection: 'row-reverse' }]}>
      <View style={[styles.avatarContainer, isPersonalPost ? { marginRight: 0, marginLeft: 12 } : { marginRight: 12 }]}>
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
      <Text style={[styles.displayName, isPersonalPost && { textAlign: 'right' }]} numberOfLines={1}>
        {author.displayName || 'Unknown User'}
      </Text>
      <TouchableOpacity activeOpacity={1} style={styles.moreButton} onPress={onMoreTap}>
        <MoreHorizontal color={theme.colors.textSecondary} size={24} />
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
  displayName: {
    flex: 1,
    color: colors.text,
    fontSize: 15 * scale,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
  },
  moreButton: {
    padding: 4 * scale,
  },
});
