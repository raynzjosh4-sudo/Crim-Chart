import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

interface Props { postId?: string; channelId?: string; }

export default function ChannelPostDetailPage({ postId }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Post" />
      <ScrollView />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
