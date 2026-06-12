import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';

export default function ChannelSettingsPage() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChartAppBar title="Channel Settings" />
      <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>Settings coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
