import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import VideoFeedList, { VideoData } from '../components/video/VideoFeedList';

// Free, public HLS streams for testing
const testVideos: VideoData[] = [{
  id: '1',
  // Big Buck Bunny HLS
  url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
}, {
  id: '2',
  // Apple basic stream
  url: 'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8'
}, {
  id: '3',
  // Another test stream
  url: 'https://test-streams.mux.dev/pts_shift/master.m3u8'
}];
export default function TestFeedScreen() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    }
  }));
  return <View style={styles.container}>
      <Stack.Screen options={{
      title: 'TikTok Engine Test',
      headerShown: false
    }} />
      <VideoFeedList videos={testVideos} />
    </View>;
}