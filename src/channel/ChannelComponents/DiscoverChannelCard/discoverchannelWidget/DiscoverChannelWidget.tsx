import { useExploreChannels } from '@/channel/hooks/useExploreChannels';
import { SkeletonBox } from '@/components/skeletons/SkeletonBox';
import { ChannelEngagementWrapper } from '@/components/wrappers/ChannelEngagementWrapper';
import { useStyles } from "@/core/hooks/useStyles";
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
interface DiscoverChannelWidgetProps {
  userId?: string;
  channelCount?: number;
}
const ChannelCardSkeleton: React.FC<{ styles: any; key?: any }> = ({ styles }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <SkeletonBox width={90} height={90} borderRadius={45} style={{ marginBottom: 14 }} />
      <SkeletonBox width={150} height={16} style={{ marginBottom: 8 }} />
      <SkeletonBox width={120} height={12} />
    </View>
    <View style={{ width: '100%', alignItems: 'center', marginTop: 12 }}>
      <SkeletonBox width={'100%'} height={36} borderRadius={10} />
    </View>
  </View>
);
export const DiscoverChannelWidget: React.FC<DiscoverChannelWidgetProps> = ({
  userId,
  channelCount = 0
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    container: {
      marginVertical: 20
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 12
    },
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: -0.2
    },
    countBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12
    },
    countText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '900'
    },
    listPadding: {
      paddingHorizontal: 16
    },
    card: {
      width: 220,
      minHeight: 250,
      backgroundColor: colors.surface,
      // Scaffold bg color
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 20,
      alignItems: 'center',
      marginRight: 5,
      justifyContent: 'space-between'
    },
    closeButton: {
      position: 'absolute',
      top: 14,
      right: 12,
      zIndex: 10
    },
    cardContent: {
      alignItems: 'center',
      width: '100%'
    },
    channelIcon: {
      width: 90,
      height: 90,
      borderRadius: 45,
      marginBottom: 14,
      backgroundColor: colors.surfaceVariant
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    channelName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: -0.2,
      textAlign: 'center',
      maxWidth: 150
    },
    suggestedText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
      fontWeight: '400',
      textAlign: 'center'
    },
    joinButton: {
      width: '100%',
      backgroundColor: colors.surfaceVariant,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center'
    },
    joinButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '800'
    }
  }));
  const {
    channels,
    isLoading: loading,
    loadMore
  } = useExploreChannels(userId);
  const router = useRouter();
  useEffect(() => {
    if (userId) {
      loadMore(true);
    }
  }, [userId]);
  if (loading && channels.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Channels</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ChannelCardSkeleton key={i} styles={styles} />
          ))}
        </ScrollView>
      </View>
    );
  }
  if (channels.length === 0) {
    return null;
  }
  return <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Channels</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{channelCount > 0 ? channelCount : channels.length}</Text>
      </View>
    </View>

    <FlatList data={channels} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listPadding} keyExtractor={item => item.id} renderItem={({
      item
    }) => <View style={styles.card}>
        <TouchableOpacity activeOpacity={1} style={styles.closeButton}>
          <X size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={1} style={styles.cardContent} onPress={() => router.push(`/channel/${item.id}` as any)}>
          <Image source={{
            uri: item.imageUrl
          }} style={styles.channelIcon} />
          <View style={styles.nameRow}>
            <Text style={styles.channelName} numberOfLines={1}>{item.title}</Text>
          </View>
          <Text style={styles.suggestedText} numberOfLines={1}>
            {item.description || 'No description available'}
          </Text>
        </TouchableOpacity>

        <View style={{
          width: '100%',
          alignItems: 'center',
          marginTop: 12
        }}>
          <ChannelEngagementWrapper channelId={item.id} joinMethod={item.joinMethod || 'public'} creatorId={item.creatorId || ''} />
        </View>
      </View>} />
  </View>;
};