import { Image } from 'expo-image';
import { createVideoPlayer, VideoPlayer, VideoView } from 'expo-video';
import { ArrowLeft, Download, MessageCircle, Search, Share2, ThumbsUp, Tag, Eye } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, ListRenderItemInfo, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Isolated video player ────────────────────────────────────────────────────
// Wrapped in React.memo so it NEVER re-renders when listData / renderItem change.
// On Android, even re-calling useVideoPlayer with the same URL can interrupt
// hardware codec playback, so we must ensure this sub-tree is completely stable.
interface VideoPlayerSectionProps {
  videoUrl: string;
  style: any;
  containerStyle: any;
  shouldPlay: boolean;
}
const VideoPlayerSection = React.memo(({ videoUrl, style, containerStyle, shouldPlay }: VideoPlayerSectionProps) => {
  const playerRef = useRef<VideoPlayer | null>(null);
  if (!playerRef.current) {
    const p = createVideoPlayer(videoUrl);
    p.loop = true;
    // Do NOT call p.play() here — the Modal animation hasn't finished yet.
    // Play is triggered by shouldPlay becoming true (via Modal onShow).
    playerRef.current = p;
  }

  // Start/stop playback based on whether the modal is fully open
  useEffect(() => {
    if (shouldPlay) {
      playerRef.current?.play();
    } else {
      playerRef.current?.pause();
    }
  }, [shouldPlay]);

  // Pause when unmounted (modal closed)
  useEffect(() => {
    return () => { playerRef.current?.pause(); };
  }, []);

  return (
    <View style={containerStyle}>
      <VideoView
        player={playerRef.current!}
        style={style}
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
});
// ─────────────────────────────────────────────────────────────────────────────

export interface LongVideoPlayerLayoutProps {
  videoUrl: string;
  title: string;
  director: string;
  description: string;
  isLocal: boolean;
  onClose: () => void;
  // Raw data + renderer — avoids passing a JSX element that remounts on every parent re-render
  listData: any[];
  renderItem: (info: ListRenderItemInfo<any>) => React.ReactElement | null;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const LongVideoPlayerLayout = ({
  videoUrl,
  title,
  director,
  description,
  isLocal,
  onClose,
  listData,
  renderItem,
  onLoadMore,
  isLoadingMore,
}: LongVideoPlayerLayoutProps) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [localDirector, setLocalDirector] = useState(director);
  const [localDescription, setLocalDescription] = useState(description);
  const [isLiked, setIsLiked] = useState(false);
  // Only start playback after the slide-in animation has fully completed.
  const [isReady, setIsReady] = useState(false);

  // useCallback ensures renderHeader reference is stable — prevents FlatList
  // from re-mounting the header on every parent re-render.
  const renderHeader = useCallback(() => (
    <View style={{ paddingBottom: 16 }}>
      {/* Video Details */}
      <View style={styles.detailsContainer}>
        {/* User Row (Avatar + Username) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop' }}
            style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
          />
          {isLocal ? (
            <TextInput
              style={[styles.videoTitle, styles.inputField, { flex: 1, marginTop: 0, paddingVertical: 0, borderBottomWidth: 0 }]}
              value={localDirector}
              onChangeText={setLocalDirector}
              placeholder="Username"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          ) : (
            <Text style={[styles.videoTitle, { flex: 1 }]} numberOfLines={1}>{director}</Text>
          )}
          {!isLocal && (
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description Box */}
        <View style={styles.descriptionBox}>
          {isLocal ? (
            <TextInput
              style={[styles.descriptionText, styles.inputField]}
              value={localDescription}
              onChangeText={setLocalDescription}
              placeholder="Add a description..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
            />
          ) : (
            <Text style={styles.descriptionText}>{description}</Text>
          )}
        </View>

        {/* Actions Row */}
        {!isLocal && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
            <TouchableOpacity
              style={[styles.actionBadge, isLiked && { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => setIsLiked(!isLiked)}
            >
              <ThumbsUp color={isLiked ? '#4A90E2' : '#FFF'} size={18} />
              <Text style={[styles.actionText, isLiked && { color: '#4A90E2' }]}>12K</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBadge}>
              <MessageCircle color="#FFF" size={18} />
              <Text style={styles.actionText}>4K</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBadge}>
              <Tag color="#FFF" size={18} />
              <Text style={styles.actionText}>Tag</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBadge}>
              <Eye color="#FFF" size={18} />
              <Text style={styles.actionText}>1.2M</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  ), [localTitle, localDirector, localDescription, isLocal, isLiked, title, director, description]);

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setIsReady(true)}
    >
      <SafeAreaView style={styles.container}>
        {/* Top bar (Back, Search) — must sit above the collapsible header */}
        <View style={[styles.header, { zIndex: 20, backgroundColor: '#000' }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}></Text>
          <TouchableOpacity style={styles.searchBtn}>
            <Search color="#FFF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Video Player — must sit above the collapsible header so it hides behind it */}
        <VideoPlayerSection
          videoUrl={videoUrl}
          containerStyle={[styles.videoContainer, { zIndex: 20, backgroundColor: '#000' }]}
          style={styles.videoPlayer}
          shouldPlay={isReady}
        />

        {/* Stable FlatList — owned by this component so data updates don't remount it */}
        <FlatList
          data={listData}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="large" color="#4A90E2" />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.1}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  searchBtn: {
    padding: 4,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  videoSubtitle: {
    color: '#AAAAAA',
    fontSize: 13,
    marginTop: 4,
  },
  actionsScroll: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  actionText: {
    color: '#FFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#333',
  },
  channelName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subCount: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  followText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  descriptionBox: {
    marginTop: 4,
    marginBottom: 8,
  },
  descriptionText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 2,
    marginTop: 2,
  },
});
