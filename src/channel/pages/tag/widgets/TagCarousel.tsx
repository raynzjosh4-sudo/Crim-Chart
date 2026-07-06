import { useStyles } from "@/core/hooks/useStyles";
import { useTheme } from '@react-navigation/native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActiveChannelCircle } from '@/channel/widgets/ActiveChannelCircle';
import { ChannelTagWrapper } from '@/components/wrappers/ChannelTagWrapper';
export interface TagCarouselItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  onTap?: () => void;
}
interface TagCarouselProps {
  cards: TagCarouselItem[];
  title?: string | null;
  trailingText?: string | null;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
  postId: string;
  sourceChannelId: string;
  linkChain?: string[];
  onTagSuccess?: () => void;
}
export const TagCarousel: React.FC<TagCarouselProps> = ({
  cards,
  title,
  trailingText,
  isLoadingMore = false,
  onEndReached,
  postId,
  sourceChannelId,
  linkChain = [],
  onTagSuccess
}) => {
  const styles = useStyles(colors => ({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 10
    },
    title: {
      color: 'rgba(255,255,255,0.95)',
      fontSize: 14,
      fontWeight: '900'
    },
    trailing: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 12,
      fontWeight: '700'
    },
    list: {
      paddingHorizontal: 20,
      paddingBottom: 4,
      alignItems: 'flex-start'
    },
    loadMore: {
      width: 48,
      alignItems: 'center',
      justifyContent: 'center'
    },
    tagButton: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1
    },
    tagButtonText: {
      fontSize: 11,
      fontWeight: '800'
    }
  }));
  const {
    colors,
    dark
  } = useTheme();
  const handleScroll = (e: any) => {
    if (!onEndReached) return;
    const {
      contentOffset,
      layoutMeasurement,
      contentSize
    } = e.nativeEvent;
    if (contentOffset.x + layoutMeasurement.width >= contentSize.width - 150) {
      onEndReached();
    }
  };
  return <View>
      {title && <View style={styles.header}>
          <Text style={[styles.title, {
        color: colors.text
      }]}>{title}</Text>
          {trailingText && <Text style={[styles.trailing, {
        color: colors.text,
        opacity: 0.5
      }]}>{trailingText}</Text>}
        </View>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list} onScroll={handleScroll} scrollEventThrottle={100} decelerationRate="fast"
    // ← no fixed height, let content define it
    >
        {cards.map(item => <View key={item.id} style={{
        marginRight: 18,
        alignItems: 'center'
      }}>
            <ActiveChannelCircle name={item.title} imageUrl={item.imageUrl} onTap={item.onTap} />
            <View style={{
          height: 6
        }} />
            <ChannelTagWrapper postId={postId} sourceChannelId={sourceChannelId} targetChannelId={item.id} linkChain={linkChain} onTagSuccess={onTagSuccess}>
              <TouchableOpacity style={[styles.tagButton, {
            backgroundColor: dark ? '#2A2A2A' : colors.background,
            borderColor: dark ? 'rgba(255,255,255,0.12)' : colors.border
          }]} activeOpacity={0.8}>
                <Text style={[styles.tagButtonText, {
              color: colors.text,
              opacity: 0.9
            }]}>Tag</Text>
              </TouchableOpacity>
            </ChannelTagWrapper>
          </View>)}
        {isLoadingMore && <View style={styles.loadMore}>
            <ActivityIndicator color="rgba(255,255,255,0.24)" />
          </View>}
      </ScrollView>
    </View>;
};