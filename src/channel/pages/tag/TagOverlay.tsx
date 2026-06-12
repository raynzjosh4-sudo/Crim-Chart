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
import { router } from 'expo-router';
import { TagCarousel } from './widgets/TagCarousel';
import { TagShimmer } from './widgets/TagShimmer';
import { TagNoInternet } from './widgets/TagNoInternet';
import { createTag, fetchTaggableChannels } from './tagService';

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
      const data = await fetchTaggableChannels({ limit: 20, offset: page * 20 });
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

  const handleTagTap = async (targetChannelId: string) => {
    try {
      await createTag({
        postId,
        sourceChannelId,
        targetChannelId,
        linkChain: [...linkChain, targetChannelId],
      });
    } catch (e) {
      console.error('[TagOverlay] createTag error:', e);
    }
    onClose();
  };

  const handleSeeAll = () => {
    onClose();
    // Use Expo Router to navigate to the file-based route
    router.push({
      pathname: '/tag-discovery' as any,
      params: {
        postId,
        sourceChannelId,
        linkChain: JSON.stringify(linkChain),
      },
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
          onTap: () => handleTagTap(c.id),
        }))}
        isLoadingMore={isLoadingMore}
        onEndReached={() => loadChannels(false)}
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
          style={[styles.sheet, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={{ height: 24 }} />
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Tag Options</Text>
          </View>

          {/* Body */}
          <View style={{ paddingVertical: 16 }}>{renderBody()}</View>

          {/* Footer */}
          <TouchableOpacity onPress={handleSeeAll} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
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
