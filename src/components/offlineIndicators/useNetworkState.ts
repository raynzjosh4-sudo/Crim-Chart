import { useNetInfo } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export type NetworkState = 'online' | 'offline' | 'slow';

export function useNetworkState(overrideState?: NetworkState): NetworkState {
  const netInfo = useNetInfo();
  
  if (overrideState) {
    return overrideState;
  }

  if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
    return 'offline';
  }
  
  if (netInfo.type === 'cellular' && (netInfo.details?.cellularGeneration === '2g' || netInfo.details?.cellularGeneration === '3g')) {
    return 'slow';
  }
  
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'connection' in navigator) {
    // @ts-ignore
    const effectiveType = navigator.connection?.effectiveType;
    if (effectiveType === '2g' || effectiveType === '3g' || effectiveType === 'slow-2g') {
      return 'slow';
    }
  }
  
  return 'online';
}
