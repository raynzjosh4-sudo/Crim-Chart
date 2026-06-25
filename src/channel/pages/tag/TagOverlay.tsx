import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { TagCarousel } from './widgets/TagCarousel';
import { TagShimmer } from './widgets/TagShimmer';
import { useTheme } from '@react-navigation/native';
import { TagNoInternet } from './widgets/TagNoInternet';
import { createTag } from './tagService';
import { fetchUserTagChannels } from '@/features/channel/application/tagChannelService';

interface Channel {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
}

interface TagOverlayProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  sourceChannelId: string;
  linkChain: string[];
  channelName?: string | null;
}

type Status = 'loading' | 'loaded' | 'error';

export const TagOverlay: React.FC<TagOverlayProps> = ({
  visible,
  onClose,
  postId,
  sourceChannelId,
  linkChain,
  channelName,
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const channelsRef = useRef<Channel[]>([]);
  const { colors, dark } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
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
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
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
      console.error('[TagOverlay] loadChannels error:', e);
      setStatus('error');
    } finally {
      setIsLoadingMore(false);
    }
  }, []);



  const handleSeeAll = () => {
    onClose();
    // Use Expo Router to navigate to the file-based route
    import('expo-router').then(({ router }) => {
      router.push({
        pathname: '/tag-discovery' as any,
        params: {
          postId,
          sourceChannelId,
          linkChain: JSON.stringify(linkChain),
        },
      });
    });
  };

  const renderBody = () => {
    if (status === 'loading' && channels.length === 0) {
      return <TagShimmer />;
    }
    if (status === 'error' && channels.length === 0) {
      return <TagNoInternet onRetry={() => loadChannels(true)} />;
    }
    return (
      <TagCarousel
        cards={channels.map((c) => ({
          id: c.id,
          title: c.name,
          description: c.description,
          imageUrl: c.avatarUrl,
        }))}
        isLoadingMore={isLoadingMore}
        onEndReached={() => loadChannels(false)}
        postId={postId}
        sourceChannelId={sourceChannelId}
        linkChain={linkChain}
        onTagSuccess={onClose}
      />
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
          style={[styles.sheet, { transform: [{ scale: scaleAnim }], opacity: opacityAnim, backgroundColor: dark ? '#121212' : colors.card }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Body */}
          <View style={{ paddingTop: 16, paddingBottom: 8 }}>{renderBody()}</View>

          {/* Footer */}
          <TouchableOpacity activeOpacity={1} onPress={handleSeeAll} style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
          <View style={{ height: 16 }} />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#121212',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  headerRow: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  seeAllButton: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  seeAllText: {
    color: '#FACD11',
    fontSize: 15,
    fontWeight: '800',
  },
});
