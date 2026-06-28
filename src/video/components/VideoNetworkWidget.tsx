import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

export const VideoNetworkWidget: React.FC = () => {
  const netInfo = useNetInfo();

  // Show if explicitly disconnected or explicitly unreachable
  // We ignore `null` to avoid flashing on initial load
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <WifiOff size={16} color="#fff" style={styles.icon} />
      <Text style={styles.text}>Slow or No Internet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below typical status bar
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 60, 60, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
