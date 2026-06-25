import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { TagListTile } from './widgets/TagListTile';
import { createTag } from './tagService';
import { fetchUserTagChannels } from '@/features/channel/application/tagChannelService';
import { ChannelListSkeleton } from '@/components/skeletons/Skeletons';

interface Channel {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
}

type Status = 'loading' | 'loaded' | 'error';

export const TagDiscoveryPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute() as any;
  const { postId, sourceChannelId, linkChain = [] } = route.params ?? {};
  const { colors, dark } = useTheme();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const channelsRef = useRef<Channel[]>([]);

  const load = useCallback(async (reset = false) => {
    if (!hasMoreRef.current && !reset) return;
    if (reset) setStatus('loading');
    else setIsLoadingMore(true);

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
      console.error('[TagDiscoveryPage] load error:', e);
      setStatus('error');
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, []);



  if (status === 'loading' && channels.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.appBar, { backgroundColor: colors.background }]}>
          <TouchableOpacity activeOpacity={1} onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.text }]}>Tag Options</Text>
        </View>
        <ChannelListSkeleton count={8} />
      </View>
    );
  }

  if (status === 'error' && channels.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorText, { color: colors.text, opacity: 0.5 }]}>Failed to load channels</Text>
        <TouchableOpacity activeOpacity={1} onPress={() => load(true)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* App Bar */}
      <View style={[styles.appBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity activeOpacity={1} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.appBarTitle, { color: colors.text }]}>Tag Options</Text>
      </View>

      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TagListTile
            title={item.name}
            subtitle={item.description}
            imageUrl={item.avatarUrl}
            buttonText="Tag"
            postId={postId}
            sourceChannelId={sourceChannelId}
            targetChannelId={item.id}
            linkChain={linkChain}
            onTagSuccess={() => navigation.goBack()}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={() => load(false)}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ paddingTop: 10 }}>
              <ChannelListSkeleton count={2} />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#0D0D0D',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  backArrow: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
  },
  appBarTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0D',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginBottom: 12,
  },
  retryText: {
    color: '#FACD11',
    fontWeight: '800',
    fontSize: 15,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 92,
  },
});
