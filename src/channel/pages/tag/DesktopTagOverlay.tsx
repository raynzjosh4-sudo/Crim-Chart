import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { TagShimmer } from './widgets/TagShimmer';
import { TagNoInternet } from './widgets/TagNoInternet';
import { fetchUserTagChannels } from '@/features/channel/application/tagChannelService';
import { X } from 'lucide-react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { ActiveChannelCircle } from '@/channel/widgets/ActiveChannelCircle';
import { ChannelTagWrapper } from '@/components/wrappers/ChannelTagWrapper';

interface Channel {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
}

interface DesktopTagOverlayProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  sourceChannelId: string;
  linkChain: string[];
}

type Status = 'loading' | 'loaded' | 'error';

export const DesktopTagOverlay: React.FC<DesktopTagOverlayProps> = ({
  visible,
  onClose,
  postId,
  sourceChannelId,
  linkChain,
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const channelsRef = useRef<Channel[]>([]);
  
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const { colors, isDark } = theme;

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setChannels([]);
      setStatus('loading');
      pageRef.current = 0;
      hasMoreRef.current = true;
      loadChannels(true);

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const loadChannels = useCallback(async (reset = false) => {
    if (!hasMoreRef.current && !reset) return;
    if (reset) {
      setIsLoadingMore(false);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const page = reset ? 0 : pageRef.current;
      const data = await fetchUserTagChannels({ limit: 20, offset: page * 20 });
      if (reset) {
        channelsRef.current = data;
      } else {
        channelsRef.current = [...channelsRef.current, ...data];
      }
      setChannels(channelsRef.current);
      hasMoreRef.current = data.length === 20;
      pageRef.current = page + 1;
      setStatus('loaded');
    } catch (e) {
      console.error('[DesktopTagOverlay] loadChannels error:', e);
      setStatus('error');
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  const renderBody = () => {
    if (status === 'loading' && channels.length === 0) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    if (status === 'error' && channels.length === 0) {
      return <TagNoInternet onRetry={() => loadChannels(true)} />;
    }

    const handleScroll = (e: any) => {
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 150) {
        loadChannels(false);
      }
    };

    return (
      <ScrollView 
        style={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.verticalGrid}>
          {channels.map((c) => (
            <View key={c.id} style={styles.tagItem}>
              <ActiveChannelCircle
                name={c.name}
                imageUrl={c.avatarUrl}
              />
              <View style={{ height: 8 }} />
              <ChannelTagWrapper
                postId={postId}
                sourceChannelId={sourceChannelId}
                targetChannelId={c.id}
                linkChain={linkChain}
                onTagSuccess={onClose}
              >
                <TouchableOpacity
                  style={[
                    styles.tagButton,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : colors.background,
                      borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.surfaceVariant,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tagButtonText, { color: colors.text }]}>Tag</Text>
                </TouchableOpacity>
              </ChannelTagWrapper>
            </View>
          ))}
        </View>
        {isLoadingMore && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.card,
            { 
              transform: [{ scale: scaleAnim }], 
              opacity: opacityAnim, 
            }
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tag Channel</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text} opacity={0.6} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {renderBody()}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start' as const,
    alignItems: 'flex-end' as const,
    paddingTop: 80 * scale,
    paddingRight: 20 * scale,
  },
  card: {
    width: 350 * scale,
    height: '80%',
    maxHeight: 700 * scale,
    borderRadius: 20 * scale,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 * scale },
    shadowOpacity: 0.3,
    shadowRadius: 30 * scale,
    elevation: 20,
    overflow: 'hidden' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 24 * scale,
    paddingVertical: 16 * scale,
  },
  title: {
    fontSize: 18 * scale,
    fontWeight: '800' as const,
    color: colors.text,
  },
  closeBtn: {
    padding: 4 * scale,
  },
  body: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  verticalGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: 16 * scale,
  },
  tagItem: {
    width: '33.33%',
    alignItems: 'center' as const,
    marginBottom: 20 * scale,
  },
  tagButton: {
    paddingHorizontal: 12 * scale,
    paddingVertical: 5 * scale,
    borderRadius: 999 * scale,
    borderWidth: 1,
  },
  tagButtonText: {
    fontSize: 11 * scale,
    fontWeight: '800' as const,
  },
});
