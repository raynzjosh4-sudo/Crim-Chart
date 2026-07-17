import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Hash } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useExploreStore } from '@/channel/store/useExploreStore';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

export const ChannelButton = () => {
  const router = useRouter();
  const { startLoading } = useGlobalProgress();

  return (
    <TouchableOpacity activeOpacity={1} 
      onPress={() => {
        const { width } = Dimensions.get('window');
        if (Platform.OS === 'web' && width >= 768) {
          useExploreStore.getState().openExplore();
        } else {
          startLoading();
          setTimeout(() => {
            router.push('/channel/explore');
          }, 100);
        }
      }} 
      style={styles.container}
    >
      <Hash color="#FFF" size={14} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    borderColor: '#FACD11',
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'center',
  },
});
