import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';

export default function SignupLayout() {
  const router = useRouter();

  if (Platform.OS === 'web') {
    return (
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => router.push('/' as any)} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' }, animation: 'none' }} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }} />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
});
