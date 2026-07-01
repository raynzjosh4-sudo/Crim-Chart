import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { ComposerWidget } from '@/components/composer/ComposerWidget';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPostPage() {
  const theme = useCurrentTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ChartAppBar title="" showBack={true} />
      <ComposerWidget />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
