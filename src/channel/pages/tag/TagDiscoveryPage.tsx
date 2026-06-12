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
import { TagListTile } from './widgets/TagListTile';
import { createTag, fetchTaggableChannels } from './tagService';

interface Channel {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
}

type Status = 'loading' | 'loaded' | 'error';

export const TagDiscoveryPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { postId, sourceChannelId, linkChain = [] } = route.params ?? {};

  const [channels, setChannels] = useState<Channel[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);

  const load = useCallback(async (reset = false) => {
    if (!hasMoreRef.current && !reset) return;
    if (reset) setStatus('loading');
    else setIsLoadingMore(true);

    try {
      const page = reset ? 0 : pageRef.current;
      const data = await fetchTaggableChannels({ limit: 20, offset: page * 20 });
      setChannels((prev) => (reset ? data : [...prev, ...data]));
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

  const handleTagTap = async (targetChannelId: string) => {
    try {
      await createTag({
        postId,
        sourceChannelId,
        targetChannelId,
        linkChain: [...linkChain, targetChannelId],
      });
    } catch (e) {
      console.error('[TagDiscoveryPage] createTag error:', e);
    }
    navigation.goBack();
  };

  if (status === 'loading' && channels.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="rgba(255,255,255,0.24)" />
      </View>
    );
  }

  if (status === 'error' && channels.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Failed to load channels</Text>
        <TouchableOpacity onPress={() => load(true)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Tag Options</Text>
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
            onTap={() => handleTagTap(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
        onEndReached={() => load(false)}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator color="rgba(255,255,255,0.24)" strokeWidth={2} />
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
