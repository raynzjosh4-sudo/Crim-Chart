import React, { useState, useCallback, useRef } from 'react';
import { FlatList, ViewToken, Dimensions, StyleSheet, View } from 'react-native';
import VideoFeedItem from './VideoFeedItem';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export interface VideoData {
  id: string;
  url: string; // HLS .m3u8 stream URL
  // You can extend this to include author, title, likes, etc.
}

interface VideoFeedListProps {
  videos: VideoData[];
  height?: number; // Override FlatList height
}

export default function VideoFeedList({ videos, height = WINDOW_HEIGHT }: VideoFeedListProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(videos.length > 0 ? videos[0].id : null);

  // Configuration for when an item is considered "in view"
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60, // 60% of the item must be visible to trigger
  }).current;

  // Callback to update the currently playing video based on scroll
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      // The first significantly visible item becomes the active video
      setActiveVideoId(viewableItems[0].item.id);
    }
  }, []);

  const renderItem = ({ item }: { item: VideoData }) => {
    return (
      <VideoFeedItem 
        manifestUrl={item.url} 
        isActive={item.id === activeVideoId} 
        height={height}
      />
    );
  };

  return (
    <View style={{ height }}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled // Snaps perfectly to each video
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        
        // Performance optimizations for rapid scrolling
        windowSize={5} 
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
      />
    </View>
  );
}
