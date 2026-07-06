import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ChevronLeft } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

import { ChannelAvatar } from '@/channel/components/channelavatarimage/ChannelAvatar';

interface ChannelTitleBarProps {
  title: string;
  channelId?: string;
  channelImageUrl?: string | null;
  onBackPress?: () => void;
}

export const ChannelTitleBar: React.FC<ChannelTitleBarProps> = ({
  title,
  channelId,
  channelImageUrl,
  onBackPress
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    leftSection: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flex: 1,
    },
    backButton: {
      padding: 4,
      marginRight: 8,
    },
    title: {
      flex: 1,
      color: colors.text,
      fontSize: 24,
      fontWeight: '900' as const,
      marginRight: 12,
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
      <View style={styles.leftSection}>
        {onBackPress && (
          <TouchableOpacity activeOpacity={1} style={styles.backButton} onPress={onBackPress}>
            <ChevronLeft size={28} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        {channelId && (
          <View style={{ marginRight: 12 }}>
            <ChannelAvatar channelId={channelId} fallbackUrl={channelImageUrl} name={title} size={36} />
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

    </View>
  );
};

export default function IgnoredRoute() { return null; }
