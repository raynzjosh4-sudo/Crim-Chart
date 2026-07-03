import { useNetInfo } from '@react-native-community/netinfo';
import { Activity, WifiOff } from 'lucide-react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';

export const NetworkStatusBanner: React.FC = () => {
  const netInfo = useNetInfo();

  let currentState = 'online';

  if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
    currentState = 'offline';
  } else if (
    netInfo.type === 'cellular' &&
    (netInfo.details?.cellularGeneration === '2g' || netInfo.details?.cellularGeneration === '3g')
  ) {
    currentState = 'slow';
  } else if (Platform.OS === 'web' && typeof window !== 'undefined' && 'navigator' in window && 'connection' in navigator) {
    // @ts-ignore
    const effectiveType = navigator.connection.effectiveType;
    if (effectiveType === '2g' || effectiveType === '3g' || effectiveType === 'slow-2g') {
      currentState = 'slow';
    }
  }

  if (currentState === 'online') {
    return null;
  }

  const isOffline = currentState === 'offline';

  return (
    <View style={[styles.banner, { backgroundColor: isOffline ? '#E53935' : '#FFB300' }]}>
      {isOffline ? (
        <WifiOff size={16} color="#FFF" style={styles.icon} />
      ) : (
        <Activity size={16} color="#000" style={styles.icon} />
      )}
      <Text style={[styles.text, { color: isOffline ? '#FFF' : '#000' }]}>
        {isOffline
          ? "Oops! 🌐 No internet connection 📡"
          : "Slow connection 🐢. Content may take longer to load ⏳"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
