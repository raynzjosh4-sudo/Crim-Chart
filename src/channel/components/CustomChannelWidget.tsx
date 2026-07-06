import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import UserAvatar from '@/components/avatar/UserAvatar';
import { Plus, Menu } from 'lucide-react-native';
import { ChannelRestrictionWrapper } from '@/components/wrappers/ChannelRestrictionWrapper';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';

interface CustomChannelWidgetProps {
  userId?: string;
  username: string;
  avatarUrl: string;
  isOnline?: boolean;
  onPlusPress?: () => void;
  onMorePress?: () => void;
  channelId?: string;
}

export const CustomChannelWidget: React.FC<CustomChannelWidgetProps> = ({
  userId,
  username,
  avatarUrl,
  isOnline = true,
  onPlusPress,
  onMorePress,
  channelId,
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    userInfo: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    avatarContainer: {
      position: 'relative' as const,
      marginRight: 12,
    },
    username: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800' as const,
    },
    actions: {
      flexDirection: 'row' as const,
      gap: 12,
    },
    actionCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <UserAvatar
            userId={userId || ''}
            fallbackUrl={avatarUrl}
            name={username}
            size={40}
            forceOnline={isOnline}
          />
        </View>
        <Text style={styles.username}>{username}</Text>
      </View>
      
      <View style={styles.actions}>
        {channelId ? (
          <ChannelRestrictionWrapper channelId={channelId} requiredAction="post_feed" fallback={null}>
            <TouchableOpacity activeOpacity={1} style={styles.actionCircle} onPress={onPlusPress}>
              <Plus size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </ChannelRestrictionWrapper>
        ) : (
          <TouchableOpacity activeOpacity={1} style={styles.actionCircle} onPress={onPlusPress}>
            <Plus size={20} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity activeOpacity={1} style={styles.actionCircle} onPress={onMorePress}>
          <Menu size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};



