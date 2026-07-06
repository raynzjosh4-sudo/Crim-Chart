import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
interface Props {
  channelId?: string;
}
export default function ChannelDetailsPage({
  channelId
}: Props) {
  const styles = useStyles(colors => ({
    container: {
      flex: 1
    }
  }));
  const {
    colors
  } = useTheme();
  return <View style={[styles.container, {
    backgroundColor: colors.background
  }]}>
      <ChartAppBar title="Channel Details" />
      <Text style={{
      color: colors.text,
      textAlign: 'center',
      marginTop: 40
    }}>Channel {channelId}</Text>
    </View>;
}