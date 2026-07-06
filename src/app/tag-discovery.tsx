import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { TagListTile } from '@/channel/pages/tag/widgets/TagListTile';
import { createTag, fetchTaggableChannels } from '@/channel/pages/tag/tagService';
interface Channel {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
}
type Status = 'loading' | 'loaded' | 'error';
export default function TagDiscoveryRoute() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: '#0D0D0D'
    },
    appBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: '#0D0D0D'
    },
    backBtn: {
      marginRight: 12,
      padding: 4
    },
    backArrow: {
      color: colors.text,
      fontSize: 30,
      fontWeight: '300'
    },
    appBarTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '900'
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0D0D0D'
    },
    errorText: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 16,
      marginBottom: 12
    },
    retryText: {
      color: '#FACD11',
      fontWeight: '800',
      fontSize: 15
    },
    separator: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.05)',
      marginLeft: 92
    }
  }));
  const params = useLocalSearchParams<{
    postId: string;
    sourceChannelId: string;
    linkChain: string;
  }>();
  const postId = params.postId ?? '';
  const sourceChannelId = params.sourceChannelId ?? '';
  const linkChain: string[] = params.linkChain ? JSON.parse(params.linkChain) : [];
  const [channels, setChannels] = useState<Channel[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const channelsRef = useRef<Channel[]>([]);
  const load = useCallback(async (reset = false) => {
    if (!hasMoreRef.current && !reset) return;
    if (reset) setStatus('loading');else setIsLoadingMore(true);
    try {
      const page = reset ? 0 : pageRef.current;
      const data = await fetchTaggableChannels({
        limit: 20,
        offset: page * 20
      });
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
      console.error('[TagDiscoveryRoute] load error:', e);
      setStatus('error');
    } finally {
      setIsLoadingMore(false);
    }
  }, []);
  useEffect(() => {
    load(true);
  }, []);
  const handleTagSuccess = () => {
    router.back();
  };
  if (status === 'loading' && channels.length === 0) {
    return <View style={styles.centered}>
        <ActivityIndicator color="rgba(255,255,255,0.4)" />
      </View>;
  }
  if (status === 'error' && channels.length === 0) {
    return <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load channels</Text>
        <TouchableOpacity activeOpacity={1} onPress={() => load(true)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>;
  }
  return <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Tag Options</Text>
      </View>

      <FlatList data={channels} keyExtractor={item => item.id} renderItem={({
      item
    }) => <TagListTile title={item.name} subtitle={item.description} imageUrl={item.avatarUrl} buttonText="Tag" postId={postId} sourceChannelId={sourceChannelId} targetChannelId={item.id} linkChain={linkChain} onTagSuccess={handleTagSuccess} />} ItemSeparatorComponent={() => <View style={styles.separator} />} contentContainerStyle={{
      paddingTop: 12,
      paddingBottom: 40
    }} onEndReached={() => load(false)} onEndReachedThreshold={0.3} ListFooterComponent={isLoadingMore ? <View style={{
      padding: 20,
      alignItems: 'center'
    }}>
              <ActivityIndicator color="rgba(255,255,255,0.24)" />
            </View> : null} />
    </View>;
}